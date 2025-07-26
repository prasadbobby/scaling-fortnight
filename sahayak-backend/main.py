# sahayak-backend/main.py
from flask import Flask, jsonify
from flask_cors import CORS
import asyncio
import threading
import time
from datetime import datetime, timezone  # Add timezone import here
import uuid
import traceback

from app.config import Config
from app.models.database import FirebaseDB
from app.services.gemini_service import GeminiService
from app.services.imagen_service import ImagenService
from app.services.veo_service import VeoService
from app.services.speech_service import SpeechService

# Import all agents - Fix the import names
from app.agents.orchestrator import AgentOrchestrator
from app.agents.curriculum_planner_agent import CurriculumPlannerAgent
from app.agents.content_creator_agent import ContentCreatorAgent
from app.agents.material_differentiator_agent import MaterialDifferentiatorAgent
from app.agents.assessment_creator_agent import AssessmentCreatorAgent
from app.agents.visual_designer_agent import VisualDesignerAgent
from app.agents.integration_specialist_agent import IntegrationSpecialistAgent

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
from app.routes.agentic import agentic_bp

class ServiceManager:
    def __init__(self, config):
        # Set up Google Cloud authentication
        config.setup_google_auth()
        
        print("🔧 Initializing AI services...")
        self.gemini = GeminiService(config.GEMINI_API_KEY, config.PROJECT_ID)
        print("  ✅ Gemini service initialized")
        
        self.imagen = ImagenService(config.PROJECT_ID, config.LOCATION)
        print("  ✅ Imagen service initialized")
        
        self.veo = VeoService(config.PROJECT_ID, config.LOCATION)
        print("  ✅ Veo service initialized")
        
        self.speech = SpeechService(config.PROJECT_ID)
        print("  ✅ Speech service initialized")

class AgentManager:
    def __init__(self, service_manager, orchestrator):
        print("🤖 Initializing AI agents...")
        
        # Initialize all agents
        self.curriculum_planner = CurriculumPlannerAgent(service_manager.gemini)
        self.content_creator = ContentCreatorAgent(
            service_manager.gemini,
            service_manager.imagen,
            service_manager.veo
        )
        self.material_differentiator = MaterialDifferentiatorAgent(service_manager.gemini)
        self.assessment_creator = AssessmentCreatorAgent(service_manager.gemini)
        self.visual_designer = VisualDesignerAgent(
            service_manager.gemini,
            service_manager.imagen
        )
        self.integration_specialist = IntegrationSpecialistAgent(service_manager.gemini)
        
        # Legacy agents for backward compatibility
        self.content_generator = self.content_creator
        self.lesson_planner = LessonPlannerAgent(service_manager.gemini)
        
        # Register all agents with orchestrator
        agents = [
            self.curriculum_planner,
            self.content_creator,
            self.material_differentiator,
            self.assessment_creator,
            self.visual_designer,
            self.integration_specialist
        ]
        
        print("  📋 Registering agents with orchestrator...")
        for agent in agents:
            orchestrator.register_agent(agent)
            print(f"    ✅ {agent.name} registered")
        
        print("  🎯 Agent system ready")

class WorkflowManager:
    def __init__(self):
        self.active_workflows = {}
        self.workflow_history = {}
        self.workflow_lock = threading.Lock()
        
    def create_workflow(self, workflow_type, data, teacher_id):
        workflow_id = str(uuid.uuid4())
        
        with self.workflow_lock:
            self.active_workflows[workflow_id] = {
                'id': workflow_id,
                'type': workflow_type,
                'data': data,
                'teacher_id': teacher_id,
                'status': 'created',
                'events': [],
                'results': None,
                'created_at': datetime.now(timezone.utc),  # Fixed datetime
                'started_at': None,
                'completed_at': None,
                'agent_states': {},
                'progress': 0
            }
        
        return workflow_id
    
    def get_workflow(self, workflow_id):
        return self.active_workflows.get(workflow_id)
    
    def update_workflow_status(self, workflow_id, status, **kwargs):
        if workflow_id in self.active_workflows:
            with self.workflow_lock:
                self.active_workflows[workflow_id]['status'] = status
                self.active_workflows[workflow_id].update(kwargs)
    
    def log_workflow_event(self, workflow_id, event_type, data):
        if workflow_id in self.active_workflows:
            event = {
                'id': str(uuid.uuid4()),
                'type': event_type,
                'data': data,
                'timestamp': datetime.now(timezone.utc).isoformat(),  # Fixed datetime
                'sent': False
            }
            
            with self.workflow_lock:
                self.active_workflows[workflow_id]['events'].append(event)
    
    def complete_workflow(self, workflow_id, results):
        if workflow_id in self.active_workflows:
            with self.workflow_lock:
                workflow = self.active_workflows[workflow_id]
                workflow['status'] = 'completed'
                workflow['results'] = results
                workflow['completed_at'] = datetime.now(timezone.utc)  # Fixed datetime
                workflow['progress'] = 100
                
                # Move to history
                self.workflow_history[workflow_id] = workflow.copy()

