const TroubleshootingCase = require('../models/TroubleshootingCase');
const DiagnosisHistory = require('../models/DiagnosisHistory');

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCases,
      diagnosedCases,
      accepted,
      edited,
      rejected,
      highSeverity,
      byCategory,
      byStatus,
      recentCases,
      confidenceAgg,
    ] = await Promise.all([
      TroubleshootingCase.countDocuments(),
      TroubleshootingCase.countDocuments({ status: { $in: ['approved', 'edited', 'rejected', 'fixed', 'verified'] } }),
      TroubleshootingCase.countDocuments({ 'human_review.decision': 'accepted' }),
      TroubleshootingCase.countDocuments({ 'human_review.decision': 'edited' }),
      TroubleshootingCase.countDocuments({ 'human_review.decision': 'rejected' }),
      TroubleshootingCase.countDocuments({ severity: { $in: ['high', 'critical'] } }),
      TroubleshootingCase.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      TroubleshootingCase.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      TroubleshootingCase.find().sort({ createdAt: -1 }).limit(5).select('title category severity status createdAt'),
      TroubleshootingCase.aggregate([
        { $match: { 'ai_diagnosis.confidence_score': { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$ai_diagnosis.confidence_score' } } },
      ]),
    ]);

    const reviewed = accepted + edited + rejected;
    const agreementRate = reviewed > 0 ? Math.round((accepted / reviewed) * 100) : 0;
    const avgConfidence = confidenceAgg.length > 0 ? Math.round(confidenceAgg[0].avg) : 0;

    // OSI Layer distribution from history
    const byOsiLayer = await DiagnosisHistory.aggregate([
      { $group: { _id: '$osi_layer', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total_cases: totalCases,
          diagnosed_cases: diagnosedCases,
          accepted,
          edited,
          rejected,
          high_severity: highSeverity,
          agreement_rate: agreementRate,
          avg_confidence: avgConfidence,
        },
        by_category: byCategory.map((b) => ({ name: b._id, value: b.count })),
        by_status: byStatus.map((b) => ({ name: b._id, value: b.count })),
        by_osi_layer: byOsiLayer.map((b) => ({ name: b._id || 'Unknown', value: b.count })),
        recent_cases: recentCases,
        review_decisions: [
          { name: 'Accepted', value: accepted },
          { name: 'Edited', value: edited },
          { name: 'Rejected', value: rejected },
        ],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics
const getAnalytics = async (req, res) => {
  try {
    const [history, severityDist, monthlyTrend] = await Promise.all([
      DiagnosisHistory.find().sort({ createdAt: -1 }).limit(50),
      TroubleshootingCase.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      TroubleshootingCase.aggregate([
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        history,
        severity_distribution: severityDist.map((s) => ({ name: s._id, value: s.count })),
        monthly_trend: monthlyTrend.map((m) => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          count: m.count,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/responsible-ai
const getResponsibleAI = async (req, res) => {
  try {
    const [corrected, stats] = await Promise.all([
      TroubleshootingCase.find({ 'human_review.decision': { $in: ['edited', 'rejected'] } })
        .sort({ 'human_review.reviewed_at': -1 })
        .limit(20)
        .select('title category severity ai_diagnosis human_review final_diagnosis createdAt'),
      DiagnosisHistory.aggregate([
        {
          $group: {
            _id: '$human_decision',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const total = stats.reduce((s, i) => s + i.count, 0);
    const acceptedCount = stats.find((s) => s._id === 'accepted')?.count || 0;
    const editedCount = stats.find((s) => s._id === 'edited')?.count || 0;
    const rejectedCount = stats.find((s) => s._id === 'rejected')?.count || 0;

    res.json({
      success: true,
      data: {
        corrected_cases: corrected,
        stats: {
          total_reviewed: total,
          accepted: acceptedCount,
          edited: editedCount,
          rejected: rejectedCount,
          correction_rate: total > 0 ? Math.round(((editedCount + rejectedCount) / total) * 100) : 0,
          agreement_rate: total > 0 ? Math.round((acceptedCount / total) * 100) : 0,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getDashboardStats, getAnalytics, getResponsibleAI };
