const { improveItemDescription } = require('../services/aiService');

// POST /api/ai/improve-description
const improveDescription = async (req, res, next) => {
  try {
    const { description, category, condition } = req.body;
    
    if (!description) {
      res.status(400);
      throw new Error('Description string is required in request body');
    }

    const improved = await improveItemDescription(description, category, condition);

    res.json({
      success: true,
      original: description,
      improved: improved
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  improveDescription,
};
