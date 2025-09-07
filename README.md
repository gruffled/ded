# Daggerheart Designer

A web-based adversary and encounter designer for the Daggerheart tabletop RPG system. This tool helps GMs and players create, view, and manage adversaries, features, and encounters with a modern, interactive interface.

## Features
- Browse and search a library of adversaries
- View detailed adversary stats, motives, features, and attacks
- Beautiful modal popups with gradient backgrounds and color-coded badges
- Easily extract and manage adversary data from JSON files
- Responsive, modern UI built with React and Vite

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
	```sh
	git clone https://github.com/gruffled/ded.git
	cd ded
	```
2. Install dependencies:
	```sh
	npm install
	# or
	yarn install
	```
3. Start the development server:
	```sh
	npm run dev
	# or
	yarn dev
	```
4. Open your browser to `http://localhost:5173` (or the port shown in your terminal).

## Project Structure
```
public/           # Static assets and adversaries.json data
src/              # React source code
  components/     # Main UI components (modals, cards, lists)
  assets/         # Images and icons
  index.css       # Global styles
  main.jsx        # App entry point
scripts/          # Data extraction and utility scripts
```

## Customization
- To add or edit adversaries, modify `public/adversaries.json`.
- UI colors and gradients can be customized in `src/index.css` and component files.

## Contributing
Pull requests and suggestions are welcome! Please open an issue for bugs or feature requests.

## License
MIT

---
Created by gruffled. Inspired by Daggerheart RPG.
