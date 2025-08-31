import json
from flask import Flask, render_template, abort
import os

# Initialize the Flask app
# The template_folder is specified to ensure Flask finds the 'index.html' file.
app = Flask(__name__, template_folder='.')

def get_tier(level):
    """Calculates the Daggerheart Tier based on character level."""
    if not isinstance(level, int):
        return 1
    if level <= 1:
        return 1
    if 2 <= level <= 4:
        return 2
    if 5 <= level <= 7:
        return 3
    if 8 <= level <= 10:
        return 4
    return 4 # For levels above 10

@app.context_processor
def utility_processor():
    """Injects helper functions into the Jinja2 context."""
    return dict(get_tier=get_tier)

def load_adversaries():
    """Loads adversary data from the JSON file."""
    # This function checks if the adversaries.json file exists before trying to open it.
    if not os.path.exists('adversaries.json'):
        # If the file doesn't exist, stop the application with an error.
        abort(500, "Error: 'adversaries.json' not found. Please run the parsing script first.")
    try:
        with open('adversaries.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        # If the JSON is invalid, stop the application with an error.
        abort(500, "Error: 'adversaries.json' contains invalid JSON. Please check the file.")
    except Exception as e:
        abort(500, f"An unexpected error occurred while loading adversaries: {e}")


@app.route('/')
def encounter_builder():
    """Serves the main encounter builder page."""
    adversaries = load_adversaries()
    # Sort adversaries first by tier, then alphabetically by name for a clean display.
    adversaries_sorted = sorted(adversaries, key=lambda x: (x.get('tier', 0), x.get('name', '')))
    return render_template('index.html', adversaries=adversaries_sorted)

if __name__ == '__main__':
    # Running the app with debug=True is helpful for development.
    # The host='0.0.0.0' makes it accessible from other devices on your network.
    app.run(host='0.0.0.0', port=5001, debug=True)

