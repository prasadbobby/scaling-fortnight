# sahayak-backend/app/agents/curriculum_planner_agent.py
from .base_agent import BaseAgent, AgentMessage
from ..services.gemini_service import GeminiService
from typing import Dict, List, Any
import uuid
from datetime import datetime
from datetime import datetime, timezone 

class CurriculumPlannerAgent(BaseAgent):
    def __init__(self, gemini_service: GeminiService):
        super().__init__(
            agent_id="curriculum_planner",
            name="Curriculum Planning Agent",
            capabilities=[
                "curriculum_analysis", 
                "learning_objective_mapping", 
                "prerequisite_identification",
                "skill_progression_planning",
                "standards_alignment"
            ]
        )
        self.gemini = gemini_service
        
    async def process_message(self, message: AgentMessage) -> AgentMessage:
        task = message.content.get('task')
        
        if task == 'analyze_curriculum_requirements':
            result = await self.analyze_curriculum_requirements(message.content['input'])
        else:
            result = {'error': f'Unknown task: {task}'}
        
        return AgentMessage(
            id=str(uuid.uuid4()),
            sender=self.agent_id,
            recipient=message.sender,
            content=result,
            timestamp=datetime.now(timezone.utc),
            message_type='response'
        )
    
    async def analyze_curriculum_requirements(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze curriculum requirements and create structured plan"""
        
        prompt = f"""
        As a curriculum planning expert, analyze these educational requirements and create a comprehensive plan:
        
        Subjects: {input_data.get('subjects', [])}
        Grade Levels: {input_data.get('grade_levels', [])}
        Learning Goals: {input_data.get('learning_goals', '')}
        Duration: {input_data.get('duration_days', 5)} days
        Language: {input_data.get('language', 'hi')}
        Special Requirements: {input_data.get('special_requirements', 'None')}
        
        Provide a comprehensive curriculum analysis including:
        1. Learning objectives breakdown for each subject and grade
        2. Skill progression mapping
        3. Assessment checkpoints
        4. Resource requirements
        5. Time allocation recommendations
        6. Cross-curricular connections
        
        Format as structured text with clear sections.
        """
        
        analysis_text = self.gemini.generate_content(prompt)
        
        # Store learning for future use
        await self.learn_from_interaction({
            'task_type': 'curriculum_analysis',
            'success_score': 0.9,
            'patterns': {
                'subjects': input_data.get('subjects', []),
                'grade_levels': input_data.get('grade_levels', [])
            }
        })
        
        return {
            'curriculum_analysis': analysis_text,
            'subjects': input_data.get('subjects', []),
            'grade_levels': input_data.get('grade_levels', []),
            'duration_days': input_data.get('duration_days', 5),
            'language': input_data.get('language', 'hi'),
            'learning_objectives': self.extract_learning_objectives(analysis_text),
            'assessment_points': self.extract_assessment_points(analysis_text),
            'confidence_score': 0.9
        }
    
    def extract_learning_objectives(self, analysis_text: str) -> List[str]:
        """Extract learning objectives from analysis"""
        objectives = []
        lines = analysis_text.split('\n')
        for line in lines:
            if 'objective' in line.lower() or 'goal' in line.lower():
                objectives.append(line.strip())
        return objectives[:10]  # Limit to 10 objectives
    
    def extract_assessment_points(self, analysis_text: str) -> List[str]:
        """Extract assessment points from analysis"""
        points = []
        lines = analysis_text.split('\n')
        for line in lines:
            if 'assessment' in line.lower() or 'evaluate' in line.lower():
                points.append(line.strip())
        return points[:5]  # Limit to 5 assessment points