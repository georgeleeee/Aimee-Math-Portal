import os
import json
from datetime import datetime
from http.server import BaseHTTPRequestHandler

def get_curriculum(week_num):
    try:
        # 在 Vercel 中，api 目录下的文件可以直接访问
        curriculum_path = os.path.join(os.path.dirname(__file__), 'curriculum.json')
        with open(curriculum_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            weeks = data.get('weeks', [])
            return next((w for w in weeks if w['week'] == week_num), weeks[-1])
    except:
        return {"topic": "数学探索", "methodology": "启发式思维"}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/ping' or self.path == '/ping':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "alive",
                "env_keys": list(os.environ.keys())
            }).encode())
            return
        
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/chat' or self.path == '/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            user_message = data.get('message')
            week_num = data.get('week', 8)
            week_data = get_curriculum(week_num)
            
            api_key = os.environ.get("GEMINI_API_KEY")
            
            if not api_key:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"reply": "云端大脑未配置 API Key (GEMINI_API_KEY)"}).encode())
                return

            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-2.0-flash-exp')
                
                prompt = f"""
                你是数学助教小安，辅导12岁女孩艾米（12岁）。
                当前周：第{week_num}周
                课题：{week_data['topic']}
                方法论指导：{week_data.get('methodology', '启发式思维')}
                
                规则：
                1. 保持亲切、耐心的语气。
                2. 采用启发式教学，绝对不要直接给出数学题的答案。
                3. 鼓励艾米分享她的思路，哪怕是错误的。
                4. 使用简单的语言，偶尔可以用表情符号。
                
                艾米说：{user_message}
                """
                response = model.generate_content(prompt)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"reply": response.text}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"reply": f"AI 处理失败: {str(e)}"}).encode())
            return

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
