const MockAiProvider = require('./mock-ai-provider');

function createAiService() {
  const providerName = process.env.AI_PROVIDER || 'mock';

  switch (providerName) {
    case 'mock':
    default:
      return new MockAiProvider();
  }
}

module.exports = { createAiService };
