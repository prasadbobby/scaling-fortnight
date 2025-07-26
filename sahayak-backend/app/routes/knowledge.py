from flask import Blueprint, request, jsonify, current_app

knowledge_bp = Blueprint('knowledge', __name__)

@knowledge_bp.route('/explain-concept', methods=['POST'])
def explain_concept():
    """Provide simple explanations for complex concepts"""
    try:
        data = request.get_json()
        
        required_fields = ['question', 'grade_level', 'language']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        gemini_service = current_app.service_manager.gemini
        explanation = gemini_service.explain_concept(
            data['question'],
            data['grade_level'],
            data['language']
        )
        
        return jsonify({
            'success': True,
            'data': {
                'explanation': explanation,
                'question': data['question'],
                'grade_level': data['grade_level'],
                'language': data['language']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@knowledge_bp.route('/quick-answer', methods=['POST'])
def quick_answer():
    """Get quick answers to common questions"""
    try:
        data = request.get_json()
        
        question = data.get('question')
        language = data.get('language', 'en')
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        prompt = f"""
        Provide a quick, accurate answer to this question in {language}:
        
        Question: {question}
        
        Keep the answer:
        - Simple and clear
        - Factually accurate
        - Appropriate for teachers to share with students
        - Include relevant examples if helpful
        
        Answer in {language}:
        """
        
        gemini_service = current_app.service_manager.gemini
        answer = gemini_service.generate_content(prompt, language)
        
        return jsonify({
            'success': True,
            'data': {
                'answer': answer,
                'question': question,
                'language': language
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500