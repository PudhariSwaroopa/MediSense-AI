# MediChat AI - Health Chatbot

A modern, responsive health-focused chat interface inspired by Google Gemini, built with React, TypeScript, Tailwind CSS, and Node.js backend using Google Gemini API.

## Features

- 🎨 Clean, modern UI with dark/light theme
- 📱 Fully responsive design for mobile, tablet, and desktop
- 💬 Real-time messaging with AI responses
- 📜 Chat history with search functionality
- 🌓 Light/Dark mode toggle
- ✨ Smooth animations and transitions
- 📝 Multilingual support (English, Hindi, Telugu, Tamil, etc.)
- 🚨 Emergency alerts for critical symptoms (chest pain, stroke, etc.)
- 📋 Copy message to clipboard

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Git
- Google Cloud API Key (Gemini 2.0 Flash Lite)

### Project Structure



SIH/
├── sih-backend/ # Backend server
│ ├── server.js # Express server
│ ├── .env # Environment variables (API key, PORT)
│ ├── package.json
│ └── node_modules/
├── sih/ # Frontend React app
│ ├── src/
│ │ ├── components/ # UI components
│ │ ├── contexts/ # Theme context
│ │ ├── App.tsx
│ │ ├── main.tsx
│ │ └── types.ts
│ ├── package.json
│ └── node_modules/
├── README.md
└── package-lock.json



## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd SIH

##Install and Run Backend Deoendencies
cd sih-backend
npm install express cors dotenv axios
npm install --save-dev nodemon
cd ../sih-backend
npx nodemon server.js


##Install and Run Frontend Deoendencies
cd ../sih
npm install
npm install axios
cd ../sih
npm run dev

##Test Prompts
English: What are the symptoms of COVID-19?
Hindi: COVID-19 के लक्षण क्या हैं?
Telugu: కొవిడ్ లక్షణాలు ఏమిటి?
Tamil: கோவிட் அறிகுறிகள் என்ன?
Emergency: I have chest pain and shortness of breath.


##Available Scripts (Frontend)

npm run dev → Start development server

npm run build → Build for production

npm run preview → Preview production build

npm run lint → Run ESLint

##Troubleshooting

Dependency installation fails

Clear npm cache: npm cache clean --force

Delete node_modules and package-lock.json

Run npm install again

Backend server not starting

Ensure .env exists with valid API key

Check port 5000 is free

Frontend server not starting

Ensure port 5173 is free

Run npm install in frontend folder

Chatbot not responding

Make sure backend server is running

Verify Gemini API key is valid and quota not exceeded


##License

This project is licensed under the MIT License - see the LICENSE
 file for details.

##Acknowledgments

Inspired by Google Gemini's chat interface

Built with Vite
, React
, Tailwind CSS

Backend using Express
 and Google Gemini API
