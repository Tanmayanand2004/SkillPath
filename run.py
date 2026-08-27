"""
This script handles the setup and execution of the web application.
"""
print("--- run.py started ---")
import os
from pathlib import Path
import shutil

from dotenv import load_dotenv

# Load environment variables
env_path = Path('.env')
env_example_path = Path('.env.example')

# If .env doesn't exist, create it from example
if not env_path.exists() and env_example_path.exists():
    shutil.copy(env_example_path, env_path)
    print("Created .env file from .env.example. Please update your API keys before proceeding.")

# Load environment vars
load_dotenv()
print("--- dotenv loaded ---")

# Check if a free/paid LLM API key is set. DEV_MODE still allows UI-only testing.
if not (os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")):
    print("WARNING: GROQ_API_KEY not found in environment variables.")
    print("Set GROQ_API_KEY for free AI inference, or DEV_MODE=True for UI-only testing.")
    if os.getenv("DEV_MODE", "False").lower() != "true":
        exit(1)

# Create necessary directories
os.makedirs("vector_db", exist_ok=True)
os.makedirs("learning_paths", exist_ok=True)
print("--- API key/dev mode checked and dirs created ---")

# Import and run Flask app
from web_app import create_app

app = create_app()
print("--- Flask app created via factory ---")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    # Disable debug mode to prevent auto-reloading issues
    debug = False
    
    print(f"Starting AI Learning Path Generator on port {port}")
    print("Visit http://localhost:5000 in your browser")
    
    app.run(host="0.0.0.0", port=port, debug=debug, use_reloader=False)
