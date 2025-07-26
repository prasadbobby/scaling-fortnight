from flask import Blueprint, request, jsonify, current_app, send_file
import io
import zipfile
import json
from datetime import datetime, timedelta  # Add this import
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
import base64

export_bp = Blueprint('export', __name__)

@export_bp.route('/export-content', methods=['POST'])
def export_content():
    """Export content in various formats"""
    try:
        data = request.get_json()
        content_ids = data.get('content_ids', [])
        export_format = data.get('format', 'pdf')  # pdf, docx, txt, json
        
        if not content_ids:
            return jsonify({'error': 'No content IDs provided'}), 400
        
        db = current_app.db
        exported_data = []
        
        # Fetch content
        for content_id in content_ids:
            doc = db.db.collection('content').document(content_id).get()
            if doc.exists:
                content_data = doc.to_dict()
                content_data['id'] = content_id
                exported_data.append(content_data)
        
        if export_format == 'pdf':
            pdf_buffer = create_pdf_export(exported_data)
            return send_file(
                pdf_buffer,
                as_attachment=True,
                download_name='sahayak_content.pdf',
                mimetype='application/pdf'
            )
        
        elif export_format == 'json':
            json_data = json.dumps(exported_data, indent=2, default=str)
            json_buffer = io.BytesIO(json_data.encode('utf-8'))
            return send_file(
                json_buffer,
                as_attachment=True,
                download_name='sahayak_content.json',
                mimetype='application/json'
            )
        
        else:
            return jsonify({'error': 'Unsupported export format'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_pdf_export(content_data):
    """Create PDF from content data"""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    y_position = height - 50
    
    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y_position, "Sahayak AI - Generated Content")
    y_position -= 40
    
    for content in content_data:
        # Check if we need a new page
        if y_position < 100:
            p.showPage()
            y_position = height - 50
        
        # Content title
        p.setFont("Helvetica-Bold", 12)
        title = f"{content.get('content_type', '').title()} - {content.get('metadata', {}).get('topic', 'Untitled')}"
        p.drawString(50, y_position, title)
        y_position -= 20
        
        # Content details
        p.setFont("Helvetica", 10)
        metadata = content.get('metadata', {})
        details = f"Grade: {metadata.get('grade_level', 'N/A')} | Language: {metadata.get('language', 'N/A')}"
        p.drawString(50, y_position, details)
        y_position -= 30
        
        # Content text
        p.setFont("Helvetica", 9)
        content_text = content.get('content', '')[:500] + '...' if len(content.get('content', '')) > 500 else content.get('content', '')
        
        # Wrap text
        lines = wrap_text(content_text, 80)
        for line in lines[:10]:  # Limit to 10 lines per content
            if y_position < 50:
                break
            p.drawString(50, y_position, line)
            y_position -= 12
        
        y_position -= 20
    
    p.save()
    buffer.seek(0)
    return buffer

def wrap_text(text, width):
    """Simple text wrapping"""
    words = text.split()
    lines = []
    current_line = []
    current_length = 0
    
    for word in words:
        if current_length + len(word) + 1 <= width:
            current_line.append(word)
            current_length += len(word) + 1
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
            current_length = len(word)
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines

@export_bp.route('/share-content', methods=['POST'])
def share_content():
    """Generate shareable links for content"""
    try:
        data = request.get_json()
        content_id = data.get('content_id')
        share_type = data.get('share_type', 'view_only')  # view_only, editable
        expiry_days = data.get('expiry_days', 7)
        
        if not content_id:
            return jsonify({'error': 'Content ID required'}), 400
        
        # Generate share token
        import secrets
        share_token = secrets.token_urlsafe(32)
        
        # Store share info in database
        db = current_app.db
        share_data = {
            'content_id': content_id,
            'share_token': share_token,
            'share_type': share_type,
            'created_at': datetime.utcnow(),
            'expires_at': datetime.utcnow() + timedelta(days=expiry_days),
            'access_count': 0
        }
        
        share_id = db.db.collection('shares').add(share_data)[1].id
        
        # Generate shareable URL
        share_url = f"https://your-domain.com/shared/{share_token}"
        
        return jsonify({
            'success': True,
            'share_url': share_url,
            'share_token': share_token,
            'expires_at': share_data['expires_at'].isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500