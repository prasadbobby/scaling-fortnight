from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
import json

content_mgmt_bp = Blueprint('content_management', __name__)

@content_mgmt_bp.route('/favorites', methods=['POST'])
def add_to_favorites():
    """Add content to teacher's favorites"""
    try:
        data = request.get_json()
        teacher_id = data.get('teacher_id')
        content_id = data.get('content_id')
        content_type = data.get('content_type')
        
        if not all([teacher_id, content_id, content_type]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        db = current_app.db
        favorite_data = {
            'teacher_id': teacher_id,
            'content_id': content_id,
            'content_type': content_type,
            'favorited_at': datetime.utcnow()
        }
        
        favorite_id = db.db.collection('favorites').add(favorite_data)[1].id
        
        return jsonify({
            'success': True,
            'favorite_id': favorite_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_mgmt_bp.route('/search', methods=['POST'])
def search_content():
    """Search through generated content"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        teacher_id = data.get('teacher_id')
        content_type = data.get('content_type', 'all')
        language = data.get('language', 'all')
        
        # Simple search implementation
        db = current_app.db
        results = []
        
        # Get teacher's content
        content_collection = db.db.collection('content')
        query_ref = content_collection.where('teacher_id', '==', teacher_id)
        
        if content_type != 'all':
            query_ref = query_ref.where('content_type', '==', content_type)
        
        docs = query_ref.limit(100).stream()
        
        for doc in docs:
            content_data = doc.to_dict()
            content_data['id'] = doc.id
            
            # Simple text search in content
            content_text = str(content_data.get('content', '')).lower()
            if query.lower() in content_text:
                results.append(content_data)
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_mgmt_bp.route('/content-templates', methods=['GET'])
def get_content_templates():
    """Get pre-built content templates"""
    templates = {
        'story_templates': [
            {
                'name': 'Science Concept Story',
                'description': 'Story template to explain scientific concepts',
                'subjects': ['Science', 'Physics', 'Chemistry', 'Biology'],
                'template': 'Create a story about {concept} featuring {characters} in {setting}. The story should explain {learning_objective} in simple terms for Grade {grade} students.'
            },
            {
                'name': 'Math Problem Story',
                'description': 'Story template for math word problems',
                'subjects': ['Mathematics'],
                'template': 'Create a story about {character} who needs to solve a {math_concept} problem. Include real-life scenarios relevant to {cultural_context}.'
            },
            {
                'name': 'History Narrative',
                'description': 'Historical event storytelling template',
                'subjects': ['History', 'Social Studies'],
                'template': 'Tell the story of {historical_event} from the perspective of {character_type}. Make it engaging for Grade {grade} students while maintaining historical accuracy.'
            }
        ],
        'worksheet_templates': [
            {
                'name': 'Comprehension Worksheet',
                'description': 'Reading comprehension with questions',
                'subjects': ['Language', 'English', 'Hindi'],
                'sections': ['passage', 'vocabulary', 'questions', 'activities']
            },
            {
                'name': 'Math Practice Sheet',
                'description': 'Mathematical problem practice',
                'subjects': ['Mathematics'],
                'sections': ['examples', 'practice_problems', 'word_problems', 'challenge_questions']
            }
        ]
    }
    
    return jsonify({
        'success': True,
        'templates': templates
    })