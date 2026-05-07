from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import traceback
import sys

app = Flask(__name__)
CORS(app)

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"status": "alive", "time": datetime.now().isoformat()})

# 配置 Gemini
def get_model():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None, "GEMINI_API_KEY is not set"
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-2.0-flash-exp'), None
    except Exception as e:
        return None, str(e)

@app.route('/chat', methods=['POST'])
def chat():
    model, error = get_model()
    if not model:
        return jsonify({
            "reply": "云端大脑未配置或初始化失败", 
            "debug": {
                "error": error,
                "env_vars": list(os.environ.keys())
            }
        }), 500
    
    data = request.json
    user_message = data.get('message')
    week_num = data.get('week', 8)
    
    try:
        # 尝试多个可能的路径
        paths_to_try = [
            os.path.join(os.getcwd(), 'curriculum.json'),
            os.path.join(os.path.dirname(__file__), '..', 'curriculum.json'),
            os.path.join(os.path.dirname(__file__), 'curriculum.json'),
            '/var/task/curriculum.json' # Vercel 常见路径
        ]
        
        curriculum_path = None
        for p in paths_to_try:
            if os.path.exists(p):
                curriculum_path = p
                break
        
        if not curriculum_path:
            return jsonify({"reply": f"找不到课程配置文件。尝试路径: {paths_to_try}"}), 500

        with open(curriculum_path, 'r', encoding='utf-8') as f:
            curriculum = json.load(f)
            weeks = curriculum.get('weeks', [])
            week_data = next((w for w in weeks if w['week'] == week_num), weeks[-1])
            topic = week_data['topic']
            methodology = week_data.get('methodology', '启发式思维')
        
        prompt = f"""
        你是数学助教小安，辅导12岁女孩艾米（12岁）。
        当前周：第{week_num}周
        课题：{topic}
        方法论指导：{methodology}
        
        规则：
        1. 保持亲切、耐心的语气。
        2. 采用启发式教学，绝对不要直接给出数学题的答案。
        3. 鼓励艾米分享她的思路，哪怕是错误的。
        4. 使用简单的语言，偶尔可以用表情符号。
        
        艾米说：{user_message}
        """
        response = model.generate_content(prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        error_msg = traceback.format_exc()
        return jsonify({
            "reply": f"连接云端大脑异常: {str(e)}",
            "trace": error_msg
        }), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    return jsonify({"message": "云端已接收，正在等待 Google Drive API 授权配置...", "path": "Cloud"}), 200

# Vercel 需要暴露 app
