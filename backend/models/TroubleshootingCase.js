const mongoose = require('mongoose');

const ShowCommandSchema = new mongoose.Schema({
  command: { type: String, required: true },
  output: { type: String, required: true },
});

const AIDiagnosisSchema = new mongoose.Schema({
  root_cause: String,
  confidence: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  confidence_score: { type: Number, min: 0, max: 100 },
  osi_layer: String,
  evidence: [String],
  next_command: String,
  fix_steps: [String],
  alternative_causes: [String],
  generated_at: { type: Date, default: Date.now },
  provider: { type: String, default: 'mock' },
});

const RuleCheckerResultSchema = new mongoose.Schema({
  checks: [mongoose.Schema.Types.Mixed],
  rule_errors: [String],
  rule_warnings: [String],
  passed: [String],
  overall_status: { type: String, enum: ['pass', 'warning', 'fail', 'error'], default: 'pass' },
  run_at: { type: Date, default: Date.now },
}, { suppressReservedKeysWarning: true });

const HumanReviewSchema = new mongoose.Schema({
  decision: { type: String, enum: ['pending', 'accepted', 'edited', 'rejected'], default: 'pending' },
  reviewer: { type: String, default: 'Reviewer' },
  original_ai_response: mongoose.Schema.Types.Mixed,
  corrected_response: mongoose.Schema.Types.Mixed,
  explanation: String,
  reviewed_at: Date,
});

const TroubleshootingCaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['VLAN', 'Gateway', 'DHCP', 'DNS', 'Routing', 'ACL', 'NAT', 'Wireless', 'Other'],
      required: true,
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    device_type: { type: String, trim: true },
    source_device: { type: String, trim: true },
    destination_device: { type: String, trim: true },
    symptoms: { type: String, required: true },
    topology_notes: String,
    show_commands: [ShowCommandSchema],
    expected_fault: String,
    expected_osi_layer: String,
    concept_tag: [String],
    ai_diagnosis: AIDiagnosisSchema,
    rule_checker_result: RuleCheckerResultSchema,
    human_review: HumanReviewSchema,
    final_diagnosis: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['open', 'diagnosing', 'awaiting_review', 'approved', 'edited', 'rejected', 'fixed', 'verified'],
      default: 'open',
    },
    is_sample: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true }
);

TroubleshootingCaseSchema.index({ category: 1, severity: 1, status: 1 });
TroubleshootingCaseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TroubleshootingCase', TroubleshootingCaseSchema);
