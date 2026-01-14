<div align="center">

# ⚔️ Daggerheart Encounter Designer

**Build balanced encounters for your Daggerheart adventures**

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern web-based encounter designer for the Daggerheart tabletop RPG system. Create, manage, and balance encounters with an intuitive interface and powerful battle point calculator.

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-project-structure) • [Contributing](#-contributing)

</div>

---

## ✨ Features

- 🎲 **Encounter Builder** - Build balanced encounters with automatic battle point calculations
- 📚 **Adversary Library** - Browse and search a comprehensive library of creatures
- 🔍 **Smart Filtering** - Filter by tier and search by name, type, or attributes
- ⚖️ **Difficulty Scaling** - Adjust encounters with easy/hard modes and damage boosts
- 📊 **Visual Budget Tracking** - Real-time progress bars and budget displays
- 🎨 **Modern UI** - Beautiful gradients, animations, and responsive design
- 🔄 **Sort Options** - Organize adversaries by name or tier
- ✅ **Type Safety** - Clean, maintainable React codebase with best practices

## 🚀 Quick Start

### Prerequisites

- 🐳 Docker and Docker Compose
- 📦 (Optional) Node.js v18+ if running without Docker

### Installation

```sh
# Clone the repository
git clone https://github.com/gruffled/ded.git
cd ded

# Start development server
make dev
```

🎉 Open [http://localhost:5173](http://localhost:5173) and start building encounters!

## 🛠️ Available Commands

| Command        | Description                         | Port |
| -------------- | ----------------------------------- | ---- |
| `make dev`     | 🔥 Development mode with hot reload | 5173 |
| `make prod`    | 🚀 Production build with Nginx      | 8080 |
| `make down`    | 🛑 Stop all containers              | -    |
| `make logs`    | 📋 View container logs              | -    |
| `make restart` | 🔄 Restart development server       | -    |
| `make clean`   | 🧹 Stop containers and cleanup      | -    |
| `make help`    | ❓ Show all commands                | -    |

### 💻 Running Without Docker

```sh
npm install    # Install dependencies
npm run dev    # Start development server
```

## 📁 Project Structure

```
📦 daggerheart-encounter-designer
├── 📂 public/              # Static assets and data
│   └── adversaries.json    # Adversary database
├── 📂 src/
│   ├── 📂 components/      # React UI components
│   ├── 📄 constants.js     # Game rules configuration
│   ├── 📄 utils.js         # Business logic & calculations
│   ├── 📄 hooks.js         # Custom React hooks
│   ├── 📄 index.css        # Global styles & animations
│   └── 📄 main.jsx         # Application entry point
├── 📂 scripts/             # Data extraction utilities
├── 🐳 Dockerfile           # Production build configuration
├── 🐳 Dockerfile.dev       # Development configuration
├── 📋 docker-compose.yml   # Container orchestration
└── ⚙️ Makefile            # Convenience commands
```

## 🏗️ Architecture

The codebase follows React best practices with clean separation of concerns:

```
🎨 Components     →  Pure UI presentation
🔧 Utils          →  Business logic & calculations
🪝 Custom Hooks   →  Reusable state management
⚙️ Constants      →  Centralized configuration
```

**Key Design Principles:**

- ✅ Separation of concerns - Logic separated from UI
- ✅ Custom hooks - `useAdversaryData`, `useEncounter`
- ✅ Pure functions - Testable utility functions
- ✅ Centralized config - Game rules in one place

## 🎨 Customization

| What               | Where                     | How                      |
| ------------------ | ------------------------- | ------------------------ |
| 🎲 Add Adversaries | `public/adversaries.json` | Edit JSON data           |
| 🎨 Change Colors   | `src/index.css`           | Modify CSS variables     |
| ⚙️ Game Rules      | `src/constants.js`        | Update configuration     |
| 🧮 Battle Points   | `src/utils.js`            | Modify calculation logic |

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

Please open an issue for bugs or feature requests.

## 📜 License

### Content License

This work includes material taken from the **Daggerheart System Reference Document 1.0** by Darrington Press LLC, available at [daggerheart.com/srd](https://daggerheart.com/srd).

This work is licensed under the [Darrington Press Community Gaming License](https://darringtonpress.com/license).

**Daggerheart is © Darrington Press, LLC**

### Code License

Code is licensed under the MIT License.

---

<div align="center">

**⚔️ Built with ❤️ for the Daggerheart community**

Created by [gruffled](https://github.com/gruffled) • Inspired by Daggerheart RPG

[Report Bug](https://github.com/gruffled/ded/issues) • [Request Feature](https://github.com/gruffled/ded/issues) • [Documentation](https://github.com/gruffled/ded)

</div>
