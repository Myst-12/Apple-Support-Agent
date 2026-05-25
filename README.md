# Apple Support Agent

A RAG-powered Apple customer support chatbot with a polished Apple-inspired UI. It answers user queries using real Apple support documentation and escalates to a human specialist when needed.

https://github.com/user-attachments/assets/9d6cbeec-b83e-4a69-a11a-09bd215edb4e

## Features
- Apple-style UI with smooth animations and responsive design
- RAG pipeline using real Apple support pages
- Conversational memory for context-aware responses
- Human escalation for unsupported queries

## Tech Stack
**Frontend:** HTML, CSS, JavaScript  
**Backend:** Flask (Python)  
**LLM:** Groq (`llama-3.3-70b-versatile`)  
**RAG:** LangChain  
**Embeddings:** `sentence-transformers` (`all-MiniLM-L6-v2`)  
**Vector Database:** ChromaDB  
**Data Collection:** BeautifulSoup4  

## Deployment
Deployed on **Hugging Face Spaces (Docker)** due to better support for ML workloads and larger memory requirements.
