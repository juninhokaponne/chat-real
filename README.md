<p align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:000080,100:0000FF&height=150&section=header&text=ChatReal%20-%20Hacktoberfest%202025&fontSize=35&fontColor=ffffff&animation=fadeIn" />
</p>

<!-- Typing SVG Animation -->
<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com/?font=Roboto&size=30&duration=4000&color=6366F1&center=true&vCenter=true&width=600&lines=Modern+Video+Chat+Application;Secure+and+Instant;Crystal+Clear+Audio;HD+Video+Calls;Private+and+Safe;Multi-Device+Support" alt="Typing SVG" />

<br>

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=netlify)](https://chatreall.netlify.app/)
[![Netlify Status](https://img.shields.io/badge/netlify-deploy-success?style=for-the-badge&logo=netlify)](https://app.netlify.com/sites/chatreall/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

**Modern, secure and instant video chat application built with React, TypeScript, and WebRTC**

[Live Demo](https://chatreall.netlify.app/) • [Documentation](#) • [Report Bug](https://github.com/your-username/chat-real/issues) • [Request Feature](https://github.com/your-username/chat-real/issues)

</div>

## Table of Contents

> Click on any section to navigate quickly.

| | Section | | Section |
|:---:|:---|:---:|:---|
|  | [Features](#features) |  | [Configuration](#configuration) |
|  | [Tech Stack](#tech-stack) |  | [Deployment](#deployment) |
|  | [Quick Start](#quick-start) |  | [Contributing](#contributing) |
|  | [Available Scripts](#available-scripts) |  | [Roadmap](#roadmap) |
|  | [Project Structure](#project-structure) |  | [Known Issues](#known-issues--solutions) |
|  | [Usage](#usage) |  | [License](#license) |

  
## Features

<!-- Features with aligned badges -->
<div align="left">

| Feature | Description |
|:---|:---|
| **HD Video Calls** | High quality video with WebRTC technology |
| **Crystal Clear Audio** | Clear sound with noise cancellation |
| **Private & Secure** | Encrypted P2P connection, no data on server |
| **Multi-device** | Works on desktop, tablet and mobile |
| **Instant Rooms** | Create or join rooms quickly |
| **Unlimited Time** | No time restrictions on calls |
| **Camera Test** | Test your camera and microphone before joining |
| **Modern UI** | Clean, responsive design with modern header |

</div>

## Tech Stack

<!-- Tech Stack aligned to left -->
<div align="left">

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-4.0+-646CFF?style=flat-square&logo=vite)
![WebRTC](https://img.shields.io/badge/WebRTC-Native-333333?style=flat-square&logo=webrtc)
![CSS Modules](https://img.shields.io/badge/CSS%20Modules-Styling-1572B6?style=flat-square&logo=css3)

</div>

## Quick Start

### Prerequisites

<!-- Prerequisites aligned left -->
<div align="left">

![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933?style=for-the-badge&logo=node.js)
![npm](https://img.shields.io/badge/npm-7%2B-CB3837?style=for-the-badge&logo=npm)

</div>

### Installation

<div align="left">

```bash
# 1. Clone the repository
git clone https://github.com/your-username/chat-real.git
cd chat-real

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open your browser
# http://localhost:5173
```

</div>

<div align="center">

<!-- Workflow diagram -->
```mermaid
graph LR
    A[Clone Repository] --> B[Install Dependencies]
    B --> C[Start Dev Server]
    C --> D[Open Browser]
    D --> E[Start Video Chatting!]
```

</div>

## Available Scripts

<div align="left">

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler |

</div>

## Project Structure

<div align="left">

```typescript
src/
├── 📁 components/          # React components
│   ├── CameraTest/     # Camera/microphone testing
│   ├── Controls/       # Video call controls
│   ├── Header/         # Navigation header
│   ├── Landing/        # Landing page
│   ├── ShareButton/    # Room link sharing
│   ├── VideoChat/      # Main video chat interface
│   └── VideoContainer/ # Video display container
├── 📁 hooks/              # Custom React hooks
│   └── useVideoChat.ts # Video chat state management
├── 📁 services/           # Business logic
│   └── WebRTCService.ts # WebRTC implementation
├── 📁 types/              # TypeScript type definitions
├── 📁 utils/              # Utility functions
│   └── roomUtils.ts    # Room ID generation
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

</div>

## Usage

### Creating a Room

<div align="center">

<!-- Sequence diagram -->
```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant B as Browser
    
    U->>A: Click "Create New Room"
    A->>B: Request Camera/Mic Permissions
    B->>A: Grant Permissions
    A->>U: Generate Room ID & Show Video
    U->>A: Share Room Link
```

</div>

<div align="left">

1. **Click** "Create New Room" on the homepage
2. **Allow** camera and microphone permissions
3. **Share** the room link with others

### Joining a Room

1. **Paste** the room ID in the "Join Existing Room" input
2. **Click** "Join Room" or press Enter
3. **Allow** camera and microphone permissions

### During a Call

| Feature | Description |
|---------|-------------|
| Camera Toggle | Toggle video on/off |
| Microphone Toggle | Toggle audio on/off |
| End Call | End call and return home |
| Share Room | Copy room link to share |

</div>

## 🔧 Configuration

### Environment Variables

<div align="left">

Create a `.env` file in the root directory:

```env
# Optional: Custom STUN/TURN servers for better connectivity
VITE_STUN_SERVER=stun:your-server.com:3478
VITE_TURN_SERVER=turn:your-server.com:3478
VITE_TURN_USERNAME=your-username
VITE_TURN_PASSWORD=your-password

# Optional: App configuration
VITE_APP_NAME="Chat Real"
VITE_APP_VERSION=1.0.0
```

</div>

### Browser Compatibility

<div align="left">

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 60+ | Fully Supported |
| Firefox | 60+ | Fully Supported |
| Safari | 13+ | Fully Supported |
| Edge | 79+ | Fully Supported |

</div>

<div align="left">

**Note**: Requires HTTPS for camera/microphone access in production.

</div>

## Deployment

### Deploy to Netlify

<div align="left">

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/chat-real)

</div>

<div align="left">

1. **Click** the deploy button above
2. **Connect** your GitHub repository
3. **Deploy** automatically

### Manual Deployment

```bash
# Build the project
npm run build

# The dist/ folder is ready for deployment
```

**Supported Platforms**:
- Netlify
- Vercel  
- GitHub Pages
- Firebase Hosting
- Any static hosting service

</div>

## 🤝 Contributing

<div align="center">

We love your input! We want to make contributing as easy and transparent as possible.

<!-- Another typing animation -->
<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com/?font=Roboto&size=20&duration=3000&color=10B981&center=true&vCenter=true&width=500&lines=Contributions+Welcome!;Fork+and+Create+PR;Follow+Guidelines;Test+Your+Changes" alt="Contributing" />
</div>

</div>

### Development Workflow

<div align="center">

```mermaid
graph LR
    A[Fork Repository] --> B[Create Branch]
    B --> C[Make Changes]
    C --> D[Run Tests]
    D --> E[Submit PR]
    E --> F[Review & Merge]
```

</div>

### Steps to Contribute

<div align="left">

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow React best practices
- Use CSS Modules for styling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation if needed

</div>

## Roadmap

<div align="left">

| Status | Feature | Description |
|--------|---------|-------------|
| 🔄 | Screen Sharing | Share your screen during calls |
| 🔄 | Chat Messages | Text chat alongside video |
| 🔄 | Recording | Record your video calls |
| ⏳ | Background Effects | Virtual backgrounds and blur |
| ⏳ | Room Passwords | Secure rooms with passwords |
| ⏳ | Mobile App | React Native application |
| ⏳ | Multiple Participants | Support for group calls |
| ⏳ | File Sharing | Share files during calls |
| ⏳ | Whiteboard | Collaborative drawing board |

</div>

## Known Issues & Solutions

<div align="left">

| Issue | Solution |
|-------|----------|
| Camera access denied initially | Refresh the page and allow permissions |
| iOS Safari audio issues | Use Chrome or Firefox on iOS |
| Firefox media device enable | Manually enable in browser settings |
| Connection issues | Check firewall and network settings |

</div>

## License

<div align="center">

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<!-- GitHub stats with animations -->
<div align="center">

![GitHub stars](https://img.shields.io/github/stars/juninhokaponne/chat-real?style=social&label=Stars)
![GitHub forks](https://img.shields.io/github/forks/juninhokaponne/chat-real?style=social&label=Forks)
![GitHub issues](https://img.shields.io/github/issues/juninhokaponne/chat-real?label=Issues)
![GitHub pull requests](https://img.shields.io/github/issues-pr/juninhokaponne/chat-real?label=Pull%20Requests)

</div>

</div>

## 🙏 Acknowledgments

<div align="left">

- **WebRTC API** - Real-time communication technology
- **React Team** - Amazing frontend framework
- **Material Design** - Beautiful icon system
- **Inter Font** - Clean typography by Rasmus Andersson
- **Vite** - Lightning-fast build tool

</div>

## 📞 Support

<div align="left">

| Platform | Link | Response Time |
|----------|------|---------------|
| GitHub Issues | [Report Bug](https://github.com/juninhokaponne/chat-real/issues) | 24-48 hours |
| Discussions | [Start Discussion](https://github.com/juninhokaponne/chat-real/discussions) | 12-24 hours |
| Bug Reports | [Bug Tracker](https://github.com/juninhokaponne/chat-real/issues) | 24 hours |
| Feature Requests | [Feature Ideas](https://github.com/juninhokaponne/chat-real/issues) | 48 hours |

</div>

---

<div align="center">

### ⭐ Don't forget to star the repository if you find this project useful!

<!-- Animated visitor counter -->
![Visitor Count](https://komarev.com/ghpvc/?username=username&label=Profile%20Views&color=blue&style=flat)

<!-- Final typing animation -->
<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com/?font=Roboto&size=25&duration=3000&color=F59E0B&center=true&vCenter=true&width=400&lines=Happy+Video+Chatting!;Stay+Connected!;See+You+Online!;🚀+Enjoy!" alt="Final Message" />
</div>

**Happy Video Chatting!** 

**Made with ❤️ by juninhokaponne the Chat Real community**

</div>
