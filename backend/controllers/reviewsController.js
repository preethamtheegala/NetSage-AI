const TroubleshootingCase = require('../models/TroubleshootingCase');
const DiagnosisHistory = require('../models/DiagnosisHistory');

// POST /api/reviews
const submitReview = async (req, res) => {
  try {
    const { case_id, decision, reviewer, corrected_response, explanation } = req.body;

    if (!case_id || !decision) {
      return res.status(400).json({ success: false, error: 'case_id and decision are required' });
    }

    if (!['accepted', 'edited', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'decision must be accepted, edited, or rejected' });
    }

    if ((decision === 'edited' || decision === 'rejected') && !explanation) {
      return res.status(400).json({ success: false, error: 'explanation required for edited or rejected decisions' });
    }

    const c = await TroubleshootingCase.findById(case_id);
    if (!c) return res.status(404).json({ success: false, error: 'Case not found' });

    const originalAI = c.ai_diagnosis;

    // Build final diagnosis
    let finalDiagnosis = { ...originalAI };
    if (decision === 'edited' && corrected_response) {
      finalDiagnosis = { ...finalDiagnosis, ...corrected_response };
    }

    const statusMap = { accepted: 'approved', edited: 'edited', rejected: 'rejected' };

    c.human_review = {
      decision,
      reviewer: reviewer || 'Reviewer',
      original_ai_response: originalAI,
      corrected_response: decision === 'edited' ? corrected_response : null,
      explanation: explanation || '',
      reviewed_at: new Date(),
    };
    c.final_diagnosis = finalDiagnosis;
    c.status = statusMap[decision];
    await c.save();

    // Store in history
    const aiWasCorrect = decision === 'accepted';
    await DiagnosisHistory.create({
      case_id: c._id,
      case_title: c.title,
      category: c.category,
      severity: c.severity,
      osi_layer: finalDiagnosis.osi_layer,
      ai_diagnosis: originalAI,
      human_decision: decision,
      final_root_cause: finalDiagnosis.root_cause,
      confidence: finalDiagnosis.confidence,
      confidence_score: finalDiagnosis.confidence_score,
      reviewer: reviewer || 'Reviewer',
      explanation: explanation || '',
      ai_was_correct: aiWasCorrect,
      correction_reason: !aiWasCorrect ? explanation : null,
    });

    res.json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const { decision, page = 1, limit = 10 } = req.query;
    const filter = { 'human_review.decision': { $ne: 'pending', $exists: true } };
    if (decision) filter['human_review.decision'] = decision;

    const total = await TroubleshootingCase.countDocuments(filter);
    const cases = await TroubleshootingCase.find(filter)
      .sort({ 'human_review.reviewed_at': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('title category severity status human_review ai_diagnosis final_diagnosis createdAt');

    res.json({ success: true, data: cases, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/reviews/pending
const getPendingReviews = async (req, res) => {
  try {
    const cases = await TroubleshootingCase.find({ status: 'awaiting_review' })
      .sort({ createdAt: -1 })
      .select('title category severity status ai_diagnosis rule_checker_result createdAt');
    res.json({ success: true, data: cases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { submitReview, getReviews, getPendingReviews };
