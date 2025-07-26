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
        
        # Get agent and generate content
        agent = current_app.agent_manager.content_generator
        result = agent.generate_hyper_local_content(data)
        
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
        
        # Encode visual data if present
        if result.get('visual'):
            result['visual'] = base64.b64encode(result['visual']).decode('utf-8')
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
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
        
        agent = current_app.agent_manager.content_generator
        result = agent.create_educational_game(
            data['topic'],
            data['grade_level'],
            data['language']
        )
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
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
        return jsonify({'error': str(e)}), 500