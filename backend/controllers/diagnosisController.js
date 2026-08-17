const TroubleshootingCase = require('../models/TroubleshootingCase');
const DiagnosisHistory = require('../models/DiagnosisHistory');
const { runDiagnosis, validateDiagnosisOutput } = require('../services/aiDiagnosisService');
const { runRuleChecker } = require('../services/pythonCheckerService');

// POST /api/diagnosis
const runFullDiagnosis = async (req, res) => {
  const start = Date.now();
  try {
    const { case_id, ...input } = req.body;

    // Run AI diagnosis
    let aiResult;
    try {
      aiResult = await runDiagnosis(input);
      aiResult = validateDiagnosisOutput(aiResult);
    } catch (aiErr) {
      return res.status(500).json({ success: false, error: `AI diagnosis failed: ${aiErr.message}` });
    }

    // Run Rule Checker
    let ruleResult;
    try {
      ruleResult = await runRuleChecker(input);
    } catch (ruleErr) {
      ruleResult = { overall_status: 'error', error: ruleErr.message, checks: [], errors: [], warnings: [], passed: [] };
    }

    // If case_id provided, update the case
    if (case_id) {
      await TroubleshootingCase.findByIdAndUpdate(case_id, {
        ai_diagnosis: aiResult,
        rule_checker_result: ruleResult,
        status: 'awaiting_review',
        'human_review.decision': 'pending',
      });
    }

    res.json({
      success: true,
      data: {
        ai_diagnosis: aiResult,
        rule_checker_result: ruleResult,
        duration_ms: Date.now() - start,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/diagnosis/:id
const getDiagnosisById = async (req, res) => {
  try {
    const c = await TroubleshootingCase.findById(req.params.id).select('ai_diagnosis rule_checker_result status');
    if (!c) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { runFullDiagnosis, getDiagnosisById };
