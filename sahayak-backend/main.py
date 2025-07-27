# sahayak-backend/main.py
from flask import Flask, jsonify
from flask_cors import CORS
import traceback

from app.config import Config
from app.services.gemini_service import GeminiService
from app.services.agent_service import GoogleAgentService

# Import route blueprints
from app.routes.content import content_bp
from app.routes.materials import materials_bp
from app.routes.knowledge import knowledge_bp
from app.routes.visuals import visuals_bp
from app.routes.speech import speech_bp
from app.routes.analytics import analytics_bp
from app.routes.agents import agents_bp
from app.routes.planning import planning_bp
from app.routes.quiz_builder import quiz_builder_bp


class ServiceManager:
    def __init__(self, config):
        print("🔧 Initializing services with API key authentication...")
        
        # Initialize Gemini service with API key only
        self.gemini = GeminiService(config.GEMINI_API_KEY, config.PROJECT_ID)
        print("  ✅ Gemini service initialized")
        
        # Add mock imagen and veo services for visual routes
        class MockImagenService:
            def is_available(self):
                return False
        
        class MockVeoService:
            def is_available(self):
                return False
        
        self.imagen = MockImagenService()
        self.veo = MockVeoService()
        print("  ✅ Mock visual services initialized")

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
        # Initialize services WITHOUT Google Cloud authentication
        print("🚀 Starting AI service initialization...")
        app.service_manager = ServiceManager(Config)
        print("✅ All AI services ready")
        
        # Initialize Google AI Agent Service with API key only
        print("🤖 Initializing Google AI Agent Service...")
        app.agent_service = GoogleAgentService(
            Config.PROJECT_ID, 
            Config.LOCATION, 
            Config.GEMINI_API_KEY
        )
        print("✅ Google AI Agent Service ready")
        
        # Initialize a simple database mock
        class MockDB:
            def save_content(self, data):
                print(f"📝 Mock save content: {data.get('content_type')}")
                return f"mock_id_{hash(str(data))}"
            
            def save_lesson_plan(self, data):
                print(f"📝 Mock save lesson plan: {data.get('plan_type')}")
                return f"mock_plan_{hash(str(data))}"
                
            def save_assessment(self, data):
                print(f"📝 Mock save assessment: {data.get('assessment_type')}")
                return f"mock_assessment_{hash(str(data))}"
                
            def get_teacher_content(self, teacher_id, limit=50):
                return []
        
        app.db = MockDB()
        print("✅ Mock database initialized")
        
    except Exception as e:
        print(f"❌ Initialization Error: {str(e)}")
        traceback.print_exc()
        return None
    
    # Register blueprints
    print("📋 Registering API routes...")
    
    try:
        app.register_blueprint(content_bp, url_prefix='/api/content')
        app.register_blueprint(materials_bp, url_prefix='/api/materials')
        app.register_blueprint(knowledge_bp, url_prefix='/api/knowledge')
        app.register_blueprint(visuals_bp, url_prefix='/api/visuals')
        app.register_blueprint(speech_bp, url_prefix='/api/speech')
        app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
        app.register_blueprint(planning_bp, url_prefix='/api/planning')
        app.register_blueprint(agents_bp, url_prefix='/api/agents')
        app.register_blueprint(quiz_builder_bp, url_prefix='/api/quiz-builder')
        
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
                'version': '2.0.0-gemini-direct',
                'features': {
                    'gemini_api': True,
                    'content_generation': True,
                    'lesson_planning': True,
                    'material_differentiation': True,
                    'assessment_creation': True,
                    'knowledge_base': True
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
    print("🌟 Direct Gemini API Integration v2.0")
    
    app = create_app()
    if app:
        print("\n" + "="*60)
        print("🎓 SAHAYAK AI - COMPLETE SYSTEM")
        print("="*60)
        print("✅ Server starting at http://localhost:8080")
        print("🔗 Health check: http://localhost:8080/health")
        print("🌐 Frontend should connect to: http://localhost:3000")
        print("\n🚀 Features Available:")
        print("   • ✅ Story Generation")
        print("   • ✅ Game Creation")
        print("   • ✅ Lesson Planning")
        print("   • ✅ Material Differentiation")
        print("   • ✅ Assessment Creation")
        print("   • ✅ Knowledge Base Q&A")
        print("   • ✅ Activity Suggestions")
        print("   • ✅ Concept Explanations")
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