from flask import Blueprint, request, jsonify, current_app
import base64
import io

speech_bp = Blueprint('speech', __name__)

@speech_bp.route('/assess-reading', methods=['POST'])
def assess_reading():
    """Assess student reading fluency (Mock implementation)"""
    try:
        data = request.get_json()
        
        # Get audio data and expected text
        audio_base64 = data.get('audio_data')
        expected_text = data.get('expected_text')
        language_code = data.get('language_code', 'hi-IN')
        student_id = data.get('student_id')
        
        if not audio_base64 or not expected_text:
            return jsonify({'error': 'Audio data and expected text are required'}), 400
        
        # Mock assessment (since Speech API requires proper authentication)
        # In production, you would implement actual speech recognition here
        
        # Simple mock assessment based on text length and complexity
        expected_words = expected_text.split()
        total_words = len(expected_words)
        
        # Mock accuracy calculation
        import random
        base_accuracy = random.uniform(75, 95)  # Mock accuracy between 75-95%
        
        # Adjust based on text complexity
        if total_words > 50:
            base_accuracy -= 5
        if any(len(word) > 8 for word in expected_words):
            base_accuracy -= 3
            
        accuracy = max(60, min(100, base_accuracy))
        correct_words = int((accuracy / 100) * total_words)
        
        # Generate mock transcript with some variations
        mock_transcript = expected_text
        if accuracy < 90:
            # Introduce some "errors" for lower accuracy
            words = expected_text.split()
            if len(words) > 5:
                words[random.randint(0, len(words)-1)] = "[unclear]"
            mock_transcript = " ".join(words)
        
        assessment_result = {
            'transcript': mock_transcript,
            'expected': expected_text,
            'accuracy': round(accuracy, 1),
            'correct_words': correct_words,
            'total_words': total_words,
            'feedback': generate_feedback(accuracy),
            'language_code': language_code,
            'note': 'This is a mock assessment. Full speech recognition requires Google Cloud Speech API authentication.'
        }
        
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
        print(f"❌ Speech assessment error: {e}")
        return jsonify({'error': str(e)}), 500

@speech_bp.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech (Mock implementation)"""
    try:
        data = request.get_json()
        
        text = data.get('text')
        language_code = data.get('language_code', 'hi-IN')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Mock TTS response (since TTS requires proper Google Cloud authentication)
        # In production, you would implement actual text-to-speech here
        
        # Create a mock audio response
        mock_audio_data = base64.b64encode(b"mock_audio_data").decode('utf-8')
        
        return jsonify({
            'success': True,
            'data': {
                'audio': mock_audio_data,
                'text': text,
                'language_code': language_code,
                'format': 'mp3',
                'note': 'This is a mock audio response. Full TTS requires Google Cloud Text-to-Speech API authentication.'
            }
        })
        
    except Exception as e:
        print(f"❌ TTS error: {e}")
        return jsonify({'error': str(e)}), 500

@speech_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio to text (Mock implementation)"""
    try:
        data = request.get_json()
        
        audio_base64 = data.get('audio_data')
        language_code = data.get('language_code', 'hi-IN')
        
        if not audio_base64:
            return jsonify({'error': 'Audio data is required'}), 400
        
        # Mock transcription
        mock_transcript = "This is a mock transcription. Actual speech recognition requires Google Cloud Speech API authentication."
        
        return jsonify({
            'success': True,
            'data': {
                'transcript': mock_transcript,
                'language_code': language_code,
                'note': 'This is a mock transcription. Full speech recognition requires proper authentication.'
            }
        })
        
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        return jsonify({'error': str(e)}), 500

def generate_feedback(accuracy):
    """Generate feedback based on accuracy"""
    if accuracy >= 90:
        return "Excellent reading! Keep up the good work."
    elif accuracy >= 80:
        return "Good reading! Try to focus on pronunciation of difficult words."
    elif accuracy >= 70:
        return "Fair reading. Practice more to improve fluency and accuracy."
    else:
        return "Needs improvement. Practice reading slowly and clearly. Focus on each word."