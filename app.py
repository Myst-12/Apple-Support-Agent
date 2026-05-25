import os
from flask import Flask, request, jsonify, render_template
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
from groq import Groq

os.chdir(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
client = Groq(api_key="REMOVED_SEE_ENV_FILE")
embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma(persist_directory="./apple_db", embedding_function=embeddings)

conversation_history = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    
    results = db.similarity_search(user_message, k=10)
    context = "\n\n".join([r.page_content for r in results])
    
    conversation_history.append({"role": "user", "content": user_message})
    
    messages = [
        {
            "role": "system",
            "content": f"""You are an Apple Support specialist. You are friendly, helpful and professional.
Answer questions based on the following Apple support documentation.
If the answer is not in the documentation, say you'll escalate to a human specialist.
Always be concise and clear.

Documentation:
{context}"""
        }
    ] + conversation_history
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages
    )
    
    assistant_message = response.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": assistant_message})
    
    return jsonify({"response": assistant_message})

@app.route("/reset", methods=["POST"])
def reset():
    conversation_history.clear()
    return jsonify({"status": "reset"})

if __name__ == "__main__":
    app.run(debug=True, port=5001)