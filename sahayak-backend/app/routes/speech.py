from flask import Blueprint, request, jsonify, current_app
import base64

speech_bp = Blueprint('speech', __name__)

@speech_bp.route('/assess-reading', methods=['POST'])
def assess_reading():
    """Assess student reading fluency"""
    try:
        data = request.get_json()
        
        # Get audio data and expected text
        audio_base64 = data.get('audio_data')
        expected_text = data.get('expected_text')
        language_code = data.get('language_code', 'hi-IN')
        student_id = data.get('student_id')
        
        if not audio_base64 or not expected_text:
            return jsonify({'error': 'Audio data and expected text are required'}), 400
        
        # Decode audio data
        try:
            audio_data = base64.b64decode(audio_base64)
        except Exception:
            return jsonify({'error': 'Invalid audio data format'}), 400
        
        # Assess reading
        speech_service = current_app.service_manager.speech
        assessment_result = speech_service.assess_reading(
            audio_data, expected_text, language_code
        )
        
        # Save assessment if student_id provided
        if student_id:
            db = current_app.db
            assessment_data = {
                'student_id': student_id,
                'assessment_type': 'reading_fluency',
                'result': assessment_result
            }
            assessment_id = db.save_assessment(assessment_data)
            assessment_result['assessment_id'] = assessment_id
        
        return jsonify({
            'success': True,
            'data': assessment_result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@speech_bp.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech"""
    try:
        data = request.get_json()
        
        text = data.get('text')
        language_code = data.get('language_code', 'hi-IN')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        speech_service = current_app.service_manager.speech
        audio_data = speech_service.text_to_speech(text, language_code)
        
        # Encode audio data
        encoded_audio = base64.b64encode(audio_data).decode('utf-8')
        
        return jsonify({
            'success': True,
            'data': {
                'audio': encoded_audio,
                'text': text,
                'language_code': language_code,
                'format': 'mp3'
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@speech_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio to text"""
    try:
        data = request.get_json()
        
        audio_base64 = data.get('audio_data')
        language_code = data.get('language_code', 'hi-IN')
        
        if not audio_base64:
            return jsonify({'error': 'Audio data is required'}), 400
        
        # Decode audio data
        try:
            audio_data = base64.b64decode(audio_base64)
        except Exception:
            return jsonify({'error': 'Invalid audio data format'}), 400
        
        speech_service = current_app.service_manager.speech
        transcript = speech_service.transcribe_audio(audio_data, language_code)
        
        return jsonify({
            'success': True,
            'data': {
                'transcript': transcript,
                'language_code': language_code
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500