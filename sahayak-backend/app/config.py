# sahayak-backend/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PROJECT_ID = os.getenv('PROJECT_ID', 'winged-hue-466922-d1')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBua6XA93RJNEJ3exr4c-WJXysIZsYnpDc')
    LOCATION = os.getenv('LOCATION', 'us-central1')
    
    # Firebase Configuration
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase_config.json')
    
    # Model Configuration
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
    IMAGEN_MODEL = os.getenv('IMAGEN_MODEL', 'imagen-3.0-fast-generate-001')
    VEO_MODEL = os.getenv('VEO_MODEL', 'veo-3-fast-generate-001')
    
    # Application Configuration
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    
    # Supported Languages
    SUPPORTED_LANGUAGES = {
        'hi': 'Hindi',
        'mr': 'Marathi',
        'bn': 'Bengali',
        'te': 'Telugu',
        'ta': 'Tamil',
        'gu': 'Gujarati',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi',
        'en': 'English'
    }
    
    # Grade Levels
    GRADE_LEVELS = list(range(1, 13))  # Grades 1-12
    
    @staticmethod
    def setup_google_auth():
        """Set up Google Cloud authentication"""
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = Config.FIREBASE_CREDENTIALS_PATH
        
    @staticmethod
    def validate_config():
        """Validate required configuration"""
        required_vars = ['PROJECT_ID', 'GEMINI_API_KEY', 'FIREBASE_CREDENTIALS_PATH']
        missing_vars = []
        
        for var in required_vars:
            if not getattr(Config, var) or getattr(Config, var) == '':
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required configuration: {', '.join(missing_vars)}")
        
        # Check if Firebase config file exists
        if not os.path.exists(Config.FIREBASE_CREDENTIALS_PATH):
            raise FileNotFoundError(f"Firebase config file not found: {Config.FIREBASE_CREDENTIALS_PATH}")
        
        return True