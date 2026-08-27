import datetime
import uuid
from flask import Blueprint, request, jsonify, current_app
from web_app.jwt_utils import jwt_required

from src.utils.llm_client import get_llm_client, get_llm_model
from web_app.models import db, ChatMessage

chat_bp = Blueprint('chat_api', __name__, url_prefix='/api/chat')

@chat_bp.route('/', methods=['POST'])
@jwt_required
def chat(current_user):
    try:
        data = request.get_json()
        user_message = data.get('message')
        conversation_id = data.get('conversation_id')
        mode = data.get('mode', 'General')
        learning_path_id = data.get('path_id')

        if not user_message:
            return jsonify({'success': False, 'error': 'Message required'}), 400

        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        # Load history
        history_messages = []
        try:
            db_history = ChatMessage.get_conversation_history(conversation_id, limit=10)
            for msg in db_history:
                history_messages.append({"role": msg.role, "content": msg.message})
        except Exception:
            pass

        client = get_llm_client()
        system_prompt = (
            "You are Atlas, a highly intelligent and encouraging AI Learning Guide. "
            "You help users understand topics, navigate their learning paths, and answer questions. "
            "Keep your tone professional, supportive, and engaging. "
            "Use ONLY pure markdown for all formatting. DO NOT use HTML tags like <br> under any circumstances. "
            "When generating quizzes or structured lists, use standard markdown bullet points, numbered lists, or elegant markdown tables without overusing bold text. Ensure the output looks polished and readable."
        )
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history_messages)
        messages.append({"role": "user", "content": user_message})

        import time as _time
        start_time = _time.time()
        completion = client.chat.completions.create(model=get_llm_model(), messages=messages, temperature=0.7, max_tokens=2500)
        response_time_ms = int((_time.time() - start_time) * 1000)
        ai_reply = completion.choices[0].message.content.strip()

        # Save to DB
        db.session.add(ChatMessage(user_id=current_user.id, learning_path_id=learning_path_id, message=user_message, role='user', conversation_id=conversation_id, timestamp=datetime.datetime.utcnow()))
        db.session.add(ChatMessage(user_id=current_user.id, learning_path_id=learning_path_id, message=ai_reply, role='assistant', conversation_id=conversation_id, response_time_ms=response_time_ms, timestamp=datetime.datetime.utcnow()))
        db.session.commit()

        return jsonify({
            'success': True,
            'reply': ai_reply,
            'conversation_id': conversation_id
        })
    except Exception as e:
        current_app.logger.error(f"Chat API Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