# Legacy agent for backward compatibility
from app.agents.lesson_planner import LessonPlannerAgent

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS with specific configuration
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
    
    # Set max content length for file uploads
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
        print("🚀 Starting service initialization...")
        app.service_manager = ServiceManager(Config)
        print("✅ All AI services ready")
        
        # Initialize Workflow Manager FIRST
        print("⚙️ Initializing Workflow Manager...")
        app.workflow_manager = WorkflowManager()
        print("✅ Workflow Manager ready")
        
        # Initialize Agent Orchestrator
        print("🎭 Initializing Agent Orchestrator...")
        app.agent_orchestrator = AgentOrchestrator(app.service_manager.gemini)
        print("✅ Agent Orchestrator ready")
        
        # Initialize agents
        print("🤖 Setting up agent ecosystem...")
        app.agent_manager = AgentManager(app.service_manager, app.agent_orchestrator)
        print("✅ Agent ecosystem ready")
        
        # Set up async event loop for agents
        print("🔄 Setting up async environment...")
        setup_async_environment(app)
        print("✅ Async environment ready")
        
    except Exception as e:
        print(f"❌ Initialization Error: {str(e)}")
        traceback.print_exc()
        return None
    
    # Register all blueprints with error handling
    print("📋 Registering API routes...")
    
    try:
        # Core routes
        app.register_blueprint(content_bp, url_prefix='/api/content')
        app.register_blueprint(materials_bp, url_prefix='/api/materials')
        app.register_blueprint(knowledge_bp, url_prefix='/api/knowledge')
        app.register_blueprint(visuals_bp, url_prefix='/api/visuals')
        app.register_blueprint(speech_bp, url_prefix='/api/speech')
        app.register_blueprint(planning_bp, url_prefix='/api/planning')
        
        # Management routes
        app.register_blueprint(content_mgmt_bp, url_prefix='/api/content-management')
        app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
        app.register_blueprint(export_bp, url_prefix='/api/export')
        app.register_blueprint(offline_bp, url_prefix='/api/offline')
        
        # Advanced features
        app.register_blueprint(ai_features_bp, url_prefix='/api/ai-features')
        app.register_blueprint(collaboration_bp, url_prefix='/api/collaboration')
        
        # Agentic workflow routes
        app.register_blueprint(agentic_bp, url_prefix='/api/agentic')
        
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
                'version': '2.0.0-agentic',
                'features': {
                    'agentic_workflows': True,
                    'multi_agent_collaboration': True,
                    'real_time_monitoring': True,
                    'agent_learning': True
                },
                'agents': {
                    'total_registered': len(app.agent_orchestrator.agents),
                    'active_workflows': len(app.workflow_manager.active_workflows),
                    'agent_list': [
                        {
                            'id': agent.agent_id,
                            'name': agent.name,
                            'capabilities': agent.capabilities
                        }
                        for agent in app.agent_orchestrator.agents.values()
                    ]
                }
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'error': str(e)
            }), 500
    
    # Agent status endpoint
    @app.route('/api/agents/status')
    def agent_status():
        try:
            agents_info = []
            for agent_id, agent in app.agent_orchestrator.agents.items():
                agents_info.append({
                    'id': agent_id,
                    'name': agent.name,
                    'capabilities': agent.capabilities,
                    'memory_size': len(agent.memory.interactions),
                    'success_metrics': agent.memory.success_metrics,
                    'learned_patterns': len(agent.memory.learned_patterns),
                    'active_tasks': len(agent.active_tasks)
                })
            
            return jsonify({
                'success': True,
                'agents': agents_info,
                'orchestrator_stats': {
                    'total_agents': len(app.agent_orchestrator.agents),
                    'active_workflows': len(app.agent_orchestrator.active_workflows),
                    'global_context_size': len(app.agent_orchestrator.global_context)
                }
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # Workflow management endpoints
    @app.route('/api/workflows/active')
    def active_workflows():
        try:
            workflows = []
            for workflow_id, workflow in app.workflow_manager.active_workflows.items():
                workflows.append({
                    'id': workflow_id,
                    'type': workflow['type'],
                    'status': workflow['status'],
                    'progress': workflow['progress'],
                    'created_at': workflow['created_at'].isoformat(),
                    'teacher_id': workflow['teacher_id']
                })
            
            return jsonify({
                'success': True,
                'workflows': workflows,
                'total_active': len(workflows)
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return app


def setup_async_environment(app):
    """Set up async environment for agent operations"""
    def run_async_loop():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def agent_heartbeat():
            """Periodic agent maintenance"""
            while True:
                try:
                    # Update global context using the actual app instance
                    with app.app_context():
                        app.agent_orchestrator.update_global_context({
                            'timestamp': datetime.now(timezone.utc).isoformat(),
                            'active_workflows': len(app.workflow_manager.active_workflows),
                            'system_status': 'healthy'
                        })
                    
                    # Clean up old workflow events
                    cleanup_old_events(app)
                    
                    await asyncio.sleep(30)  # Run every 30 seconds
                    
                except Exception as e:
                    print(f"⚠️ Agent heartbeat error: {e}")
                    await asyncio.sleep(60)
        
        loop.create_task(agent_heartbeat())
        loop.run_forever()
    
    # Start async loop in background thread
    async_thread = threading.Thread(target=run_async_loop, daemon=True)
    async_thread.start()

def cleanup_old_events(app):
    """Clean up old workflow events to prevent memory issues"""
    try:
        cutoff_time = datetime.now(timezone.utc).timestamp() - 3600  # 1 hour ago
        
        for workflow_id, workflow in app.workflow_manager.active_workflows.items():
            if workflow['status'] in ['completed', 'error']:
                # Keep only recent events for completed workflows
                workflow['events'] = [
                    event for event in workflow['events']
                    if datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00')).timestamp() > cutoff_time
                ]
    except Exception as e:
        print(f"⚠️ Cleanup error: {e}")
def run_development_server():
    """Run the development server with auto-reload"""
    print("🚀 Starting Sahayak AI Teaching Assistant...")
    print("🌟 Agentic AI System v2.0")
    
    app = create_app()
    if app:
        print("\n" + "="*60)
        print("🎓 SAHAYAK AI - AGENTIC TEACHING ASSISTANT")
        print("="*60)
        print("✅ Server starting at http://localhost:8080")
        print("🔗 Health check: http://localhost:8080/health")
        print("🤖 Agent status: http://localhost:8080/api/agents/status")
        print("⚙️ Active workflows: http://localhost:8080/api/workflows/active")
        print("🌐 Frontend should connect to: http://localhost:3000")
        print("\n🚀 Features Available:")
        print("   • Multi-Agent Collaboration")
        print("   • Real-time Workflow Monitoring")
        print("   • Intelligent Task Planning")
        print("   • Agent Learning & Memory")
        print("   • Dynamic Resource Allocation")
        print("   • Quality Assurance Loops")
        print("   • Contextual Awareness")
        print("   • Adaptive Workflows")
        print("\n" + "="*60)
        
        try:
            app.run(
                debug=Config.DEBUG,
                host='0.0.0.0',
                port=8080,
                threaded=True,
                use_reloader=False  # Disable reloader to prevent async issues
            )
        except KeyboardInterrupt:
            print("\n🛑 Shutting down Sahayak AI...")
            print("👋 Goodbye!")
    else:
        print("❌ Failed to start application")
        print("💡 Check your configuration:")
        print("   • .env file with API keys")
        print("   • firebase_config.json file")
        print("   • Network connectivity")
        print("   • Required dependencies installed")

if __name__ == '__main__':
    run_development_server()