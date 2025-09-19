# Gemini-Style Chat Interface

A modern, responsive chat interface inspired by Google Gemini, built with React, TypeScript, and Tailwind CSS.

## Features

- 🎨 Clean, modern UI with dark theme
- 📱 Fully responsive design for mobile, tablet, and desktop
- 💬 Real-time messaging with typing indicators
- 📜 Chat history with search functionality
- 📎 File and image attachment support
- 🌓 Light/Dark mode toggle
- ✨ Smooth animations and transitions
- 📝 Markdown support for messages
- 📋 Copy message to clipboard
- 🔄 Infinite scroll for chat history

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gemini-chat.git
   cd gemini-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
gemini-chat/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable UI components
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Customization

### Themes

You can customize the color scheme by modifying the `tailwind.config.js` file. The primary color is set to green by default.

### Environment Variables

Create a `.env` file in the root directory to set environment variables:

```env
VITE_API_BASE_URL=your_api_url_here
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Google Gemini's chat interface
- Built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), and [Tailwind CSS](https://tailwindcss.com/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
