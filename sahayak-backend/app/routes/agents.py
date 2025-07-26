# sahayak-backend/app/routes/agents.py
from flask import Blueprint, request, jsonify, Response
import json
import time
from datetime import datetime, timezone

agents_bp = Blueprint('agents', __name__)

@agents_bp.route('/start-educational-workflow', methods=['POST'])
def start_educational_workflow():
    """Start educational workflow using Google AI patterns"""
    try:
        from flask import current_app
        
        data = request.get_json()
        print(f"🔍 Received workflow data: {data}")
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate required fields
        required_fields = ['subjects', 'grade_levels', 'learning_goals', 'language']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get agent service
        agent_service = current_app.agent_service
        print("agent_service", agent_service)
        
        # Create workflow
        workflow_id = agent_service.create_educational_workflow(data)
        print(f"✅ Educational workflow started with ID: {workflow_id}")
        return jsonify({
            'success': True,
            'workflow_id': workflow_id,
            'message': 'Educational workflow started using Google AI'
        })
        
    except Exception as e:
        print(f"❌ Educational workflow start error: {e}")
        return jsonify({'error': str(e)}), 500

@agents_bp.route('/workflow-stream/<workflow_id>')
def workflow_stream(workflow_id):
    """Stream workflow events using Server-Sent Events (no Flask context in generator)"""
    
    # Get agent service reference BEFORE starting generator
    from flask import current_app
    agent_service = current_app.agent_service
    
    def generate():
        try:
            # Send connection event
            yield f"data: {json.dumps({'type': 'connected', 'workflow_id': workflow_id})}\n\n"
            
            while True:
                # Get workflow status (using service reference, not current_app)
                workflow = agent_service.get_workflow_status(workflow_id)
                if not workflow:
                    yield f"data: {json.dumps({'type': 'error', 'message': 'Workflow not found'})}\n\n"
                    break
                
                # Get new events
                event = agent_service.get_workflow_events(workflow_id, timeout=1.0)
                if event:
                    yield f"data: {json.dumps(event)}\n\n"
                
                # Check completion
                if workflow['status'] in ['completed', 'error']:
                    completion_event = {
                        'type': 'workflow_completed',
                        'status': workflow['status'],
                        'message': 'Educational workflow finished',
                        'timestamp': datetime.now(timezone.utc).isoformat()
                    }
                    yield f"data: {json.dumps(completion_event)}\n\n"
                    break
                
                # Heartbeat
                yield f": heartbeat\n\n"
                time.sleep(1)
                
        except Exception as e:
            error_event = {
                'type': 'error',
                'message': str(e),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            yield f"data: {json.dumps(error_event)}\n\n"
        finally:
            # Cleanup
            try:
                agent_service.cleanup_workflow(workflow_id)
            except:
                pass
    
    # Create response with correct MIME type
    response = Response(generate(), mimetype='text/event-stream')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Connection'] = 'keep-alive'
    response.headers['X-Accel-Buffering'] = 'no'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Cache-Control'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    
    return response

@agents_bp.route('/workflow-status/<workflow_id>')
def get_workflow_status(workflow_id):
    """Get workflow status"""
    try:
        from flask import current_app
        
        workflow = current_app.agent_service.get_workflow_status(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        return jsonify({
            'success': True,
            'workflow': {
                'id': workflow['id'],
                'status': workflow['status'],
                'created_at': workflow['created_at'].isoformat(),
                'started_at': workflow['started_at'].isoformat() if workflow['started_at'] else None,
                'completed_at': workflow['completed_at'].isoformat() if workflow['completed_at'] else None,
                'events_count': len(workflow['events']),
                'has_results': bool(workflow['results'])
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agents_bp.route('/workflow-results/<workflow_id>')
def get_workflow_results(workflow_id):
    """Get workflow results"""
    try:
        from flask import current_app
        
        workflow = current_app.agent_service.get_workflow_status(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        if workflow['status'] != 'completed':
            return jsonify({'error': 'Workflow not completed yet'}), 400
        
        return jsonify({
            'success': True,
            'results': workflow['results'],
            'metadata': {
                'workflow_id': workflow_id,
                'completion_time': workflow['completed_at'].isoformat() if workflow['completed_at'] else None
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agents_bp.route('/available-agents', methods=['GET'])
def get_available_agents():
    """Get available Google AI agents"""
    agents = [
        {
            'id': 'curriculum_planner',
            'name': 'Curriculum Planning Agent',
            'description': 'Analyzes educational requirements and creates structured learning pathways',
            'capabilities': ['curriculum_analysis', 'standards_mapping', 'learning_objectives'],
            'powered_by': 'Google Cloud AI Platform'
        },
        {
            'id': 'content_creator',
            'name': 'Content Creation Agent',
            'description': 'Generates engaging educational content including stories and worksheets',
            'capabilities': ['story_generation', 'worksheet_creation', 'activity_design'],
            'powered_by': 'Google Cloud AI Platform'
        },
        {
            'id': 'assessment_creator',
            'name': 'Assessment Design Agent',
            'description': 'Creates comprehensive assessment packages and evaluation tools',
            'capabilities': ['assessment_design', 'rubric_creation', 'question_generation'],
            'powered_by': 'Google Cloud AI Platform'
        },
        {
            'id': 'material_adapter',
            'name': 'Material Adaptation Agent',
            'description': 'Adapts content for different learning levels and accessibility needs',
            'capabilities': ['content_adaptation', 'difficulty_scaling', 'accessibility_enhancement'],
            'powered_by': 'Google Cloud AI Platform'
        }
    ]
    
    return jsonify({
        'success': True,
        'agents': agents,
        'total_agents': len(agents),
        'framework': 'Google Cloud AI Platform'
    })

@agents_bp.route('/test', methods=['GET'])
def test_agents():
    """Test Google AI agents system"""
    try:
        from flask import current_app
        
        agent_service = current_app.agent_service
        
        return jsonify({
            'success': True,
            'system_status': {
                'agent_service_active': True,
                'active_workflows': len(agent_service.active_workflows),
                'event_queues': len(agent_service.workflow_queues),
                'framework': 'Google Cloud AI Platform',
                'agents_available': len(agent_service.agents_config)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500