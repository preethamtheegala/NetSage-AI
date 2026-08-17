const mongoose = require('mongoose');

const DiagnosisHistorySchema = new mongoose.Schema(
  {
    case_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TroubleshootingCase' },
    case_title: String,
    category: String,
    severity: String,
    osi_layer: String,
    ai_diagnosis: mongoose.Schema.Types.Mixed,
    human_decision: { type: String, enum: ['accepted', 'edited', 'rejected'] },
    final_root_cause: String,
    confidence: String,
    confidence_score: Number,
    reviewer: String,
    explanation: String,
    ai_was_correct: Boolean,
    correction_reason: String,
    duration_ms: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiagnosisHistory', DiagnosisHistorySchema);
