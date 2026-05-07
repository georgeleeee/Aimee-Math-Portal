from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        "status": "alive",
        "time": datetime.now().isoformat(),
        "env_keys": list(os.environ.keys()),
        "has_key": "GEMINI_API_KEY" in os.environ
    })

@app.route('/chat', methods=['POST'])
def chat():
    # 极简测试，不依赖 genai
    return jsonify({
        "reply": "后端存活，正在进行连通性测试。如果你看到这条消息，说明后端路由正常。",
        "has_key": "GEMINI_API_KEY" in os.environ
    })

# Vercel 自动识别 app
