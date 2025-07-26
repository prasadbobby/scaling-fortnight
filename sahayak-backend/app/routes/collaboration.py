from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

collaboration_bp = Blueprint('collaboration', __name__)

@collaboration_bp.route('/create-teacher-group', methods=['POST'])
def create_teacher_group():
    """Create a teacher collaboration group"""
    try:
        data = request.get_json()
        group_name = data.get('group_name')
        description = data.get('description', '')
        creator_id = data.get('creator_id')
        
        if not all([group_name, creator_id]):
            return jsonify({'error': 'Group name and creator ID required'}), 400
        
        db = current_app.db
        group_data = {
            'name': group_name,
            'description': description,
            'creator_id': creator_id,
            'members': [creator_id],
            'created_at': datetime.utcnow(),
            'content_count': 0,
            'active': True
        }
        
        group_id = db.db.collection('teacher_groups').add(group_data)[1].id
        
        return jsonify({
            'success': True,
            'group_id': group_id,
            'group_data': group_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/share-to-group', methods=['POST'])
def share_to_group():
    """Share content with teacher group"""
    try:
        data = request.get_json()
        content_id = data.get('content_id')
        group_id = data.get('group_id')
        teacher_id = data.get('teacher_id')
        message = data.get('message', '')
        
        db = current_app.db
        
        # Verify group membership
        group_doc = db.db.collection('teacher_groups').document(group_id).get()
        if not group_doc.exists:
            return jsonify({'error': 'Group not found'}), 404
        
        group_data = group_doc.to_dict()
        if teacher_id not in group_data.get('members', []):
            return jsonify({'error': 'Not a group member'}), 403
        
        # Create shared content entry
        share_data = {
            'content_id': content_id,
            'group_id': group_id,
            'shared_by': teacher_id,
            'message': message,
            'shared_at': datetime.utcnow(),
            'likes': 0,
            'comments': []
        }
        
        share_id = db.db.collection('group_shares').add(share_data)[1].id
        
        return jsonify({
            'success': True,
            'share_id': share_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/group-feed/<group_id>', methods=['GET'])
def get_group_feed(group_id):
    """Get group activity feed"""
    try:
        db = current_app.db
        
        # Get recent shares
        shares = db.db.collection('group_shares')\
                    .where('group_id', '==', group_id)\
                    .order_by('shared_at', direction='DESCENDING')\
                    .limit(20)\
                    .stream()
        
        feed_items = []
        for share_doc in shares:
            share_data = share_doc.to_dict()
            share_data['id'] = share_doc.id
            
            # Get content details
            content_doc = db.db.collection('content').document(share_data['content_id']).get()
            if content_doc.exists:
                content_data = content_doc.to_dict()
                share_data['content'] = {
                    'title': content_data.get('metadata', {}).get('topic', 'Untitled'),
                    'type': content_data.get('content_type'),
                    'preview': content_data.get('content', '')[:200] + '...'
                }
            
            feed_items.append(share_data)
        
        return jsonify({
            'success': True,
            'feed': feed_items,
            'group_id': group_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500