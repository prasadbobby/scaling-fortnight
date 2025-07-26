from flask import Blueprint, request, jsonify, current_app
import base64

content_bp = Blueprint('content', __name__)

@content_bp.route('/generate-story', methods=['POST'])
def generate_story():
    """Generate hyper-local educational stories"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['topic', 'language', 'cultural_context']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get agent service and generate content
        agent_service = current_app.agent_service
        
        # Create prompt for story generation
        prompt = f"""
Create an educational story in {data.get('language', 'hi')} about {data.get('topic', '')}.

Requirements:
- Cultural context: {data.get('cultural_context', 'Indian rural')}
- Grade level: {data.get('grade_level', 5)}
- Content type: {data.get('content_type', 'story')}
- Make it engaging and educational
- Include moral values and learning objectives
- Length: 200-400 words
- Use simple, age-appropriate language

Please create a complete educational story that teaches about {data.get('topic', '')} in a culturally relevant way.

Story in {data.get('language', 'hi')}:
"""
        
        # Generate content using Gemini
        response = agent_service.gemini_model.generate_content(prompt)
        
        result = {
            'content': response.text,
            'metadata': {
                'topic': data.get('topic'),
                'language': data.get('language'),
                'grade_level': data.get('grade_level'),
                'content_type': data.get('content_type', 'story'),
                'cultural_context': data.get('cultural_context')
            }
        }
        
        # Save to database if teacher_id provided
        if 'teacher_id' in data:
            db = current_app.db
            content_data = {
                'teacher_id': data['teacher_id'],
                'content_type': 'story',
                'content': result['content'],
                'metadata': result['metadata']
            }
            content_id = db.save_content(content_data)
            result['content_id'] = content_id
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        print(f"❌ Story generation error: {e}")
        return jsonify({'error': str(e)}), 500

@content_bp.route('/generate-game', methods=['POST'])
def generate_game():
    """Generate educational games"""
    try:
        data = request.get_json()
        
        required_fields = ['topic', 'grade_level', 'language']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get agent service and generate content
        agent_service = current_app.agent_service
        
        # Create prompt for game generation
        prompt = f"""
Create an educational game in {data.get('language', 'hi')} about {data.get('topic', '')}.

Requirements:
- Grade level: {data.get('grade_level', 5)}
- Interactive and engaging for students
- Clear rules and objectives
- Educational value aligned with curriculum
- Can be played in classroom setting
- Materials should be easily available

Please provide:
1. Game Title
2. Learning Objectives
3. Materials Needed
4. Number of Players
5. Game Rules (step by step)
6. How to Win
7. Educational Benefits
8. Variations for different skill levels

Game content in {data.get('language', 'hi')}:
"""
        
        # Generate content using Gemini
        response = agent_service.gemini_model.generate_content(prompt)
        
        result = {
            'game_content': response.text,
            'metadata': {
                'topic': data.get('topic'),
                'language': data.get('language'),
                'grade_level': data.get('grade_level'),
                'content_type': 'game'
            }
        }
        
        # Save to database if teacher_id provided
        if 'teacher_id' in data:
            db = current_app.db
            content_data = {
                'teacher_id': data['teacher_id'],
                'content_type': 'game',
                'content': result['game_content'],
                'metadata': result['metadata']
            }
            content_id = db.save_content(content_data)
            result['content_id'] = content_id
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        print(f"❌ Game generation error: {e}")
        return jsonify({'error': str(e)}), 500

@content_bp.route('/teacher-content/<teacher_id>', methods=['GET'])
def get_teacher_content(teacher_id):
    """Get teacher's content history"""
    try:
        db = current_app.db
        limit = request.args.get('limit', 50, type=int)
        
        content_history = db.get_teacher_content(teacher_id, limit)
        
        return jsonify({
            'success': True,
            'data': content_history
        })
        
    except Exception as e:
        print(f"❌ Content history error: {e}")
        return jsonify({'error': str(e)}), 500