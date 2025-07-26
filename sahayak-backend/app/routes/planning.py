from flask import Blueprint, request, jsonify, current_app

planning_bp = Blueprint('planning', __name__)

@planning_bp.route('/generate-lesson-plan', methods=['POST'])
def generate_lesson_plan():
    """Generate weekly lesson plans"""
    try:
        data = request.get_json()
        
        required_fields = ['subjects', 'grade_levels', 'language']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        duration_days = data.get('duration_days', 5)
        teacher_id = data.get('teacher_id')
        
        # Get agent service and generate lesson plan
        agent_service = current_app.agent_service
        lesson_plan = agent_service.generate_lesson_plan(data)
        
        # Save lesson plan if teacher_id provided
        if teacher_id:
            db = current_app.db
            plan_data = {
                'teacher_id': teacher_id,
                'plan_type': 'weekly_lesson_plan',
                'subjects': data['subjects'],
                'grade_levels': data['grade_levels'],
                'language': data['language'],
                'duration_days': duration_days,
                'content': lesson_plan
            }
            plan_id = db.save_lesson_plan(plan_data)
            lesson_plan['plan_id'] = plan_id
        
        return jsonify({
            'success': True,
            'data': lesson_plan
        })
        
    except Exception as e:
        print(f"❌ Lesson plan generation error: {e}")
        return jsonify({'error': str(e)}), 500