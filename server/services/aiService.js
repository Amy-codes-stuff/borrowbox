/**
 * AI Service for improving item listing descriptions
 */
const improveItemDescription = async (rawText, category = 'General', condition = 'Good') => {
  const apiKey = process.env.AI_API_KEY;

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Please provide an initial description text to improve.');
  }

  const promptText = `Refine and improve this campus item description to sound professional, clear, and attractive for campus peer-to-peer lending: "${rawText}". Category: ${category}, Condition: ${condition}.`;

  // If AI_API_KEY is available in environment, try calling Google Gemini REST API
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          return generatedText.trim();
        }
      }
    } catch (err) {
      console.warn('[AI Service] External API call failed or key invalid, using fallback enhancer:', err.message);
    }
  }

  // Graceful rule-based smart enhancer fallback
  return fallbackEnhancer(rawText, category, condition);
};

const fallbackEnhancer = (text, category, condition) => {
  const trimmed = text.trim();
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  const cleanText = capitalized.endsWith('.') ? capitalized : `${capitalized}.`;

  const conditionDesc = {
    'New': 'Brand new and unused in original condition.',
    'Like New': 'In pristine, like-new condition with minimal to no signs of wear.',
    'Good': 'In good working condition, fully functional and well cared for.',
    'Fair': 'Fully functional with normal signs of cosmetic wear from campus use.'
  }[condition] || 'Fully functional and ready for student use.';

  return `${cleanText} ${conditionDesc} Great for campus coursework, projects, or study groups. Clean, reliable, and available for peer lending.`;
};

module.exports = {
  improveItemDescription,
};
