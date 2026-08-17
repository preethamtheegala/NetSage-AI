const { runRuleChecker } = require('../services/pythonCheckerService');

// POST /api/rule-checker
const checkRules = async (req, res) => {
  try {
    const result = await runRuleChecker(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { checkRules };
