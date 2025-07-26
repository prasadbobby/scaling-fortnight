# sahayak-backend/app/agents/orchestrator.py
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
import uuid
import traceback
from .base_agent import BaseAgent, AgentMessage

class AgentOrchestrator:
    def __init__(self, gemini_service):
        self.agents: Dict[str, BaseAgent] = {}
        self.active_workflows: Dict[str, Dict] = {}
        self.gemini = gemini_service
        self.global_context = {
            'teacher_preferences': {},
            'student_progress': {},
            'curriculum_state': {},
            'resource_usage': {}
        }
        self.event_logger = None
    
    def register_agent(self, agent: BaseAgent):
        agent.orchestrator = self
        self.agents[agent.agent_id] = agent
        print(f"🤖 Registered agent: {agent.name}")
    
    async def route_message(self, message: AgentMessage) -> Optional[AgentMessage]:
        if message.recipient in self.agents:
            recipient_agent = self.agents[message.recipient]
            return await recipient_agent.process_message(message)
        elif message.recipient == 'orchestrator':
            return await self.handle_orchestrator_message(message)
        else:
            print(f"⚠️ Unknown recipient: {message.recipient}")
            return None
    
    async def handle_orchestrator_message(self, message: AgentMessage) -> AgentMessage:
        if message.content.get('type') == 'workflow_request':
            return await self.start_workflow(message)
        elif message.content.get('type') == 'context_update':
            self.update_global_context(message.content['data'])
            return AgentMessage(
                id=str(uuid.uuid4()),
                sender='orchestrator',
                recipient=message.sender,
                content={'status': 'context_updated'},
                timestamp=datetime.now(timezone.utc),
                message_type='response'
            )
    
    async def start_workflow_with_monitoring(self, workflow_message: AgentMessage, event_logger):
        """Start workflow with real-time monitoring"""
        self.event_logger = event_logger
        
        try:
            workflow_data = workflow_message.content['workflow_data']
            workflow_type = workflow_data.get('type')
            
            # Log workflow start
            if self.event_logger:
                self.event_logger('workflow_analysis_started', {
                    'workflow_type': workflow_type,
                    'data': workflow_data
                })
            
            # Create workflow plan
            workflow_plan = await self.create_workflow_plan(workflow_data)
            
            # Execute workflow steps
            results = await self.execute_workflow_with_monitoring(workflow_plan, workflow_data)
            
            return results
            
        except Exception as e:
            print(f"Workflow monitoring error: {e}")
            traceback.print_exc()
            if self.event_logger:
                self.event_logger('error', {'message': str(e)})
            raise
    
    async def create_workflow_plan(self, workflow_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create execution plan for workflow"""
        workflow_type = workflow_data.get('type')
        
        if workflow_type == 'comprehensive_lesson_creation':
            return [
                {
                    'step': 1,
                    'agent': 'curriculum_planner',
                    'task': 'analyze_curriculum_requirements',
                    'input': workflow_data,
                    'dependencies': []
                },
                {
                    'step': 2,
                    'agent': 'content_creator',
                    'task': 'generate_base_content',
                    'input': {'curriculum_analysis': 'step_1_output'},
                    'dependencies': [1]
                },
                {
                    'step': 3,
                    'agent': 'material_differentiator',
                    'task': 'create_differentiated_materials',
                    'input': {'base_content': 'step_2_output'},
                    'dependencies': [2]
                },
                {
                    'step': 4,
                    'agent': 'assessment_creator',
                    'task': 'design_assessments',
                    'input': {'content': 'step_2_output', 'materials': 'step_3_output'},
                    'dependencies': [2, 3]
                },
                {
                    'step': 5,
                    'agent': 'visual_designer',
                    'task': 'create_visual_aids',
                    'input': {'content': 'step_2_output'},
                    'dependencies': [2]
                },
                {
                    'step': 6,
                    'agent': 'integration_specialist',
                    'task': 'compile_lesson_package',
                    'input': {'all_previous': 'all_outputs'},
                    'dependencies': [1, 2, 3, 4, 5]
                }
            ]
        
        return []
    
    async def execute_workflow_with_monitoring(self, plan: List[Dict[str, Any]], workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute workflow with real-time monitoring"""
        results = {}
        
        try:
            # Group steps by dependencies
            step_groups = self.group_steps_by_dependencies(plan)
            
            for group in step_groups:
                # Execute steps in parallel within each group
                group_tasks = []
                for step in group:
                    if step['agent'] in self.agents:
                        if self.event_logger:
                            self.event_logger('agent_started', {
                                'agent_id': step['agent'],
                                'agent_name': self.agents[step['agent']].name,
                                'step': step['step'],
                                'task': step['task']
                            })
                        
                        task = self.execute_step_with_monitoring(step, results)
                        group_tasks.append(task)
                
                # Wait for all steps in group to complete
                if group_tasks:
                    group_results = await asyncio.gather(*group_tasks, return_exceptions=True)
                    
                    # Process results
                    for i, result in enumerate(group_results):
                        if isinstance(result, Exception):
                            print(f"Step {group[i]['step']} failed: {result}")
                            traceback.print_exc()
                            if self.event_logger:
                                self.event_logger('error', {
                                    'agent_id': group[i]['agent'],
                                    'step': group[i]['step'],
                                    'message': str(result)
                                })
                        else:
                            step_id = f"step_{group[i]['step']}"
                            results[step_id] = result
                            
                            if self.event_logger:
                                self.event_logger('agent_completed', {
                                    'agent_id': group[i]['agent'],
                                    'agent_name': self.agents[group[i]['agent']].name,
                                    'step': group[i]['step'],
                                    'result_preview': str(result)[:100] + '...' if len(str(result)) > 100 else str(result)
                                })
            
            return results
            
        except Exception as e:
            print(f"Workflow execution error: {e}")
            traceback.print_exc()
            if self.event_logger:
                self.event_logger('error', {'message': str(e)})
            raise
    
    async def execute_step_with_monitoring(self, step: Dict[str, Any], previous_results: Dict[str, Any]) -> Any:
        """Execute single step with monitoring"""
        try:
            agent = self.agents[step['agent']]
            
            # Log progress
            if self.event_logger:
                self.event_logger('agent_progress', {
                    'agent_id': step['agent'],
                    'agent_name': agent.name,
                    'message': f"Starting {step['task']}",
                    'progress': 25,
                    'task': step['task']
                })
            
            # Prepare input data
            step_input = step['input'].copy()
            for key, value in step_input.items():
                if isinstance(value, str) and value.startswith('step_'):
                    step_input[key] = previous_results.get(value)
                elif value == 'all_outputs':
                    step_input[key] = previous_results
            
            # Send task to agent
            task_message = AgentMessage(
                id=str(uuid.uuid4()),
                sender='orchestrator',
                recipient=step['agent'],
                content={
                    'task': step['task'],
                    'input': step_input,
                    'step_info': step
                },
                timestamp=datetime.now(timezone.utc),
                message_type='task'
            )
            
            # Log progress
            if self.event_logger:
                self.event_logger('agent_progress', {
                    'agent_id': step['agent'],
                    'agent_name': agent.name,
                    'message': f"Processing {step['task']}",
                    'progress': 75,
                    'task': step['task']
                })
            
            response = await agent.process_message(task_message)
            return response.content if response else None
            
        except Exception as e:
            print(f"Step execution error for {step['agent']}: {e}")
            traceback.print_exc()
            raise
    
    def group_steps_by_dependencies(self, plan: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        """Group steps by their dependencies for parallel execution"""
        groups = []
        completed_steps = set()
        
        while len(completed_steps) < len(plan):
            current_group = []
            
            for step in plan:
                if step['step'] not in completed_steps:
                    # Check if all dependencies are satisfied
                    dependencies_satisfied = all(dep in completed_steps for dep in step['dependencies'])
                    
                    if dependencies_satisfied:
                        current_group.append(step)
            
            if current_group:
                groups.append(current_group)
                completed_steps.update(step['step'] for step in current_group)
            else:
                # Break infinite loop if no progress
                break
        
        return groups
    
    def update_global_context(self, new_context: Dict[str, Any]):
        self.global_context.update(new_context)