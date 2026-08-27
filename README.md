# AI Learning Path Generator 🚀

A production-ready full-stack application that generates personalized learning paths powered by AI. Built with a modern hybrid architecture: Next.js frontend, and a Flask API with background workers.

## Overview

This project uses advanced AI techniques and Retrieval-Augmented Generation (RAG) to create highly customized learning paths based on:
- **Topic selection and expertise level** - From beginner to expert
- **Individual learning style preferences** - Visual, auditory, reading/writing, or kinesthetic
- **Time availability and study preferences** - Minimal to intensive commitments
- **Specific learning goals and objectives** - Customized to your career aspirations
- **Real-time job market data** - Salary ranges, open positions, and trending employers

The system combines OpenAI/Groq language models with vector database technology and a PostgreSQL backend to create detailed, personalized educational roadmaps with recommended resources, study schedules, progress tracking, and user authentication.

## Features

### Core Features
- 🤖 **AI-powered path generation** using LangChain and AI models
- 🎯 **Learning style adaptation** with support for visual, auditory, reading/writing, and kinesthetic learners
- 📈 **Progress tracking** with milestone completion and status updates
- 📅 **Study scheduling** with customizable time commitments
- 🔍 **Smart resource recommendations** tailored to learning style
- 💼 **Job market insights** with real-time salary data and related roles
- 💾 **Vector database (RAG)** for efficient semantic search
- 🌐 **Interactive web interface** with modern UI/UX

### User Features
- 👤 **User authentication** with email/password
- 💾 **Save and manage learning paths** with persistent storage
- 📊 **Personal dashboard** to track all your learning paths and progress
- ✅ **Milestone tracking** with completion status and notes
- 💬 **Popup AI chatbot widget** for general chat, path creation, and research
- ✅ **Resource checkboxes** to track completion

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js (v18+)
- AI Provider API key (e.g. Groq, OpenAI)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/arun3676/ai-learning-path-generator.git
cd ai-learning-path-generator
```

2. **Backend Setup (Python)**
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

3. **Frontend Setup (Node.js)**
```bash
cd frontend
npm install
```

4. **Set up environment variables**
```bash
# Copy the example file in the root
cp .env.example .env

# Edit .env with your API keys and configuration
```

5. **Initialize the database**
```bash
python initialize_db.py
```

6. **Run the Application**

Terminal 1 (Backend):
```bash
python run.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

7. **Access the Application**
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

For detailed information on the system architecture, deployment stacks, and observability features, please refer to the [Solution documentation.md](./Solution%20documentation.md).
