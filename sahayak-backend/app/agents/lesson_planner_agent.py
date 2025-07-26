# sahayak-backend/app/agents/lesson_planner_agent.py
from .base_agent import BaseAgent, AgentMessage
from ..services.gemini_service import GeminiService
from typing import Dict, List, Any
import uuid
from datetime import datetime, timezone

class LessonPlannerAgent(BaseAgent):
    def __init__(self, gemini_service: GeminiService):
        super().__init__(
            agent_id="lesson_planner",
            name="Lesson Planner Agent",
            capabilities=[
                "lesson_planning",
                "curriculum_alignment",
                "activity_design",
                "resource_planning",
                "timeline_management"
            ]
        )
        self.gemini = gemini_service
        
    async def process_message(self, message: AgentMessage) -> AgentMessage:
        task = message.content.get('task')
        
        if task == 'generate_weekly_lesson_plan':
            result = await self.generate_weekly_lesson_plan(
                message.content['input']['subjects'],
                message.content['input']['grade_levels'],
                message.content['input']['language'],
                message.content['input'].get('duration_days', 5)
            )
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
    
    def generate_weekly_lesson_plan(self, subjects: List[str], grade_levels: List[int], 
                                  language: str, duration_days: int = 5) -> Dict:
        """Generate comprehensive weekly lesson plans"""
        try:
            lesson_plans = {}
            
            for day in range(1, duration_days + 1):
                daily_plan = self._generate_daily_plan(subjects, grade_levels, language, day)
                lesson_plans[f"Day_{day}"] = daily_plan
            
            # Generate weekly summary and assessment plan
            weekly_summary = self._generate_weekly_summary(subjects, grade_levels, language)
            
            return {
                'weekly_plans': lesson_plans,
                'summary': weekly_summary,
                'metadata': {
                    'subjects': subjects,
                    'grade_levels': grade_levels,
                    'language': language,
                    'duration': duration_days,
                    'generated_at': datetime.now(timezone.utc).isoformat()
                }
            }
            
        except Exception as e:
            raise Exception(f"Lesson planning failed: {str(e)}")
    
    def _generate_daily_plan(self, subjects: List[str], grade_levels: List[int], 
                           language: str, day: int) -> Dict:
        """Generate plan for a single day"""
        daily_plan = {}
        
        for subject in subjects:
            for grade in grade_levels:
                prompt = f"""
                Create a detailed lesson plan for Day {day} in {language}:
                
                Subject: {subject}
                Grade: {grade}
                Duration: 45 minutes
                
                Include:
                1. Learning objectives
                2. Materials needed
                3. Introduction activity (5 mins)
                4. Main lesson content (25 mins)
                5. Practice activities (10 mins)
                6. Conclusion and homework (5 mins)
                7. Assessment methods
                8. Differentiation strategies for mixed-grade classroom
                
                Make it practical for resource-constrained classrooms.
                
                Lesson plan in {language}:
                """
                
                lesson_content = self.gemini.generate_content(prompt, language)
                
                if subject not in daily_plan:
                    daily_plan[subject] = {}
                daily_plan[subject][f"Grade_{grade}"] = lesson_content
        
        return daily_plan
    
    def _generate_weekly_summary(self, subjects: List[str], grade_levels: List[int], language: str) -> str:
        """Generate weekly summary and assessment plan"""
        prompt = f"""
        Create a weekly summary and assessment plan in {language} for:
        
        Subjects: {', '.join(subjects)}
        Grade Levels: {', '.join(map(str, grade_levels))}
        
        Include:
        1. Key learning outcomes for the week
        2. Assessment strategies
        3. Materials preparation checklist
        4. Parent communication suggestions
        5. Next week's preparation notes
        
        Weekly summary in {language}:
        """
        
        return self.gemini.generate_content(prompt, language)
    
    def generate_activity_suggestions(self, topic: str, grade_levels: List[int], 
                                    available_resources: List[str], language: str) -> Dict:
        """Generate activity suggestions based on available resources"""
        prompt = f"""
        Suggest engaging classroom activities for {topic} in {language}:
        
        Grade Levels: {', '.join(map(str, grade_levels))}
        Available Resources: {', '.join(available_resources)}
        
        For each activity, provide:
        1. Activity name and description
        2. Required materials
        3. Step-by-step instructions
        4. Learning objectives
        5. Adaptations for different grade levels
        6. Assessment criteria
        
        Focus on activities that work well in multi-grade classrooms.
        
        Activities in {language}:
        """
        
        try:
            activities = self.gemini.generate_content(prompt, language)
            return {
                'activities': activities,
                'topic': topic,
                'grade_levels': grade_levels,
                'resources': available_resources,
                'language': language
            }
        except Exception as e:
            raise Exception(f"Activity generation failed: {str(e)}")