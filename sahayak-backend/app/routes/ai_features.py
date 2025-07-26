from flask import Blueprint, request, jsonify, current_app
import json

ai_features_bp = Blueprint('ai_features', __name__)

@ai_features_bp.route('/smart-recommendations', methods=['POST'])
def get_smart_recommendations():
    """AI-powered content recommendations"""
    try:
        data = request.get_json()
        teacher_id = data.get('teacher_id')
        current_topic = data.get('current_topic')
        grade_levels = data.get('grade_levels', [])
        
        # Analyze teacher's history and preferences
        db = current_app.db
        teacher_content = list(db.db.collection('content')
                             .where('teacher_id', '==', teacher_id)
                             .limit(50).stream())
        
        # Generate recommendations using Gemini
        gemini_service = current_app.service_manager.gemini
        
        prompt = f"""
        Based on a teacher's content creation history and current needs, suggest 5 relevant educational content ideas.
        
        Current topic: {current_topic}
        Grade levels: {grade_levels}
        
        Teacher's previous content themes: {analyze_content_themes(teacher_content)}
        
        Provide recommendations in JSON format with:
        - content_type (story, worksheet, activity, assessment)
        - title
        - description
        - learning_objectives
        - difficulty_level
        - estimated_time
        
        Focus on complementary content that builds on previous work.
        """
        
        recommendations_text = gemini_service.generate_content(prompt)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations_text,
            'context': {
                'topic': current_topic,
                'grade_levels': grade_levels,
                'based_on_history': len(teacher_content)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def analyze_content_themes(content_docs):
    """Analyze themes from teacher's content history"""
    themes = []
    for doc in content_docs:
        data = doc.to_dict()
        metadata = data.get('metadata', {})
        if 'topic' in metadata:
            themes.append(metadata['topic'])
    return list(set(themes))[:10]  # Top 10 unique themes

@ai_features_bp.route('/auto-curriculum-mapping', methods=['POST'])
def auto_curriculum_mapping():
    """Map content to curriculum standards"""
    try:
        data = request.get_json()
        content = data.get('content')
        grade_level = data.get('grade_level')
        subject = data.get('subject')
        
        gemini_service = current_app.service_manager.gemini
        
        prompt = f"""
        Analyze this educational content and map it to relevant curriculum standards:
        
        Content: {content}
        Grade Level: {grade_level}
        Subject: {subject}
        
        Provide mapping to:
        1. Learning objectives
        2. Skill development areas
        3. Assessment criteria
        4. Cross-curricular connections
        5. Bloom's taxonomy level
        
        Format as structured JSON.
        """
        
        mapping = gemini_service.generate_content(prompt)
        
        return jsonify({
            'success': True,
            'curriculum_mapping': mapping,
            'grade_level': grade_level,
            'subject': subject
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_features_bp.route('/content-quality-score', methods=['POST'])
def assess_content_quality():
    """AI-powered content quality assessment"""
    try:
        data = request.get_json()
        content = data.get('content')
        content_type = data.get('content_type')
        grade_level = data.get('grade_level')
        
        gemini_service = current_app.service_manager.gemini
        
        prompt = f"""
        Assess the quality of this {content_type} for Grade {grade_level} students:
        
        Content: {content}
        
        Evaluate on:
        1. Age appropriateness (1-10)
        2. Educational value (1-10)
        3. Engagement level (1-10)
        4. Clarity and comprehension (1-10)
        5. Cultural sensitivity (1-10)
        
        Provide:
        - Overall score (1-10)
        - Strengths
        - Areas for improvement
        - Specific suggestions
        
        Format as JSON.
        """
        
        assessment = gemini_service.generate_content(prompt)
        
        return jsonify({
            'success': True,
            'quality_assessment': assessment,
            'content_type': content_type,
            'grade_level': grade_level
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500