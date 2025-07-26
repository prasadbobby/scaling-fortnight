from flask import Blueprint, request, jsonify, current_app, send_file
import base64
import io

visuals_bp = Blueprint('visuals', __name__)

@visuals_bp.route('/generate-diagram', methods=['POST'])
def generate_diagram():
    """Generate educational diagrams"""
    try:
        data = request.get_json()
        
        required_fields = ['concept', 'grade_level']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        imagen_service = current_app.service_manager.imagen
        
        # Check if service is available
        if not imagen_service.is_available():
            return jsonify({
                'success': False,
                'error': 'Image generation service not available',
                'message': 'Imagen API is not enabled or configured for this project',
                'fallback': {
                    'concept': data['concept'],
                    'grade_level': data['grade_level'],
                    'suggestion': 'Use text-based descriptions or draw diagrams manually'
                }
            }), 503
        
        diagram_data = imagen_service.generate_diagram(
            data['concept'],
            data['grade_level']
        )
        
        if diagram_data is None:
            return jsonify({
                'success': False,
                'error': 'Image generation failed',
                'concept': data['concept'],
                'grade_level': data['grade_level']
            }), 500
        
        # Encode image data
        encoded_image = base64.b64encode(diagram_data).decode('utf-8')
        
        return jsonify({
            'success': True,
            'data': {
                'image': encoded_image,
                'concept': data['concept'],
                'grade_level': data['grade_level'],
                'format': 'png'
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@visuals_bp.route('/generate-visual-aid', methods=['POST'])
def generate_visual_aid():
    """Generate visual aids based on description"""
    try:
        data = request.get_json()
        
        description = data.get('description')
        style = data.get('style', 'simple line drawing')
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        imagen_service = current_app.service_manager.imagen
        
        # Check if service is available
        if not imagen_service.is_available():
            return jsonify({
                'success': False,
                'error': 'Image generation service not available',
                'message': 'Imagen API is not enabled or configured for this project',
                'fallback': {
                    'description': description,
                    'style': style,
                    'text_description': f"Manual drawing suggestion: {description} in {style} style"
                }
            }), 503
        
        image_data = imagen_service.generate_educational_image(description, style)
        
        if image_data is None:
            return jsonify({
                'success': False,
                'error': 'Image generation failed',
                'description': description,
                'style': style
            }), 500
        
        # Encode image data
        encoded_image = base64.b64encode(image_data).decode('utf-8')
        
        return jsonify({
            'success': True,
            'data': {
                'image': encoded_image,
                'description': description,
                'style': style,
                'format': 'png'
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@visuals_bp.route('/generate-video', methods=['POST'])
def generate_video():
    """Generate educational videos"""
    try:
        data = request.get_json()
        
        description = data.get('description')
        duration = data.get('duration', 30)
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        veo_service = current_app.service_manager.veo
        
        # Check if service is available
        if not veo_service.is_available():
            return jsonify({
                'success': False,
                'error': 'Video generation service not available',
                'message': 'Veo API is not enabled or configured for this project',
                'fallback': {
                    'description': description,
                    'duration': duration,
                    'suggestion': 'Use text-based explanations or create simple animations manually'
                }
            }), 503
        
        video_data = veo_service.generate_educational_video(description, duration)
        
        if video_data is None:
            return jsonify({
                'success': False,
                'error': 'Video generation failed',
                'description': description,
                'duration': duration
            }), 500
        
        # Encode video data
        encoded_video = base64.b64encode(video_data).decode('utf-8')
        
        return jsonify({
            'success': True,
            'data': {
                'video': encoded_video,
                'description': description,
                'duration': duration,
                'format': 'mp4'
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@visuals_bp.route('/service-status', methods=['GET'])
def service_status():
    """Check visual generation service status"""
    try:
        imagen_service = current_app.service_manager.imagen
        veo_service = current_app.service_manager.veo
        
        return jsonify({
            'success': True,
            'services': {
                'imagen': {
                    'available': imagen_service.is_available(),
                    'description': 'Image generation service'
                },
                'veo': {
                    'available': veo_service.is_available(),
                    'description': 'Video generation service'
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500