from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST', 'GET'])
def chat():
    if request.method == 'GET':
        return jsonify({"status": "Aimee AI Backend is Online", "env_check": "GEMINI_API_KEY" in os.environ})

    try:
        data = request.json
        user_message = data.get('message')
        week_num = data.get('week', 8)
        
        # 路径适配
        cur_dir = os.path.dirname(__file__)
        curriculum_path = os.path.join(cur_dir, 'curriculum.json')
        
        with open(curriculum_path, 'r', encoding='utf-8') as f:
            curriculum = json.load(f)
            weeks = curriculum.get('weeks', [])
            week_data = next((w for w in weeks if w['week'] == week_num), weeks[-1])

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return jsonify({"reply": "错误：云端 API Key 未配置。请在 Vercel 中设置 GEMINI_API_KEY。"}), 500

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = f"""
        你是数学助教小安，辅导12岁女孩艾米（12岁）。
        当前周：第{week_num}周
        课题：{week_data['topic']}
        方法论指导：{week_data.get('methodology', '启发式思维')}
        
        规则：
        1. 亲切耐心。
        2. 启发式教学，绝不直接给答案。
        3. 鼓励试错。
        
        艾米说：{user_message}
        """
        response = model.generate_content(prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": f"后端发生异常: {str(e)}"}), 500

# Vercel 适配
# 不要使用 app.run()
