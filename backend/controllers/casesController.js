const TroubleshootingCase = require('../models/TroubleshootingCase');
const DiagnosisHistory = require('../models/DiagnosisHistory');

/**
 * Escapes all regular expression metacharacters in a string
 * to prevent ReDoS and regex syntax errors in MongoDB queries.
 */
function escapeRegex(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/cases
const getCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      severity,
      status,
      osi_layer,
      search,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (osi_layer) {
      const safeOsi = escapeRegex(osi_layer.trim());
      filter['ai_diagnosis.osi_layer'] = { $regex: safeOsi, $options: 'i' };
    }
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { symptoms: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const total = await TroubleshootingCase.countDocuments(filter);
    const cases = await TroubleshootingCase.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-show_commands');

    res.json({
      success: true,
      data: cases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/cases/:id
const getCaseById = async (req, res) => {
  try {
    const c = await TroubleshootingCase.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/cases
const createCase = async (req, res) => {
  try {
    const c = new TroubleshootingCase(req.body);
    await c.save();
    res.status(201).json({ success: true, data: c });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// PUT /api/cases/:id
const updateCase = async (req, res) => {
  try {
    const c = await TroubleshootingCase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!c) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, data: c });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE /api/cases/:id
const deleteCase = async (req, res) => {
  try {
    const c = await TroubleshootingCase.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, message: 'Case deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getCases, getCaseById, createCase, updateCase, deleteCase };
