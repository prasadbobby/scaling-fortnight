from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os

materials_bp = Blueprint('materials', __name__)

@materials_bp.route('/differentiate-textbook', methods=['POST'])
def differentiate_textbook():
    """Create differentiated materials from textbook page"""
    try:
        # Check if file is present
        if 'textbook_image' not in request.files:
            return jsonify({'error': 'No textbook image provided'}), 400
        
        file = request.files['textbook_image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get other parameters
        grade_levels = request.form.getlist('grade_levels', type=int)
        language = request.form.get('language', 'en')
        teacher_id = request.form.get('teacher_id')
        
        if not grade_levels:
            return jsonify({'error': 'No grade levels specified'}), 400
        
        # Read image data
        image_data = file.read()
        
        # Get agent and process
        agent = current_app.agent_manager.material_differentiator
        result = agent.differentiate_textbook_page(image_data, grade_levels, language)
        
        # Save to database if teacher_id provided
        if teacher_id:
            db = current_app.db
            material_data = {
                'teacher_id': teacher_id,
                'content_type': 'differentiated_material',
                'grade_levels': grade_levels,
                'language': language,
                'result': result
            }
            material_id = db.save_content(material_data)
            result['material_id'] = material_id
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@materials_bp.route('/create-assessment', methods=['POST'])
def create_assessment():
    """Create multi-level assessments"""
    try:
        data = request.get_json()
        
        required_fields = ['topic', 'grade_levels', 'language']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        agent = current_app.agent_manager.material_differentiator
        result = agent.create_multi_level_assessment(
            data['topic'],
            data['grade_levels'],
            data['language']
        )
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500