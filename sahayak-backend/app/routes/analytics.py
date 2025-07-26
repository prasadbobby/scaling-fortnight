from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from collections import defaultdict, Counter

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/teacher-dashboard/<teacher_id>', methods=['GET'])
def get_teacher_dashboard(teacher_id):
    """Get comprehensive teacher dashboard data"""
    try:
        db = current_app.db
        
        # Get date range
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Content generation stats
        content_stats = get_content_statistics(db, teacher_id, start_date)
        
        # Usage patterns
        usage_patterns = get_usage_patterns(db, teacher_id, start_date)
        
        # Student assessment insights
        assessment_insights = get_assessment_insights(db, teacher_id, start_date)
        
        # Recommendations
        recommendations = generate_recommendations(content_stats, usage_patterns)
        
        return jsonify({
            'success': True,
            'data': {
                'content_stats': content_stats,
                'usage_patterns': usage_patterns,
                'assessment_insights': assessment_insights,
                'recommendations': recommendations,
                'period_days': days
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_content_statistics(db, teacher_id, start_date):
    """Get content generation statistics"""
    docs = db.db.collection('content')\
            .where('teacher_id', '==', teacher_id)\
            .where('created_at', '>=', start_date)\
            .stream()
    
    stats = {
        'total_content': 0,
        'by_type': defaultdict(int),
        'by_subject': defaultdict(int),
        'by_language': defaultdict(int),
        'by_grade': defaultdict(int),
        'daily_activity': defaultdict(int)
    }
    
    for doc in docs:
        data = doc.to_dict()
        stats['total_content'] += 1
        
        # Count by type
        content_type = data.get('content_type', 'unknown')
        stats['by_type'][content_type] += 1
        
        # Count by metadata
        metadata = data.get('metadata', {})
        if 'subject' in metadata:
            stats['by_subject'][metadata['subject']] += 1
        if 'language' in metadata:
            stats['by_language'][metadata['language']] += 1
        if 'grade_level' in metadata:
            stats['by_grade'][str(metadata['grade_level'])] += 1
        
        # Daily activity
        created_at = data.get('created_at')
        if created_at:
            date_str = created_at.date().isoformat()
            stats['daily_activity'][date_str] += 1
    
    return dict(stats)

def get_usage_patterns(db, teacher_id, start_date):
    """Analyze usage patterns"""
    # This would analyze when teacher uses the system most
    patterns = {
        'peak_hours': [9, 10, 14, 15],  # Most active hours
        'favorite_features': ['story_generation', 'lesson_planning'],
        'avg_session_duration': '25 minutes',
        'most_used_languages': ['Hindi', 'English', 'Marathi']
    }
    return patterns

def get_assessment_insights(db, teacher_id, start_date):
    """Get student assessment insights"""
    docs = db.db.collection('assessments')\
            .where('teacher_id', '==', teacher_id)\
            .where('created_at', '>=', start_date)\
            .stream()
    
    insights = {
        'total_assessments': 0,
        'avg_accuracy': 0,
        'improvement_trend': 'positive',
        'common_difficulties': []
    }
    
    accuracies = []
    for doc in docs:
        data = doc.to_dict()
        insights['total_assessments'] += 1
        
        result = data.get('result', {})
        if 'accuracy' in result:
            accuracies.append(result['accuracy'])
    
    if accuracies:
        insights['avg_accuracy'] = sum(accuracies) / len(accuracies)
    
    return insights

def generate_recommendations(content_stats, usage_patterns):
    """Generate personalized recommendations"""
    recommendations = []
    
    # Based on content creation patterns
    if content_stats['by_type'].get('story', 0) > content_stats['by_type'].get('worksheet', 0):
        recommendations.append({
            'type': 'content_diversification',
            'message': 'Try creating more worksheets to complement your stories',
            'action': 'create_worksheet'
        })
    
    # Language usage recommendations
    if len(content_stats['by_language']) == 1:
        recommendations.append({
            'type': 'multilingual_content',
            'message': 'Consider creating content in multiple languages for better accessibility',
            'action': 'explore_languages'
        })
    
    return recommendations

@analytics_bp.route('/content-performance/<content_id>', methods=['GET'])
def get_content_performance(content_id):
    """Get performance metrics for specific content"""
    try:
        db = current_app.db
        
        # Get content details
        content_doc = db.db.collection('content').document(content_id).get()
        if not content_doc.exists:
            return jsonify({'error': 'Content not found'}), 404
        
        content_data = content_doc.to_dict()
        
        # Mock performance data (in production, track real usage)
        performance = {
            'views': 45,
            'shares': 12,
            'favorites': 8,
            'effectiveness_score': 8.5,
            'student_engagement': 'high',
            'usage_frequency': 'weekly'
        }
        
        return jsonify({
            'success': True,
            'content': content_data,
            'performance': performance
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500