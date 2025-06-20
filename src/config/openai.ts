import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export default openai;

export const OPENAI_CONFIG = {
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
};