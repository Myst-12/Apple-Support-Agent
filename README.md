---
title: Apple Support Agent
emoji: 🍎
colorFrom: blue
colorTo: gray
sdk: docker
pinned: false
---

# 🍎 Apple Support Agent

A highly-polished, RAG-powered (Retrieval-Augmented Generation) Apple customer support chat application.

This project mimics a premium Apple UI design aesthetic—using pure CSS, backdrop-filter glassmorphism, and Apple-style typography—to create a smooth and satisfying user experience. Users can ask questions about Apple products, and the AI agent retrieves real, scraped Apple support documentation to answer accurately. If the AI does not know the answer, it escalates to a human specialist.

## ✨ Features
- **Premium Apple Aesthetic:** Clean UI with pure white backgrounds, Apple's exact blue (`#0071e3`), and smooth micro-animations.
- **RAG Pipeline:** Answers are grounded in real Apple support pages using vector search.
- **Conversational Memory:** The agent remembers previous messages in the chat context.
- **Responsive Design:** Seamlessly transitions from a welcoming start screen to a full chat interface.

## 🛠️ Tech Stack
- **Frontend:** Pure HTML, Vanilla CSS, and Vanilla JavaScript (No heavy frontend frameworks).
- **Backend:** Python with Flask.
- **AI/LLM:** Groq API (`llama-3.3-70b-versatile` model for lightning-fast inference).
- **RAG Architecture:** LangChain.
- **Embeddings:** `sentence-transformers` (`all-MiniLM-L6-v2`).
- **Vector Database:** ChromaDB (persisted locally via SQLite).
- **Data Ingestion:** BeautifulSoup4 (scraping live Apple support pages).

## 🚀 The Deployment Journey

Deploying a local machine learning application comes with unique challenges. Here is the journey of how this app was deployed:

1. **Vercel (Failed):** We initially attempted to deploy to Vercel. However, Vercel Serverless Functions have a strict 250MB size limit. Because this app relies on local ML models (PyTorch via `sentence-transformers`) and ChromaDB, the dependencies easily exceeded 1.5GB. Furthermore, Vercel is stateless and read-only, which makes running a local SQLite-based vector database impossible.
2. **Render (Failed):** Next, we tried Render. While Render supports native Flask apps, the free tier only provides 512MB of RAM. Loading the embedding models into memory caused an immediate "Out of Memory" (OOM) crash during startup.
3. **Hugging Face Spaces (Success 🎉):** We ultimately deployed the app to Hugging Face Spaces using their Docker SDK. Hugging Face generously provides 16GB of RAM on their free tier, which is perfect for ML workloads.

**Key changes made for Hugging Face deployment:**
- Created a `Dockerfile` using `python:3.10-slim` (Python 3.10 is required by the `groq` package).
- Updated the Flask app to bind to `0.0.0.0` and dynamically use the `$PORT` environment variable (Hugging Face exposes port 7860).
- Configured **Git LFS** (Large File Storage) to track the heavy `chroma.sqlite3` database files, as Hugging Face rejects pushes containing files larger than 10MB.
- Added Hugging Face specific YAML metadata frontmatter to this `README.md` to configure the Space.

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Myst-12/Apple-Support-Agent.git
   cd Apple-Support-Agent
   ```

2. **Set up a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Copy the example environment file and add your Groq API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

5. **Run the application:**
   ```bash
   python app.py
   ```
   Open your browser to `http://127.0.0.1:5001`.
