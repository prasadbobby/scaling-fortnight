# sahayak-backend/main.py
from flask import Flask, jsonify
from flask_cors import CORS
import traceback

from app.config import Config
from app.models.database import FirebaseDB
from app.services.gemini_service import GeminiService
from app.services.agent_service import GoogleAgentService
from app.services.imagen_service import ImagenService
from app.services.veo_service import VeoService
from app.services.speech_service import SpeechService

# Import route blueprints
from app.routes.content import content_bp
from app.routes.materials import materials_bp
from app.routes.knowledge import knowledge_bp
from app.routes.visuals import visuals_bp
from app.routes.speech import speech_bp
from app.routes.analytics import analytics_bp
from app.routes.agents import agents_bp

class ServiceManager:
    def __init__(self, config):
        # Set up Google Cloud authentication
        config.setup_google_auth()
        
        print("🔧 Initializing Google AI services...")
        self.gemini = GeminiService(config.GEMINI_API_KEY, config.PROJECT_ID)
        print("  ✅ Gemini service initialized")
        
        self.imagen = ImagenService(config.PROJECT_ID, config.LOCATION)
        print("  ✅ Imagen service initialized")
        
        self.veo = VeoService(config.PROJECT_ID, config.LOCATION)
        print("  ✅ Veo service initialized")
        
        self.speech = SpeechService(config.PROJECT_ID)
        print("  ✅ Speech service initialized")

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app, 
         origins=["http://localhost:3000", "http://127.0.0.1:3000"],
         methods=["GET", "POST", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "Cache-Control"],
         supports_credentials=False)
    
    # Set max content length
    app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH
    
    try:
        # Validate configuration
        print("🔍 Validating configuration...")
        Config.validate_config()
        print("✅ Configuration valid")
        
        # Initialize database
        print("📊 Connecting to Firebase...")
        app.db = FirebaseDB(Config.FIREBASE_CREDENTIALS_PATH)
        print("✅ Firebase connected")
        
        # Initialize services
        print("🚀 Starting Google AI service initialization...")
        app.service_manager = ServiceManager(Config)
        print("✅ All Google AI services ready")
        
        # Initialize Google AI Agent Service
        print("🤖 Initializing Google AI Agent Service...")
        app.agent_service = GoogleAgentService(
            Config.PROJECT_ID, 
            Config.LOCATION, 
            Config.GEMINI_API_KEY
        )
        print("✅ Google AI Agent Service ready")
        
    except Exception as e:
        print(f"❌ Initialization Error: {str(e)}")
        traceback.print_exc()
        return None
    
    # Register blueprints
    print("📋 Registering API routes...")
    
    try:
        # Core routes
        app.register_blueprint(content_bp, url_prefix='/api/content')
        app.register_blueprint(materials_bp, url_prefix='/api/materials')
        app.register_blueprint(knowledge_bp, url_prefix='/api/knowledge')
        app.register_blueprint(visuals_bp, url_prefix='/api/visuals')
        app.register_blueprint(speech_bp, url_prefix='/api/speech')
        app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
        
        # Google AI Agents
        app.register_blueprint(agents_bp, url_prefix='/api/agents')
        
        print("✅ All routes registered")
        
    except Exception as e:
        print(f"❌ Route registration error: {str(e)}")
        traceback.print_exc()
        return None
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        try:
            return jsonify({
                'status': 'healthy',
                'service': 'Sahayak AI Teaching Assistant',
                'project_id': Config.PROJECT_ID,
                'version': '2.0.0-google-ai-platform',
                'features': {
                    'google_ai_agents': True,
                    'real_time_monitoring': True,
                    'educational_workflows': True,
                    'powered_by': 'Google Cloud AI Platform'
                },
                'agent_system': {
                    'framework': 'Google Cloud AI Platform',
                    'active_workflows': len(app.agent_service.active_workflows),
                    'available_agents': len(app.agent_service.agents_config),
                    'capabilities': app.agent_service.get_agent_capabilities()
                }
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'error': str(e)
            }), 500
    
    return app

def run_development_server():
    """Run the development server"""
    print("🚀 Starting Sahayak AI Teaching Assistant...")
    print("🌟 Google Cloud AI Platform Agent System v2.0")
    
    app = create_app()
    if app:
        print("\n" + "="*60)
        print("🎓 SAHAYAK AI - GOOGLE CLOUD AI PLATFORM")
        print("="*60)
        print("✅ Server starting at http://localhost:8080")
        print("🔗 Health check: http://localhost:8080/health")
        print("🤖 Available agents: http://localhost:8080/api/agents/available-agents")
        print("📊 Agent status: http://localhost:8080/api/agents/test")
        print("🌐 Frontend should connect to: http://localhost:3000")
        print("\n🚀 Features Available:")
        print("   • Google Cloud AI Platform Integration")
        print("   • Gemini-Powered Educational Agents")
        print("   • Real-time Workflow Monitoring")
        print("   • Multi-Agent Collaboration")
        print("   • Content Generation Pipeline")
        print("   • Assessment Creation System")
        print("   • Material Adaptation Engine")
        print("   • Cultural Localization")
        print("   • Accessibility Enhancement")
        print("\n" + "="*60)
        
        try:
            app.run(
                debug=Config.DEBUG,
                host='0.0.0.0',
                port=8080,
                threaded=True
            )
        except KeyboardInterrupt:
            print("\n🛑 Shutting down Sahayak AI...")
            print("👋 Goodbye!")
    else:
        print("❌ Failed to start application")

if __name__ == '__main__':
    run_development_server()