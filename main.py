# File: main.py

from flask import Flask, request, jsonify
import openai
import base64
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/analyze", methods=["POST"])
def analyze_image():
    try:
        data = request.json
        image_data = data.get("image_base64")
        prompt = data.get("prompt", "Please analyze this exam page.")

        if not image_data:
            return jsonify({"error": "Missing image_base64"}), 400

        result = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_data}"}}
                ]}
            ]
        )

        answer = result["choices"][0]["message"]["content"]
        return jsonify({"response": answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/")
def index():
    return "KET/PET AI Vision API is running."


if __name__ == "__main__":
    app.run(debug=True)
