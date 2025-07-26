from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.models.database import FirebaseDB
from app.services.gemini_service import GeminiService
from app.services.imagen_service import ImagenService
from app.services.veo_service import VeoService
from app.services.speech_service import SpeechService
from app.agents.content_generator import ContentGeneratorAgent
from app.agents.material_differentiator import MaterialDifferentiatorAgent
from app.agents.lesson_planner import LessonPlannerAgent

# Import route blueprints
from app.routes.content import content_bp
from app.routes.materials import materials_bp
from app.routes.knowledge import knowledge_bp
from app.routes.visuals import visuals_bp
from app.routes.speech import speech_bp
from app.routes.planning import planning_bp
from app.routes.content_management import content_mgmt_bp
from app.routes.analytics import analytics_bp
from app.routes.export import export_bp
from app.routes.offline import offline_bp
from app.routes.ai_features import ai_features_bp
from app.routes.collaboration import collaboration_bp

class ServiceManager:
    def __init__(self, config):
        # Set up Google Cloud authentication
        config.setup_google_auth()
        
        self.gemini = GeminiService(config.GEMINI_API_KEY, config.PROJECT_ID)
        self.imagen = ImagenService(config.PROJECT_ID, config.LOCATION)
        self.veo = VeoService(config.PROJECT_ID, config.LOCATION)
        self.speech = SpeechService(config.PROJECT_ID)

class AgentManager:
    def __init__(self, service_manager):
        self.content_generator = ContentGeneratorAgent(
            service_manager.gemini,
            service_manager.imagen,
            service_manager.veo
        )
        self.material_differentiator = MaterialDifferentiatorAgent(
            service_manager.gemini
        )
        self.lesson_planner = LessonPlannerAgent(
            service_manager.gemini
        )

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app)
    
    # Set max content length for file uploads
    app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH
    
    try:
        # Validate configuration
        print("🔍 Validating configuration...")
        Config.validate_config()
        print("✅ Configuration valid")
        
        # Initialize services
        print("📊 Connecting to Firebase...")
        app.db = FirebaseDB(Config.FIREBASE_CREDENTIALS_PATH)
        print("✅ Firebase connected")
        
        print("🔧 Initializing AI services...")
        app.service_manager = ServiceManager(Config)
        print("✅ AI services ready")
        
        print("🤖 Initializing agents...")
        app.agent_manager = AgentManager(app.service_manager)
        print("✅ Agents ready")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None
    
    # Register blueprints
    app.register_blueprint(content_bp, url_prefix='/api/content')
    app.register_blueprint(materials_bp, url_prefix='/api/materials')
    app.register_blueprint(knowledge_bp, url_prefix='/api/knowledge')
    app.register_blueprint(visuals_bp, url_prefix='/api/visuals')
    app.register_blueprint(speech_bp, url_prefix='/api/speech')
    app.register_blueprint(planning_bp, url_prefix='/api/planning')
    app.register_blueprint(content_mgmt_bp, url_prefix='/api/content-management')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(export_bp, url_prefix='/api/export')
    app.register_blueprint(offline_bp, url_prefix='/api/offline')
    app.register_blueprint(ai_features_bp, url_prefix='/api/ai-features')
    app.register_blueprint(collaboration_bp, url_prefix='/api/collaboration')
    
    # Health check
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Sahayak AI Teaching Assistant',
            'project_id': Config.PROJECT_ID
        })
    
    return app

if __name__ == '__main__':
    print("🚀 Starting Sahayak AI Teaching Assistant...")
    
    app = create_app()
    if app:
        print("✅ Server starting at http://localhost:8080")
        print("🔗 Health check: http://localhost:8080/health")
        app.run(debug=Config.DEBUG, host='0.0.0.0', port=8080)
    else:
        print("❌ Failed to start application")
        print("💡 Check your .env file and firebase_config.json")