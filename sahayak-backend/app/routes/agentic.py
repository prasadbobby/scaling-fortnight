# sahayak-backend/app/routes/agentic.py
from flask import Blueprint, request, jsonify, Response
import json
import asyncio
import threading
import time
import traceback
from datetime import datetime, timezone

from ..workflow.workflow_manager import WorkflowManager, WorkflowStatus

agentic_bp = Blueprint('agentic', __name__)

# Global workflow manager instance
workflow_manager = WorkflowManager()

@agentic_bp.route('/start-workflow', methods=['POST'])
def start_agentic_workflow():
    """Start a new agentic workflow"""
    try:
        print("🚀 Starting agentic workflow...")
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        workflow_type = data.get('type')
        workflow_data = data.get('data')
        teacher_id = data.get('teacher_id')
        
        if not workflow_type or not workflow_data or not teacher_id:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create workflow
        workflow_id = workflow_manager.create_workflow(workflow_type, workflow_data, teacher_id)
        print(f"✅ Workflow created: {workflow_id}")
        
        # Start execution in background
        start_workflow_execution(workflow_id, workflow_type, workflow_data)
        
        return jsonify({
            'success': True,
            'workflow_id': workflow_id,
            'message': 'Agentic workflow started successfully'
        })
        
    except Exception as e:
        print(f"❌ Workflow start error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@agentic_bp.route('/workflow-stream/<workflow_id>')
def workflow_stream(workflow_id):
    """Server-sent events stream for workflow progress"""
    
    def generate():
        print(f"📡 Starting stream for workflow: {workflow_id}")
        
        try:
            # Send initial connection event
            yield f"data: {json.dumps({'type': 'connected', 'workflow_id': workflow_id})}\n\n"
            
            while True:
                # Get workflow status
                workflow = workflow_manager.get_workflow(workflow_id)
                if not workflow:
                    yield f"data: {json.dumps({'type': 'error', 'message': 'Workflow not found'})}\n\n"
                    break
                
                # Get new events from queue
                event = workflow_manager.get_events_for_streaming(workflow_id, timeout=1.0)
                if event:
                    yield f"data: {json.dumps(event)}\n\n"
                
                # Check if workflow is completed
                if workflow.status in [WorkflowStatus.COMPLETED, WorkflowStatus.ERROR]:
                    completion_event = {
                        'type': 'workflow_completed',
                        'status': workflow.status.value,
                        'message': 'Workflow finished',
                        'timestamp': datetime.now(timezone.utc).isoformat()
                    }
                    yield f"data: {json.dumps(completion_event)}\n\n"
                    break
                
                # Send heartbeat every 5 seconds
                time.sleep(0.1)
                
        except Exception as e:
            error_msg = f"Stream error: {str(e)}"
            print(f"❌ {error_msg}")
            traceback.print_exc()
            yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
        finally:
            # Cleanup
            workflow_manager.cleanup_workflow(workflow_id)
            print(f"🧹 Cleaned up stream for workflow: {workflow_id}")
    
    response = Response(generate(), mimetype='text/plain')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Connection'] = 'keep-alive'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Cache-Control'
    
    return response

def start_workflow_execution(workflow_id: str, workflow_type: str, workflow_data: dict):
    """Start workflow execution in background thread"""
    
    def execute():
        try:
            print(f"🔄 Starting execution for workflow: {workflow_id}")
            
            # Update status to executing
            workflow_manager.update_workflow_status(
                workflow_id, 
                WorkflowStatus.EXECUTING,
                started_at=datetime.now(timezone.utc)
            )
            
            # Log start event
            workflow_manager.log_workflow_event(workflow_id, 'workflow_started', {
                'workflow_id': workflow_id,
                'type': workflow_type,
                'message': 'Workflow execution started'
            })
            
            # Create event loop for async execution
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                # Run async workflow
                results = loop.run_until_complete(
                    execute_workflow_async(workflow_id, workflow_type, workflow_data)
                )
                
                # Complete workflow
                workflow_manager.complete_workflow(workflow_id, results)
                
                workflow_manager.log_workflow_event(workflow_id, 'workflow_completed', {
                    'workflow_id': workflow_id,
                    'message': 'Workflow completed successfully',
                    'results_preview': str(results)[:200] + '...' if len(str(results)) > 200 else str(results)
                })
                
                print(f"✅ Workflow {workflow_id} completed successfully")
                
            except Exception as e:
                print(f"❌ Workflow execution error: {e}")
                traceback.print_exc()
                
                workflow_manager.update_workflow_status(workflow_id, WorkflowStatus.ERROR)
                workflow_manager.log_workflow_event(workflow_id, 'error', {
                    'workflow_id': workflow_id,
                    'message': str(e),
                    'error_type': type(e).__name__
                })
            finally:
                loop.close()
                
        except Exception as e:
            print(f"❌ Thread execution error: {e}")
            traceback.print_exc()
    
    # Start background thread
    thread = threading.Thread(target=execute, daemon=True)
    thread.start()
    print(f"🧵 Background thread started for workflow: {workflow_id}")

async def execute_workflow_async(workflow_id: str, workflow_type: str, workflow_data: dict) -> dict:
    """Execute workflow asynchronously"""
    
    def log_event(event_type: str, data: dict):
        workflow_manager.log_workflow_event(workflow_id, event_type, data)
    
    try:
        # Simulate comprehensive lesson creation workflow
        if workflow_type == 'comprehensive_lesson_creation':
            
            # Step 1: Curriculum Planning
            log_event('agent_started', {
                'agent_id': 'curriculum_planner',
                'agent_name': 'Curriculum Planner',
                'step': 1,
                'task': 'analyze_curriculum_requirements'
            })
            
            await asyncio.sleep(2)  # Simulate processing time
            
            log_event('agent_progress', {
                'agent_id': 'curriculum_planner',
                'agent_name': 'Curriculum Planner',
                'message': 'Analyzing curriculum requirements...',
                'progress': 50,
                'task': 'analyze_curriculum_requirements'
            })
            
            await asyncio.sleep(2)
            
            curriculum_analysis = {
                'subjects': workflow_data.get('subjects', []),
                'grade_levels': workflow_data.get('grade_levels', []),
                'learning_objectives': ['Understand basic concepts', 'Apply knowledge', 'Analyze problems'],
                'duration_days': workflow_data.get('duration_days', 5),
                'language': workflow_data.get('language', 'hi')
            }
            
            log_event('agent_completed', {
                'agent_id': 'curriculum_planner',
                'agent_name': 'Curriculum Planner',
                'step': 1,
                'result_summary': 'Curriculum analysis completed'
            })
            
            # Step 2: Content Creation
            log_event('agent_started', {
                'agent_id': 'content_creator',
                'agent_name': 'Content Creator',
                'step': 2,
                'task': 'generate_base_content'
            })
            
            await asyncio.sleep(3)
            
            log_event('agent_progress', {
                'agent_id': 'content_creator',
                'agent_name': 'Content Creator',
                'message': 'Generating educational content...',
                'progress': 60,
                'task': 'generate_base_content'
            })
            
            await asyncio.sleep(2)
            
            content_package = {}
            for subject in curriculum_analysis['subjects']:
                for grade in curriculum_analysis['grade_levels']:
                    content_key = f"{subject}_grade_{grade}_content"
                    content_package[content_key] = {
                        'subject': subject,
                        'grade_level': grade,
                        'type': 'educational_story',
                        'content': f"Generated educational story for {subject} Grade {grade}",
                        'learning_objectives': curriculum_analysis['learning_objectives']
                    }
            
            log_event('agent_completed', {
                'agent_id': 'content_creator',
                'agent_name': 'Content Creator',
                'step': 2,
                'result_summary': f'Generated {len(content_package)} content items'
            })
            
            # Step 3: Material Differentiation
            log_event('agent_started', {
                'agent_id': 'material_differentiator',
                'agent_name': 'Material Differentiator',
                'step': 3,
                'task': 'create_differentiated_materials'
            })
            
            await asyncio.sleep(2)
            
            log_event('agent_progress', {
                'agent_id': 'material_differentiator',
                'agent_name': 'Material Differentiator',
                'message': 'Creating differentiated materials...',
                'progress': 70,
                'task': 'create_differentiated_materials'
            })
            
            await asyncio.sleep(2)
            
            differentiated_materials = {}
            for content_key in content_package.keys():
                differentiated_materials[content_key] = {
                    'beginner': f"Simplified version for beginners",
                    'intermediate': f"Standard version",
                    'advanced': f"Advanced version with extensions"
                }
            
            log_event('agent_completed', {
                'agent_id': 'material_differentiator',
                'agent_name': 'Material Differentiator',
                'step': 3,
                'result_summary': f'Created differentiated materials for {len(differentiated_materials)} items'
            })
            
            # Step 4: Assessment Creation
            log_event('agent_started', {
                'agent_id': 'assessment_creator',
                'agent_name': 'Assessment Creator',
                'step': 4,
                'task': 'design_assessments'
            })
            
            await asyncio.sleep(3)
            
            log_event('agent_progress', {
                'agent_id': 'assessment_creator',
                'agent_name': 'Assessment Creator',
                'message': 'Designing comprehensive assessments...',
                'progress': 80,
                'task': 'design_assessments'
            })
            
            await asyncio.sleep(2)
            
            assessments = {}
            for subject in curriculum_analysis['subjects']:
                assessments[f"{subject}_assessment"] = {
                    'formative': f"Formative assessment for {subject}",
                    'summative': f"Summative assessment for {subject}",
                    'rubric': f"Assessment rubric for {subject}"
                }
            
            log_event('agent_completed', {
                'agent_id': 'assessment_creator',
                'agent_name': 'Assessment Creator',
                'step': 4,
                'result_summary': f'Created {len(assessments)} assessment packages'
            })
            
            # Step 5: Visual Design
            log_event('agent_started', {
                'agent_id': 'visual_designer',
                'agent_name': 'Visual Designer',
                'step': 5,
                'task': 'create_visual_aids'
            })
            
            await asyncio.sleep(2)
            
            log_event('agent_progress', {
                'agent_id': 'visual_designer',
                'agent_name': 'Visual Designer',
                'message': 'Creating visual aids and diagrams...',
                'progress': 90,
                'task': 'create_visual_aids'
            })
            
            await asyncio.sleep(2)
            
            visual_aids = {
                'diagrams': f"Educational diagrams for {', '.join(curriculum_analysis['subjects'])}",
                'infographics': f"Concept infographics",
                'visual_guides': f"Step-by-step visual guides"
            }
            
            log_event('agent_completed', {
                'agent_id': 'visual_designer',
                'agent_name': 'Visual Designer',
                'step': 5,
                'result_summary': 'Visual aids package created'
            })
            
            # Step 6: Integration
            log_event('agent_started', {
                'agent_id': 'integration_specialist',
                'agent_name': 'Integration Specialist',
                'step': 6,
                'task': 'compile_lesson_package'
            })
            
            await asyncio.sleep(2)
            
            log_event('agent_progress', {
                'agent_id': 'integration_specialist',
                'agent_name': 'Integration Specialist',
                'message': 'Integrating all components...',
                'progress': 95,
                'task': 'compile_lesson_package'
            })
            
            await asyncio.sleep(1)
            
            # Final integrated package
            integrated_package = {
                'step_1': curriculum_analysis,
                'step_2': {'content_package': content_package},
                'step_3': {'differentiated_materials': differentiated_materials},
                'step_4': {'individual_assessments': assessments},
                'step_5': {'visual_package': visual_aids},
                'step_6': {
                    'integrated_lesson_package': {
                        'lesson_overview': {
                            'title': f"Comprehensive Lesson Package",
                            'subjects': curriculum_analysis['subjects'],
                            'grade_levels': curriculum_analysis['grade_levels'],
                            'duration': f"{curriculum_analysis['duration_days']} days"
                        },
                        'quality_metrics': {
                            'overall_quality': 0.92,
                            'coherence': 0.95,
                            'completeness': 0.90
                        }
                    },
                    'integration_summary': {
                        'quality_score': 0.92,
                        'components_integrated': 6,
                        'readiness_level': 'classroom_ready'
                    }
                }
            }
            
            log_event('agent_completed', {
                'agent_id': 'integration_specialist',
                'agent_name': 'Integration Specialist',
                'step': 6,
                'result_summary': 'Complete lesson package integrated and ready'
            })
            
            return integrated_package
        
        else:
            raise ValueError(f"Unknown workflow type: {workflow_type}")
            
    except Exception as e:
        print(f"❌ Async execution error: {e}")
        traceback.print_exc()
        raise

@agentic_bp.route('/workflow-status/<workflow_id>')
def get_workflow_status(workflow_id):
    """Get current workflow status"""
    try:
        workflow = workflow_manager.get_workflow(workflow_id)
        
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        return jsonify({
            'success': True,
            'workflow': {
                'id': workflow.id,
                'type': workflow.type,
                'status': workflow.status.value,
                'progress': workflow.progress,
                'created_at': workflow.created_at.isoformat(),
                'started_at': workflow.started_at.isoformat() if workflow.started_at else None,
                'completed_at': workflow.completed_at.isoformat() if workflow.completed_at else None,
                'events_count': len(workflow.events),
                'has_results': workflow.results is not None
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_bp.route('/workflow-results/<workflow_id>')
def get_workflow_results(workflow_id):
    """Get workflow results"""
    try:
        workflow = workflow_manager.get_workflow(workflow_id)
        
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        if workflow.status != WorkflowStatus.COMPLETED:
            return jsonify({'error': 'Workflow not completed yet'}), 400
        
        return jsonify({
            'success': True,
            'results': workflow.results,
            'metadata': {
                'workflow_id': workflow_id,
                'completion_time': workflow.completed_at.isoformat(),
                'total_duration': (workflow.completed_at - workflow.created_at).total_seconds()
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_bp.route('/test', methods=['GET'])
def test_agentic():
    """Test agentic system components"""
    try:
        return jsonify({
            'success': True,
            'system_status': {
                'workflow_manager_active': True,
                'active_workflows_count': len(workflow_manager.workflows),
                'event_queues_count': len(workflow_manager.event_queues)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500