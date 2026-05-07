from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
import json
import traceback

app = Flask(__name__)
CORS(app)

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
else:
        model = None

@app.route('/chat', methods=['POST'])
def chat():
        if not model:
        return jsonify({"reply": "Brain not configured"}), 500
        data = request.json
        msg = data.get('message')
        try:
                    res = model.generate_content(msg)
                    return jsonify({"reply": res.text})
except Exception as e:
        traceback.print_exc()
        return jsonify({"reply": f"Error: {str(e)}"}), 500
