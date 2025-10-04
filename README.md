# Chat Real 🚀

<p align="center">
  <img src="https://via.placeholder.com/900x200/00b894/ffffff?text=Chat+Real+%F0%9F%9A%80" alt="Chat Real Banner" />
</p>

<h3 align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=24&pause=1000&color=00b894&center=true&vCenter=true&width=600&lines=Modern+%7C+Secure+%7C+Instant+Video+Chat" alt="Typing Tagline" />
</h3>

<p align="center">
  <a href="https://chatreall.netlify.app/"><img src="https://img.shields.io/badge/demo-live-brightgreen" alt="Live Demo"></a>
<a href="https://app.netlify.com/sites/chatreall/deploys">
  <img src="https://api.netlify.com/api/v1/badges/2c3a1234-5678-90ab-cdef-112233445566/deploy-status" alt="Netlify Status">
</a>

  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></a>
</p>

<p align="center">
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind"></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white" alt="Bun"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="TypeScript"></a>
</p>

---

## About

Chat Real is a modern, secure, and instant video chat application built with React, TypeScript, and WebRTC.

Live Demo URL:
https://chatreall.netlify.app

---

## Features

- HD Video Calls: High quality video via WebRTC
- Crystal Clear Audio: Noise cancellation enabled
- Private & Secure: Encrypted peer-to-peer connections
- Multi-device: Desktop, tablet, and mobile support
- Instant Rooms: Create or join rooms quickly
- Unlimited Time: No restrictions on call duration
- Camera Test: Test your camera and mic before joining
- Modern UI: Clean, responsive, and intuitive design

---

## Tech Stack

- Frontend: React 18 + TypeScript
- Build Tool: Vite
- Styling: CSS Modules
- Icons: React Icons (Material Design)
- Real-time Communication: WebRTC (Native)
- Fonts: Inter (Google Fonts)

---

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

git clone https://github.com/your-username/chat-real.git
cd chat-real
npm install
npm run dev

### Running the App

Open your browser and go to:
http://localhost:5173

---

## Scripts

npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint

---

## Project Structure

src/
├── components/
│   ├── CameraTest/
│   ├── Controls/
│   ├── Header/
│   ├── Landing/
│   ├── ShareButton/
│   ├── VideoChat/
│   └── VideoContainer/
├── hooks/
│   └── useVideoChat.ts
├── services/
│   └── WebRTCService.ts
├── types/
├── utils/
│   └── roomUtils.ts
├── App.tsx
├── main.tsx
└── index.css

---

## Usage

### Creating a Room

1. Click "Create New Room" on the homepage
2. Allow camera and microphone access
3. Share the room link

### Joining a Room

1. Paste the room ID
2. Click "Join Room" or press Enter
3. Allow camera and microphone access

### During a Call

- Toggle camera and mic on/off
- End call and return to homepage
- Copy room link to share

---

## Configuration

### Environment Variables (Optional)

VITE_STUN_SERVER=stun:your-server.com:3478
VITE_TURN_SERVER=turn:your-server.com:3478
VITE_TURN_USERNAME=your-username
VITE_TURN_PASSWORD=your-password

### Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 13+
- Edge 79+
- HTTPS required for camera/mic access

---

## Deployment

- Vercel: Connect repo → deploy
- Netlify: Build → deploy 'dist/' folder
- Manual: Build → host 'dist/' folder

---

## Contributing

1. Fork the repo
2. Create a feature branch: git checkout -b feature/your-feature
3. Commit changes: git commit -m 'Add some feature'
4. Push branch: git push origin feature/your-feature
5. Open a pull request

### Guidelines

- Follow code style & TypeScript practices
- Add tests for new features
- Update documentation

---

## Roadmap

- Screen sharing
- Chat messages during calls
- Recording functionality
- Virtual backgrounds
- Room access control
- Mobile app (React Native)
- Multiple participants
- File sharing
- Whiteboard integration

---

## Known Issues

- Camera access denial requires refresh
- iOS Safari audio issues
- Firefox may need manual media enable

---

## License

MIT License - see LICENSE file

---

## Acknowledgments

- WebRTC API
- React team
- Material Design icons
- Inter font (Rasmus Andersson)
- Vite build tool

---

## Support

- Open an issue on GitHub
- Start a discussion in the repo
- Check documentation

---

Made with ❤️ by the Chat Real Community
