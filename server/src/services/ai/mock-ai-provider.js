const AiProvider = require('./ai-provider');

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

class MockAiProvider extends AiProvider {
  async validateMedia(input) {
    const fileName = normalizeText(input.originalName);
    const mimeType = normalizeText(input.fileType);

    const hasPersonByName =
      fileName.includes('person') ||
      fileName.includes('human') ||
      fileName.includes('человек') ||
      fileName.includes('адам');

    const hasGreenByName =
      fileName.includes('green') || fileName.includes('зел') || fileName.includes('yashel');

    const mediaBias = mimeType.startsWith('image/') ? 0.15 : 0.05;

    const hasPerson = hasPersonByName || Math.random() > 0.55 - mediaBias;
    const hasGreenColor = hasGreenByName || Math.random() > 0.5;

    return {
      provider: 'mock-ai',
      checks: {
        hasPerson,
        hasGreenColor
      },
      score: Number(((Number(hasPerson) + Number(hasGreenColor)) / 2).toFixed(2)),
      raw: {
        note: 'Mock result. Replace provider with real AI model later.'
      }
    };
  }
}

module.exports = MockAiProvider;
