# sahayak-backend/app/routes/quiz_builder.py
from flask import Blueprint, request, jsonify, current_app
import json
import uuid
from datetime import datetime, timezone
from ..services.google_forms_service import GoogleFormsService
from ..services.forms_alternative_service import FormsAlternativeService

quiz_builder_bp = Blueprint('quiz_builder', __name__)

# Try Google Forms API first, fallback to alternative
try:
    google_forms = GoogleFormsService()
    if not google_forms.is_available():
        raise Exception("Google Forms API not available")
    print("✅ Using Google Forms API")
    forms_service = google_forms
except Exception as e:
    print(f"⚠️ Google Forms API unavailable: {e}")
    print("🔄 Using Alternative Forms Service")
    forms_service = FormsAlternativeService()

@quiz_builder_bp.route('/create-google-form-quiz', methods=['POST'])
def create_google_form_quiz():
    """Create quiz using available service"""
    try:
        data = request.get_json()
        print(f"📝 Received quiz request: {data}")
        
        # Validate required fields
        required_fields = ['subject', 'grade_level', 'topic', 'num_questions']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        teacher_id = data.get('teacher_id', 'anonymous')
        
        # Generate quiz content using AI
        print("🤖 Generating quiz content...")
        quiz_data = generate_adaptive_quiz_content(data)
        
        if not quiz_data or 'questions' not in quiz_data:
            return jsonify({
                'success': False,
                'error': 'Failed to generate quiz content'
            }), 500
        
        # Create form using available service
        print(f"📋 Creating form using {forms_service.__class__.__name__}...")
        form_result = forms_service.create_quiz_form(quiz_data)
        
        if form_result['success']:
            # Save quiz record
            quiz_record = {
                'quiz_id': str(uuid.uuid4()),
                'teacher_id': teacher_id,
                'form_id': form_result['form_id'],
                'quiz_data': quiz_data,
                'input_params': data,
                'created_at': datetime.utcnow(),
                'status': 'active',
                'creation_method': form_result.get('creation_method', 'api')
            }
            
            print(f"✅ Quiz created successfully: {form_result['form_id']}")
            
            response_data = {
                'success': True,
                'quiz_id': quiz_record['quiz_id'],
                'form_id': form_result['form_id'],
                'quiz_preview': {
                    'title': quiz_data['title'],
                    'description': quiz_data['description'],
                    'num_questions': len(quiz_data['questions']),
                    'estimated_time': quiz_data.get('estimated_time', '15 minutes'),
                    'total_points': quiz_data.get('total_points', 0)
                }
            }
            
            # Add appropriate response based on service type
            if isinstance(forms_service, FormsAlternativeService):
                response_data.update({
                    'creation_method': 'manual_guided',
                    'apps_script_code': form_result['apps_script_code'],
                    'manual_guide': form_result['manual_guide'],
                    'instructions': {
                        'method_1': 'Use Google Apps Script (automated)',
                        'method_2': 'Manual creation with step-by-step guide',
                        'recommended': 'method_1'
                    }
                })
            else:
                response_data.update({
                    'form_url': form_result['form_url'],
                    'edit_url': form_result['edit_url'],
                    'responses_url': form_result['responses_url'],
                    'creation_method': 'api_direct'
                })
            
            return jsonify(response_data)
        else:
            print(f"❌ Form creation failed: {form_result['error']}")
            return jsonify({
                'success': False,
                'error': form_result['error']
            }), 500
            
    except Exception as e:
        print(f"❌ Quiz creation error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@quiz_builder_bp.route('/test-connection', methods=['GET'])
def test_forms_connection():
    """Test forms service connection"""
    try:
        service_info = {
            'service_type': forms_service.__class__.__name__,
            'available': forms_service.is_available(),
        }
        
        if hasattr(forms_service, 'get_service_account_email'):
            service_info['service_account_email'] = forms_service.get_service_account_email()
        
        if hasattr(forms_service, 'get_error_message'):
            service_info['error_message'] = forms_service.get_error_message()
        
        return jsonify({
            'success': True,
            'message': f'Using {service_info["service_type"]}',
            'details': service_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500