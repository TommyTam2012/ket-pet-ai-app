# main.py - receives multiple images and prompts from UI, sends to GPT-4o Vision

from flask import Flask, request, jsonify
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        messages = data.get("messages")

        if not messages:
            return jsonify({"error": "Missing messages array."}), 400

        result = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": messages}
            ]
        )

        answer = result.choices[0].message.content
        return jsonify({"response": answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    return "✅ KET/PET GPT Vision backend is running."

if __name__ == "__main__":
    app.run(debug=True)
