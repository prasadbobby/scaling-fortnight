# sahayak-backend/app/routes/agentic.py
from flask import Blueprint, request, jsonify, current_app, Response
import json
import asyncio
from datetime import datetime
import uuid
import time
import threading

agentic_bp = Blueprint('agentic', __name__)

@agentic_bp.route('/start-workflow', methods=['POST'])
def start_agentic_workflow():
    """Start a new agentic workflow"""
    try:
        data = request.get_json()
        workflow_type = data.get('type')
        workflow_data = data.get('data')
        teacher_id = data.get('teacher_id')
        
        # Create workflow
        workflow_id = current_app.workflow_manager.create_workflow(
            workflow_type, workflow_data, teacher_id
        )
        
        # Start workflow execution in background
        start_workflow_execution(workflow_id, workflow_type, workflow_data)
        
        return jsonify({
            'success': True,
            'workflow_id': workflow_id,
            'message': 'Agentic workflow started successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_bp.route('/workflow-stream/<workflow_id>')
def workflow_stream(workflow_id):
    """Server-sent events stream for workflow progress"""
    def generate():
        try:
            last_event_index = 0
            
            while True:
                workflow = current_app.workflow_manager.get_workflow(workflow_id)
                
                if not workflow:
                    yield f"data: {json.dumps({'type': 'error', 'message': 'Workflow not found'})}\n\n"
                    break
                
                # Send new events
                events = workflow.get('events', [])
                new_events = events[last_event_index:]
                
                for event in new_events:
                    if not event.get('sent', False):
                        yield f"data: {json.dumps(event)}\n\n"
                        event['sent'] = True
                
                last_event_index = len(events)
                
                # Check if workflow is completed
                if workflow.get('status') in ['completed', 'error']:
                    break
                
                time.sleep(1)
                
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return Response(generate(), mimetype='text/plain', headers={
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    })

def start_workflow_execution(workflow_id, workflow_type, workflow_data):
    """Start workflow execution in background thread"""
    def execute():
        try:
            # Create event loop for this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Run the workflow
            loop.run_until_complete(
                execute_workflow_async(workflow_id, workflow_type, workflow_data)
            )
            
        except Exception as e:
            current_app.workflow_manager.log_workflow_event(
                workflow_id, 'error', {'message': str(e)}
            )
            current_app.workflow_manager.update_workflow_status(
                workflow_id, 'error'
            )
    
    thread = threading.Thread(target=execute, daemon=True)
    thread.start()

async def execute_workflow_async(workflow_id: str, workflow_type: str, workflow_data: dict):
    """Execute workflow asynchronously with real-time updates"""
    try:
        workflow_manager = current_app.workflow_manager
        orchestrator = current_app.agent_orchestrator
        
        # Create event logger
        def log_event(event_type: str, data: dict):
            workflow_manager.log_workflow_event(workflow_id, event_type, data)
        
        # Update workflow status
        workflow_manager.update_workflow_status(workflow_id, 'executing', started_at=datetime.utcnow())
        
        # Start workflow
        log_event('workflow_started', {
            'workflow_id': workflow_id,
            'type': workflow_type
        })
        
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
            timestamp=datetime.utcnow(),
            message_type='request'
        )
        
        # Execute workflow with monitoring
        result = await orchestrator.start_workflow_with_monitoring(
            workflow_message, log_event
        )
        
        # Complete workflow
        workflow_manager.complete_workflow(workflow_id, result)
        
        log_event('workflow_completed', {
            'workflow_id': workflow_id,
            'results': result
        })
        
    except Exception as e:
        workflow_manager.log_workflow_event(
            workflow_id, 'error', {'message': str(e)}
        )
        workflow_manager.update_workflow_status(workflow_id, 'error')

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