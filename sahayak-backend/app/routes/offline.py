from flask import Blueprint, request, jsonify, current_app
import json
import zipfile
import io

offline_bp = Blueprint('offline', __name__)

@offline_bp.route('/download-offline-package', methods=['POST'])
def download_offline_package():
    """Create offline content package"""
    try:
        data = request.get_json()
        teacher_id = data.get('teacher_id')
        content_types = data.get('content_types', ['story', 'worksheet', 'lesson_plan'])
        subjects = data.get('subjects', [])
        
        db = current_app.db
        
        # Create ZIP file in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add content files
            content_query = db.db.collection('content').where('teacher_id', '==', teacher_id)
            
            for doc in content_query.stream():
                content_data = doc.to_dict()
                content_type = content_data.get('content_type')
                
                if content_type in content_types:
                    # Create filename
                    filename = f"{content_type}/{doc.id}.json"
                    
                    # Add to ZIP
                    zip_file.writestr(filename, json.dumps(content_data, indent=2, default=str))
            
            # Add templates and resources
            templates = get_offline_templates()
            zip_file.writestr('templates/templates.json', json.dumps(templates, indent=2))
            
            # Add offline app manifest
            manifest = {
                'version': '1.0.0',
                'created_at': datetime.utcnow().isoformat(),
                'teacher_id': teacher_id,
                'content_count': len(content_types)
            }
            zip_file.writestr('manifest.json', json.dumps(manifest, indent=2))
        
        zip_buffer.seek(0)
        
        return send_file(
            zip_buffer,
            as_attachment=True,
            download_name=f'sahayak_offline_{teacher_id}.zip',
            mimetype='application/zip'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_offline_templates():
    """Get templates for offline use"""
    return {
        'story_templates': [
            {
                'id': 'science_story',
                'name': 'Science Concept Story',
                'template': 'Once upon a time in {setting}, {character} discovered {concept}...'
            }
        ],
        'worksheet_templates': [
            {
                'id': 'math_worksheet',
                'name': 'Math Practice',
                'sections': ['warm_up', 'main_problems', 'challenge']
            }
        ]
    }

@offline_bp.route('/sync-offline-data', methods=['POST'])
def sync_offline_data():
    """Sync offline created content back to cloud"""
    try:
        # Handle file upload of offline data
        if 'offline_data' not in request.files:
            return jsonify({'error': 'No offline data file provided'}), 400
        
        file = request.files['offline_data']
        teacher_id = request.form.get('teacher_id')
        
        if not teacher_id:
            return jsonify({'error': 'Teacher ID required'}), 400
        
        # Process uploaded ZIP file
        with zipfile.ZipFile(file, 'r') as zip_file:
            synced_content = []
            
            for filename in zip_file.namelist():
                if filename.endswith('.json') and not filename.startswith('templates/'):
                    with zip_file.open(filename) as content_file:
                        content_data = json.load(content_file)
                        
                        # Add sync metadata
                        content_data['synced_at'] = datetime.utcnow()
                        content_data['sync_source'] = 'offline'
                        
                        # Save to database
                        db = current_app.db
                        doc_id = db.save_content(content_data)
                        synced_content.append(doc_id)
        
        return jsonify({
            'success': True,
            'synced_items': len(synced_content),
            'content_ids': synced_content
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500