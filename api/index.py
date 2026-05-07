from flask import Flask,request,jsonify
from flask_cors import CORS
import os,google.generativeai as genai,traceback
app=Flask(__name__);CORS(app)
api_key=os.environ.get("GEMINI_API_KEY")
if api_key:
             genai.configure(api_key=api_key)
             model=genai.GenerativeModel('gemini-1.5-flash')
else:model=None
            @app.route('/chat',methods=['POST'])
def chat():
 if not model:return jsonify({"reply":"No model"}),500
              data=request.json
 try:
  res=model.generate_content(data.get('message'))
               return jsonify({"reply":res.text})
except Exception as e:
  traceback.print_exc()
  return jsonify({"reply":str(e)}),500
