# Daggerheart Designer

A web-based adversary and encounter designer for the Daggerheart tabletop RPG system. This tool helps GMs and players create, view, and manage adversaries, features, and encounters with a modern, interactive interface.

## Features

- Browse and search a library of adversaries
- View detailed adversary stats, motives, features, and attacks
- Build balanced encounters with battle point budgeting
- Filter and sort adversaries by name or tier
- Difficulty adjustments for customizing encounter challenge
- Beautiful modal popups with gradient backgrounds and color-coded badges
- Responsive, modern UI built with React and Vite

## Getting Started

### Prerequisites

- Docker and Docker Compose
- (Optional) Node.js v18+ if running without Docker

### Quick Start

1. Clone the repository:

   ```sh
   git clone https://github.com/gruffled/ded.git
   cd ded
   ```

2. **Development mode** (with hot reload):

   ```sh
   make dev
   ```

   Access at `http://localhost:5173`

3. **Production mode** (optimized build):
   ```sh
   make prod
   ```
   Access at `http://localhost:8080`

### Available Make Commands

- `make dev` - Start development server with hot reload
- `make prod` - Start production server with nginx
- `make down` - Stop all containers
- `make logs` - View container logs
- `make restart` - Restart development server
- `make clean` - Stop containers and remove images
- `make help` - Show all available commands

### Running Without Docker

If you prefer to run the application without Docker:

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open your browser to `http://localhost:5173`

### Docker Configuration

The project includes:

- `Dockerfile` - Multi-stage production build (Node.js → Nginx)
- `Dockerfile.dev` - Development environment with hot reload
- `docker-compose.yml` - Orchestration for both dev and prod environments
- `Makefile` - Convenient shortcuts for Docker commands

## Project Structure

```
public/           # Static assets and adversaries.json data
src/
  components/     # React UI components
  constants.js    # Game rules and configuration
  utils.js        # Business logic and calculations
  hooks.js        # Custom React hooks
  index.css       # Global styles
  main.jsx        # App entry point
scripts/          # Data extraction and utility scripts
Dockerfile        # Production Docker configuration
Dockerfile.dev    # Development Docker configuration
docker-compose.yml # Docker orchestration
Makefile          # Convenience commands for Docker
```

## Architecture

The codebase follows React best practices with:

- **Separation of concerns**: Business logic separated from UI components
- **Custom hooks**: Reusable state management (`useAdversaryData`, `useEncounter`)
- **Pure functions**: Testable utility functions for calculations
- **Constants**: Centralized configuration for game rules

## Customization

- To add or edit adversaries, modify `public/adversaries.json`.
- UI colors and gradients can be customized in `src/index.css` and component files.

## Contributing

Pull requests and suggestions are welcome! Please open an issue for bugs or feature requests.

## License

This work includes material taken from the Daggerheart System Reference Document 1.0 by Darrington Press LLC, available at [daggerheart.com/srd](https://daggerheart.com/srd).

This work is licensed under the [Darrington Press Community Gaming License](https://darringtonpress.com/license).

Daggerheart is © Darrington Press, LLC.

Code is MIT licensed.

---

Created by gruffled. Inspired by Daggerheart RPG.
