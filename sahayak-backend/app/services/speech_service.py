from google.cloud import speech
from google.cloud import texttospeech
import io
from typing import Dict, List
import os

class SpeechService:
    def __init__(self, project_id: str):
        # Set up authentication
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'firebase_config.json'
        
        self.speech_client = speech.SpeechClient()
        self.tts_client = texttospeech.TextToSpeechClient()
        self.project_id = project_id
    
    def transcribe_audio(self, audio_content: bytes, language_code: str = 'hi-IN') -> str:
        """Transcribe audio to text"""
        try:
            audio = speech.RecognitionAudio(content=audio_content)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=48000,
                language_code=language_code,
                enable_automatic_punctuation=True,
            )
            
            response = self.speech_client.recognize(config=config, audio=audio)
            
            transcript = ""
            for result in response.results:
                transcript += result.alternatives[0].transcript
            
            return transcript
            
        except Exception as e:
            raise Exception(f"Speech transcription failed: {str(e)}")
    
    def assess_reading(self, audio_content: bytes, expected_text: str, language_code: str = 'hi-IN') -> Dict:
        """Assess reading fluency and accuracy"""
        try:
            transcript = self.transcribe_audio(audio_content, language_code)
            
            # Basic assessment logic
            expected_words = expected_text.lower().split()
            spoken_words = transcript.lower().split()
            
            correct_words = 0
            total_words = len(expected_words)
            
            for i, word in enumerate(expected_words):
                if i < len(spoken_words) and word == spoken_words[i]:
                    correct_words += 1
            
            accuracy = (correct_words / total_words) * 100 if total_words > 0 else 0
            
            return {
                'transcript': transcript,
                'expected': expected_text,
                'accuracy': accuracy,
                'correct_words': correct_words,
                'total_words': total_words,
                'feedback': self._generate_feedback(accuracy)
            }
            
        except Exception as e:
            raise Exception(f"Reading assessment failed: {str(e)}")
    
    def text_to_speech(self, text: str, language_code: str = 'hi-IN') -> bytes:
        """Convert text to speech"""
        try:
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
            )
            
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )
            
            response = self.tts_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            return response.audio_content
            
        except Exception as e:
            raise Exception(f"Text-to-speech failed: {str(e)}")
    
    def _generate_feedback(self, accuracy: float) -> str:
        """Generate feedback based on accuracy"""
        if accuracy >= 90:
            return "Excellent reading! Keep up the good work."
        elif accuracy >= 70:
            return "Good reading! Try to focus on pronunciation."
        elif accuracy >= 50:
            return "Fair reading. Practice more to improve fluency."
        else:
            return "Needs improvement. Practice reading slowly and clearly."