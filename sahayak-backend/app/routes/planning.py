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
        
        agent = current_app.agent_manager.lesson_planner
        lesson_plan = agent.generate_weekly_lesson_plan(
            data['subjects'],
            data['grade_levels'],
            data['language'],
            duration_days
        )
        
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
        return jsonify({'error': str(e)}), 500

@planning_bp.route('/generate-activities', methods=['POST'])
def generate_activities():
    """Generate activity suggestions"""
    try:
        data = request.get_json()
        
        required_fields = ['topic', 'grade_levels', 'language']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        available_resources = data.get('available_resources', ['blackboard', 'chalk', 'notebooks'])
        
        agent = current_app.agent_manager.lesson_planner
        activities = agent.generate_activity_suggestions(
            data['topic'],
            data['grade_levels'],
            available_resources,
            data['language']
        )
        
        return jsonify({
            'success': True,
            'data': activities
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500