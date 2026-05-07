from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
import json
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app)

# 配置 Gemini
# 在 Vercel 部署时，需要在 Vercel Dashboard 设置环境变量 GEMINI_API_KEY
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
else:
    model = None

@app.route('/chat', methods=['POST'])
def chat():
    if not model:
        return jsonify({"reply": "云端大脑未配置 API Key"}), 500
    
    data = request.json
    user_message = data.get('message')
    week_num = data.get('week', 8)
    
    try:
        # 在 Vercel 中，路径相对于项目根目录
        curriculum_path = os.path.join(os.getcwd(), 'curriculum.json')
        if not os.path.exists(curriculum_path):
            # 备用路径尝试
            curriculum_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'curriculum.json')
            
        with open(curriculum_path, 'r') as f:
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
        traceback.print_exc()
        return jsonify({"reply": "连接云端大脑失败"}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    # 注意：Vercel 是 Serverless 环境，没有持久化磁盘。
    # 这里的上传功能需要后续升级为 Google Drive API 才能真正同步。
    # 目前仅作为成功接收的响应。
    return jsonify({"message": "云端已接收，正在等待 Google Drive API 授权配置...", "path": "Cloud"}), 200

# Vercel 需要这个变量
app_handler = app
