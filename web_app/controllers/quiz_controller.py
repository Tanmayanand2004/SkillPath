"""
Skill Gap Quiz API for SkillPath.
Generates AI-powered diagnostic quizzes to assess user skill level.
"""
from flask import Blueprint, request, jsonify
from web_app.jwt_utils import jwt_required
import json, os

quiz_bp = Blueprint("quiz_api", __name__, url_prefix="/api/quiz")


def get_llm_client():
    from openai import OpenAI
    return OpenAI(
        api_key=os.getenv("GROQ_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1"),
    )


@quiz_bp.route("/generate", methods=["POST"])
def generate_quiz():
    """Generate a 5-question skill assessment quiz for a topic."""
    data = request.get_json()
    topic = data.get("topic", "").strip()
    if not topic:
        return jsonify({"success": False, "message": "Topic is required"}), 400

    client = get_llm_client()
    model = os.getenv("DEFAULT_MODEL", "llama-3.3-70b-versatile")

    system = """You are a skill assessment expert. Generate exactly 5 multiple-choice questions to assess a user's knowledge level on the given topic.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Rules:
- Question 1-2: Beginner level (basic concepts, definitions)
- Question 3: Intermediate (application of concepts)
- Question 4-5: Advanced (nuanced understanding, best practices)
- Each question must have exactly 4 options
- "correct" is the 0-based index of the correct option
- Keep questions concise and unambiguous"""

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": f"Generate a skill assessment quiz for: {topic}"}
            ],
            temperature=0.3,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        quiz_data = json.loads(content)
        return jsonify({"success": True, "quiz": quiz_data, "topic": topic})
    except Exception as e:
        # Fallback with static questions if LLM fails
        return jsonify({
            "success": True,
            "quiz": {
                "questions": [
                    {
                        "id": 1,
                        "question": f"How familiar are you with core {topic} concepts?",
                        "options": [
                            "Never heard of it",
                            "Know the basics",
                            "Have built projects with it",
                            "I could teach it"
                        ],
                        "correct": -1,  # Self-assessment, no wrong answer
                        "explanation": "Self-assessment question"
                    }
                ]
            },
            "topic": topic,
            "fallback": True
        })


@quiz_bp.route("/evaluate", methods=["POST"])
def evaluate_quiz():
    """Evaluate quiz answers and return recommended expertise level."""
    data = request.get_json()
    answers = data.get("answers", [])  # [{question_id, selected, correct}]
    topic = data.get("topic", "")

    if not answers:
        return jsonify({"success": False, "message": "Answers required"}), 400

    # Calculate score
    correct_count = sum(1 for a in answers if a.get("selected") == a.get("correct"))
    total = len(answers)
    score_pct = (correct_count / total) * 100 if total > 0 else 0

    # Map score to expertise level
    if score_pct <= 30:
        level = "beginner"
        level_label = "Absolute Beginner"
        message = f"You got {correct_count}/{total} correct. We'll start from the fundamentals — a perfect foundation!"
    elif score_pct <= 65:
        level = "intermediate"
        level_label = "Intermediate"
        message = f"You got {correct_count}/{total} correct. Great foundation! We'll skip basics and focus on deepening your skills."
    else:
        level = "advanced"
        level_label = "Advanced"
        message = f"Impressive! {correct_count}/{total} correct. Your path will be fast-tracked to cutting-edge techniques."

    return jsonify({
        "success": True,
        "score": correct_count,
        "total": total,
        "score_pct": score_pct,
        "recommended_level": level,
        "recommended_level_label": level_label,
        "message": message
    })
