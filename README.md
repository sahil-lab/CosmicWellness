# Astrology and Healing Video Recommendations

A modern web application that provides personalized video recommendations for healing and meditation based on emotions and astrological insights. The application uses AI to curate specific content tailored to users' emotional states.

## Features

- Emotion-based video recommendations
- Integration with OpenAI GPT-4
- YouTube video player integration
- Beautiful, responsive UI with animations
- Support for various healing content types (subliminal, binaural, meditation, frequency)

## Tech Stack

- React
- TypeScript
- Framer Motion
- OpenAI API
- YouTube API

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/sahil-lab/astrology.git
   cd astrology
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and replace `your_openai_api_key_here` with your actual OpenAI API key

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

The following environment variables are required:

- `REACT_APP_OPENAI_API_KEY`: Your OpenAI API key for AI-powered recommendations

## License

This project is licensed under the MIT License - see the LICENSE file for details. 