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
                    'suggestion': f"Create a hand-drawn diagram showing {data['concept']} suitable for Grade {data['grade_level']} students",
                    'text_description': f"A simple educational diagram explaining {data['concept']} with clear labels and age-appropriate illustrations for Grade {data['grade_level']} students."
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
                'grade_level': data['grade_level'],
                'fallback': {
                    'suggestion': f"Create a hand-drawn diagram of {data['concept']}",
                    'text_description': f"Draw a simple diagram showing {data['concept']} with clear labels for Grade {data['grade_level']} students."
                }
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
        print(f"❌ Diagram generation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Image generation failed',
            'message': str(e),
            'fallback': {
                'concept': data.get('concept', ''),
                'grade_level': data.get('grade_level', ''),
                'suggestion': f"Create a hand-drawn diagram of {data.get('concept', 'the concept')}",
                'text_description': f"Draw a simple educational diagram with clear labels appropriate for the grade level."
            }
        }), 500

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
                    'suggestion': f"Create a {style} showing {description}",
                    'text_description': f"Manual drawing suggestion: {description} in {style} style suitable for educational use."
                }
            }), 503
        
        image_data = imagen_service.generate_educational_image(description, style)
        
        if image_data is None:
            return jsonify({
                'success': False,
                'error': 'Image generation failed',
                'description': description,
                'style': style,
                'fallback': {
                    'suggestion': f"Create a {style} of {description}",
                    'text_description': f"Manual drawing suggestion: {description} using {style} technique."
                }
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
        print(f"❌ Visual aid generation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Image generation failed',
            'message': str(e),
            'fallback': {
                'description': description,
                'style': style,
                'suggestion': f"Create a {style} showing {description}",
                'text_description': f"Manual creation suggestion: {description} in {style} format."
            }
        }), 500

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
                    'suggestion': f"Create a {duration}-second educational presentation or animation about {description}",
                    'text_description': f"Manual creation suggestion: Develop educational content showing {description} over {duration} seconds."
                }
            }), 503
        
        video_data = veo_service.generate_educational_video(description, duration)
        
        if video_data is None:
            return jsonify({
                'success': False,
                'error': 'Video generation failed',
                'description': description,
                'duration': duration,
                'fallback': {
                    'suggestion': f"Create an educational presentation about {description}",
                    'text_description': f"Manual creation: Develop a {duration}-second educational video about {description}."
                }
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
        print(f"❌ Video generation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Video generation failed',
            'message': str(e),
            'fallback': {
                'description': description,
                'duration': duration,
                'suggestion': f"Create educational content about {description}",
                'text_description': f"Manual creation: Develop educational material covering {description}."
            }
        }), 500

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
        print(f"❌ Service status error: {e}")
        return jsonify({'error': str(e)}), 500