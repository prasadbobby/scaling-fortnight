# sahayak-backend/app/routes/agentic.py
from flask import Blueprint, request, jsonify, current_app, Response
import json
import asyncio
from datetime import datetime, timezone
import uuid
import time
import threading
import traceback

agentic_bp = Blueprint('agentic', __name__)

# Global storage for workflow streams to maintain Flask app context
_active_streams = {}

@agentic_bp.route('/start-workflow', methods=['POST'])
def start_agentic_workflow():
    """Start a new agentic workflow"""
    try:
        print("🚀 Starting agentic workflow...")
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        print(f"📋 Request data: {data}")
        
        workflow_type = data.get('type')
        workflow_data = data.get('data')
        teacher_id = data.get('teacher_id')
        
        # Validate required fields
        if not workflow_type:
            return jsonify({'error': 'Workflow type is required'}), 400
        if not workflow_data:
            return jsonify({'error': 'Workflow data is required'}), 400
        if not teacher_id:
            return jsonify({'error': 'Teacher ID is required'}), 400
            
        print(f"✅ Validation passed. Type: {workflow_type}, Teacher: {teacher_id}")
        
        # Check if workflow_manager exists
        if not hasattr(current_app, 'workflow_manager'):
            return jsonify({'error': 'Workflow manager not initialized'}), 500
            
        print("✅ Workflow manager found")
        
        # Create workflow
        workflow_id = current_app.workflow_manager.create_workflow(
            workflow_type, workflow_data, teacher_id
        )
        
        print(f"✅ Workflow created with ID: {workflow_id}")
        
        # Store Flask app instance for streaming
        flask_app = current_app._get_current_object()
        _active_streams[workflow_id] = flask_app
        
        # Start workflow execution in background with proper context
        start_workflow_execution(workflow_id, workflow_type, workflow_data, flask_app)
        
        print(f"✅ Workflow execution started")
        
        return jsonify({
            'success': True,
            'workflow_id': workflow_id,
            'message': 'Agentic workflow started successfully'
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Workflow start error: {error_msg}")
        print(f"❌ Error type: {type(e)}")
        traceback.print_exc()
        
        return jsonify({
            'error': error_msg,
            'type': str(type(e).__name__),
            'traceback': traceback.format_exc()
        }), 500

@agentic_bp.route('/workflow-stream/<workflow_id>')
def workflow_stream(workflow_id):
    """Server-sent events stream for workflow progress"""
    
    # Get the Flask app instance from storage
    flask_app = _active_streams.get(workflow_id)
    if not flask_app:
        # Fallback to current_app if available
        try:
            flask_app = current_app._get_current_object()
        except RuntimeError:
            return Response(
                f"data: {json.dumps({'type': 'error', 'message': 'Workflow context not found'})}\n\n",
                mimetype='text/plain'
            )
    
    def generate():
        try:
            print(f"📡 Starting stream for workflow: {workflow_id}")
            last_event_index = 0
            
            # Use Flask app context for the entire generator
            with flask_app.app_context():
                workflow_manager = flask_app.workflow_manager
                
                while True:
                    workflow = workflow_manager.get_workflow(workflow_id)
                    
                    if not workflow:
                        error_msg = f"Workflow {workflow_id} not found"
                        print(f"❌ {error_msg}")
                        yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
                        break
                    
                    # Send new events
                    events = workflow.get('events', [])
                    new_events = events[last_event_index:]
                    
                    for event in new_events:
                        if not event.get('sent', False):
                            print(f"📤 Sending event: {event['type']}")
                            yield f"data: {json.dumps(event)}\n\n"
                            event['sent'] = True
                    
                    last_event_index = len(events)
                    
                    # Check if workflow is completed
                    if workflow.get('status') in ['completed', 'error']:
                        print(f"✅ Workflow {workflow_id} finished with status: {workflow.get('status')}")
                        yield f"data: {json.dumps({'type': 'workflow_completed', 'message': 'Workflow finished'})}\n\n"
                        # Clean up the stored app instance
                        _active_streams.pop(workflow_id, None)
                        break
                    
                    time.sleep(1)
                    
        except Exception as e:
            error_msg = f"Stream error: {str(e)}"
            print(f"❌ {error_msg}")
            traceback.print_exc()
            yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
            # Clean up on error
            _active_streams.pop(workflow_id, None)
    
    response = Response(generate(), mimetype='text/plain')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Connection'] = 'keep-alive'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Cache-Control'
    
    return response

def start_workflow_execution(workflow_id, workflow_type, workflow_data, flask_app):
    """Start workflow execution in background thread with Flask context"""
    print(f"🔄 Starting workflow execution for {workflow_id}")
    
    def execute():
        try:
            print("🔧 Setting up app context...")
            
            with flask_app.app_context():
                print("✅ App context established")
                
                # Create event loop for this thread
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                print("✅ Event loop created")
                
                try:
                    # Run the workflow
                    print("🚀 Starting async workflow execution...")
                    loop.run_until_complete(
                        execute_workflow_async(workflow_id, workflow_type, workflow_data, flask_app)
                    )
                    print("✅ Async workflow execution completed")
                except Exception as async_error:
                    print(f"❌ Async workflow error: {async_error}")
                    traceback.print_exc()
                    # Log error to workflow within context
                    try:
                        flask_app.workflow_manager.log_workflow_event(
                            workflow_id, 'error', {'message': str(async_error)}
                        )
                        flask_app.workflow_manager.update_workflow_status(
                            workflow_id, 'error'
                        )
                    except Exception as log_error:
                        print(f"❌ Failed to log workflow error: {log_error}")
                finally:
                    print("🧹 Cleaning up event loop")
                    loop.close()
                    
        except Exception as e:
            print(f"❌ Workflow execution error: {e}")
            print(f"❌ Error type: {type(e)}")
            traceback.print_exc()
    
    print("🧵 Starting background thread...")
    thread = threading.Thread(target=execute, daemon=True)
    thread.start()
    print("✅ Background thread started")

async def execute_workflow_async(workflow_id: str, workflow_type: str, workflow_data: dict, flask_app):
    """Execute workflow asynchronously with real-time updates"""
    try:
        print(f"🎯 Starting async execution for workflow {workflow_id}")
        
        print("🔧 Getting workflow manager and orchestrator...")
        workflow_manager = flask_app.workflow_manager
        orchestrator = flask_app.agent_orchestrator
        
        print("✅ Managers obtained")
        
        # Create event logger
        def log_event(event_type: str, data: dict):
            try:
                print(f"📝 Logging event: {event_type}")
                workflow_manager.log_workflow_event(workflow_id, event_type, data)
            except Exception as e:
                print(f"❌ Failed to log event {event_type}: {e}")
        
        print("🔧 Updating workflow status to executing...")
        
        # Update workflow status
        workflow_manager.update_workflow_status(
            workflow_id, 'executing', 
            started_at=datetime.now(timezone.utc)
        )
        
        print("✅ Workflow status updated")
        
        # Start workflow
        log_event('workflow_started', {
            'workflow_id': workflow_id,
            'type': workflow_type
        })
        
        print("🔧 Creating workflow message...")
        
        # Create workflow request message
        from app.agents.base_agent import AgentMessage
        
        workflow_message = AgentMessage(
            id=str(uuid.uuid4()),
            sender='system',
            recipient='orchestrator',
            content={
                'type': 'workflow_request',
                'workflow_data': {
                    'type': workflow_type,
                    **workflow_data
                }
            },
            timestamp=datetime.now(timezone.utc),
            message_type='request'
        )
        
        print("✅ Workflow message created")
        print("🚀 Starting workflow monitoring...")
        
        # Execute workflow with monitoring
        result = await orchestrator.start_workflow_with_monitoring(
            workflow_message, log_event
        )
        
        print("✅ Workflow monitoring completed")
        print("🔧 Completing workflow...")
        
        # Complete workflow
        workflow_manager.complete_workflow(workflow_id, result)
        
        log_event('workflow_completed', {
            'workflow_id': workflow_id,
            'results': result
        })
        
        print(f"✅ Workflow {workflow_id} completed successfully")
        
    except Exception as e:
        print(f"❌ Workflow async execution error: {e}")
        print(f"❌ Error type: {type(e)}")
        traceback.print_exc()
        
        try:
            flask_app.workflow_manager.log_workflow_event(
                workflow_id, 'error', {'message': str(e)}
            )
            flask_app.workflow_manager.update_workflow_status(workflow_id, 'error')
        except Exception as log_error:
            print(f"❌ Failed to log workflow error: {log_error}")

@agentic_bp.route('/workflow-status/<workflow_id>')
def get_workflow_status(workflow_id):
    """Get current workflow status"""
    try:
        workflow = current_app.workflow_manager.get_workflow(workflow_id)
        
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        return jsonify({
            'success': True,
            'workflow': {
                'id': workflow['id'],
                'type': workflow['type'],
                'status': workflow['status'],
                'progress': workflow['progress'],
                'created_at': workflow['created_at'].isoformat(),
                'started_at': workflow['started_at'].isoformat() if workflow['started_at'] else None,
                'completed_at': workflow['completed_at'].isoformat() if workflow['completed_at'] else None,
                'events_count': len(workflow.get('events', [])),
                'has_results': workflow.get('results') is not None
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_bp.route('/workflow-results/<workflow_id>')
def get_workflow_results(workflow_id):
    """Get workflow results"""
    try:
        workflow = current_app.workflow_manager.get_workflow(workflow_id)
        
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        if workflow['status'] != 'completed':
            return jsonify({'error': 'Workflow not completed yet'}), 400
        
        return jsonify({
            'success': True,
            'results': workflow['results'],
            'metadata': {
                'workflow_id': workflow_id,
                'completion_time': workflow['completed_at'].isoformat(),
                'total_duration': (workflow['completed_at'] - workflow['created_at']).total_seconds()
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_bp.route('/workflows/templates')
def get_workflow_templates():
    """Get available workflow templates"""
    templates = {
        'comprehensive_lesson_creation': {
            'name': 'Comprehensive Lesson Creation',
            'description': 'Create complete lesson packages with content, materials, assessments, and visuals',
            'agents_involved': [
                'curriculum_planner',
                'content_creator', 
                'material_differentiator',
                'assessment_creator',
                'visual_designer',
                'integration_specialist'
            ],
            'estimated_duration': '5-10 minutes',
            'complexity': 'high',
            'required_inputs': ['subjects', 'grade_levels', 'learning_goals', 'language'],
            'optional_inputs': ['duration_days', 'special_requirements', 'available_resources']
        },
        'quick_content_generation': {
            'name': 'Quick Content Generation',
            'description': 'Rapidly generate educational content with basic differentiation',
            'agents_involved': ['content_creator', 'material_differentiator'],
            'estimated_duration': '2-3 minutes',
            'complexity': 'medium',
            'required_inputs': ['topic', 'grade_levels', 'language'],
            'optional_inputs': ['content_type', 'cultural_context']
        },
        'assessment_design_workflow': {
            'name': 'Assessment Design Workflow',
            'description': 'Design comprehensive assessment systems',
            'agents_involved': ['curriculum_planner', 'assessment_creator', 'integration_specialist'],
            'estimated_duration': '3-5 minutes',
            'complexity': 'medium',
            'required_inputs': ['learning_objectives', 'grade_levels'],
            'optional_inputs': ['assessment_types', 'time_constraints']
        }
    }
    
    return jsonify({
        'success': True,
        'templates': templates
    })

@agentic_bp.route('/test', methods=['GET'])
def test_agentic():
    """Test agentic system components"""
    try:
        result = {
            'workflow_manager_exists': hasattr(current_app, 'workflow_manager'),
            'agent_orchestrator_exists': hasattr(current_app, 'agent_orchestrator'),
            'service_manager_exists': hasattr(current_app, 'service_manager'),
        }
        
        if hasattr(current_app, 'workflow_manager'):
            result['active_workflows_count'] = len(current_app.workflow_manager.active_workflows)
        
        if hasattr(current_app, 'agent_orchestrator'):
            result['registered_agents_count'] = len(current_app.agent_orchestrator.agents)
            result['agent_list'] = list(current_app.agent_orchestrator.agents.keys())
        
        return jsonify({
            'success': True,
            'system_status': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@agentic_bp.route('/test-simple-workflow', methods=['POST'])
def test_simple_workflow():
    """Test a simple workflow without complex agent interactions"""
    try:
        data = request.get_json()
        teacher_id = data.get('teacher_id', 'test_teacher')
        
        # Create a simple workflow
        workflow_id = current_app.workflow_manager.create_workflow(
            'test_workflow', {'test': True}, teacher_id
        )
        
        # Store Flask app for streaming
        flask_app = current_app._get_current_object()
        _active_streams[workflow_id] = flask_app
        
        # Simulate workflow completion immediately
        def complete_test_workflow():
            time.sleep(2)  # Simulate some work
            with flask_app.app_context():
                flask_app.workflow_manager.log_workflow_event(
                    workflow_id, 'test_started', {'message': 'Test workflow started'}
                )
                time.sleep(1)
                flask_app.workflow_manager.log_workflow_event(
                    workflow_id, 'test_progress', {'message': 'Test workflow in progress'}
                )
                time.sleep(1)
                flask_app.workflow_manager.log_workflow_event(
                    workflow_id, 'test_completed', {'message': 'Test workflow completed'}
                )
                flask_app.workflow_manager.complete_workflow(
                    workflow_id, {'test_result': 'success', 'message': 'Simple test completed'}
                )
        
        thread = threading.Thread(target=complete_test_workflow, daemon=True)
        thread.start()
        
        return jsonify({
            'success': True,
            'workflow_id': workflow_id,
            'message': 'Test workflow started'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Cleanup function to prevent memory leaks
@agentic_bp.route('/cleanup-streams', methods=['POST'])
def cleanup_streams():
    """Cleanup finished workflow streams"""
    try:
        cleaned_count = 0
        workflow_ids_to_remove = []
        
        for workflow_id, flask_app in _active_streams.items():
            try:
                with flask_app.app_context():
                    workflow = flask_app.workflow_manager.get_workflow(workflow_id)
                    if not workflow or workflow.get('status') in ['completed', 'error']:
                        workflow_ids_to_remove.append(workflow_id)
            except:
                # If we can't access the workflow, remove it
                workflow_ids_to_remove.append(workflow_id)
        
        for workflow_id in workflow_ids_to_remove:
            _active_streams.pop(workflow_id, None)
            cleaned_count += 1
        
        return jsonify({
            'success': True,
            'cleaned_streams': cleaned_count,
            'active_streams': len(_active_streams)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500