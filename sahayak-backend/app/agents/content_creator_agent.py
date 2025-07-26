# sahayak-backend/app/agents/content_creator_agent.py
from .base_agent import BaseAgent, AgentMessage
from ..services.gemini_service import GeminiService
from typing import Dict, List, Any
import uuid
from datetime import datetime
from datetime import datetime, timezone

class ContentCreatorAgent(BaseAgent):
    def __init__(self, gemini_service, imagen_service, veo_service):
        super().__init__(
            agent_id="content_creator",
            name="Content Creation Agent",
            capabilities=[
                "story_generation",
                "worksheet_creation", 
                "activity_design",
                "content_adaptation",
                "cultural_localization"
            ]
        )
        self.gemini = gemini_service
        self.imagen = imagen_service
        self.veo = veo_service
        
    async def process_message(self, message: AgentMessage) -> AgentMessage:
        task = message.content.get('task')
        
        if task == 'generate_base_content':
            result = await self.generate_comprehensive_content(message.content['input'])
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
    
    async def generate_comprehensive_content(self, curriculum_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive content based on curriculum analysis"""
        
        subjects = curriculum_analysis.get('subjects', [])
        grade_levels = curriculum_analysis.get('grade_levels', [])
        language = curriculum_analysis.get('language', 'hi')
        learning_objectives = curriculum_analysis.get('learning_objectives', [])
        
        content_package = {}
        
        # Generate content for each subject and grade combination
        for subject in subjects:
            for grade in grade_levels:
                # Generate educational story
                story_content = await self.create_educational_story(subject, grade, language, learning_objectives)
                story_key = f"{subject}_grade_{grade}_story"
                content_package[story_key] = {
                    'type': 'story',
                    'subject': subject,
                    'grade_level': grade,
                    'language': language,
                    'content': story_content,
                    'learning_objectives': learning_objectives[:3]  # Top 3 relevant objectives
                }
                
                # Generate worksheet
                worksheet_content = await self.create_interactive_worksheet(subject, grade, language, learning_objectives)
                worksheet_key = f"{subject}_grade_{grade}_worksheet"
                content_package[worksheet_key] = {
                    'type': 'worksheet',
                    'subject': subject,
                    'grade_level': grade,
                    'language': language,
                    'content': worksheet_content,
                    'learning_objectives': learning_objectives[:3]
                }
        
        await self.learn_from_interaction({
            'task_type': 'content_generation',
            'success_score': 0.85,
            'patterns': {
                'subjects': subjects,
                'grade_levels': grade_levels,
                'content_types': ['story', 'worksheet']
            }
        })
        
        return {
            'content_package': content_package,
            'generation_summary': {
                'total_items': len(content_package),
                'subjects_covered': subjects,
                'grade_levels_covered': grade_levels,
                'content_types': ['story', 'worksheet']
            },
            'metadata': {
                'generated_by': self.agent_id,
                'generation_time': datetime.now(timezone.utc).isoformat(),
                'language': language
            }
        }
    
    async def create_educational_story(self, subject: str, grade: int, language: str, objectives: List[str]) -> str:
        """Create educational story for specific subject and grade"""
        
        objectives_text = ', '.join(objectives[:3]) if objectives else f"{subject} concepts"
        
        prompt = f"""
        Create an engaging educational story in {language} for Grade {grade} students about {subject}.
        
        Learning objectives to incorporate: {objectives_text}
        
        Requirements:
        - Age-appropriate for Grade {grade}
        - Culturally relevant to Indian context
        - Educational and entertaining
        - 200-300 words
        - Include characters students can relate to
        - Incorporate learning concepts naturally
        
        Write the story in {language}:
        """
        
        story = self.gemini.generate_content(prompt, language)
        return story
    
    async def create_interactive_worksheet(self, subject: str, grade: int, language: str, objectives: List[str]) -> str:
        """Create interactive worksheet for specific subject and grade"""
        
        objectives_text = ', '.join(objectives[:3]) if objectives else f"{subject} skills"
        
        prompt = f"""
        Create an interactive worksheet in {language} for Grade {grade} students on {subject}.
        
        Learning objectives: {objectives_text}
        
        Include:
        1. Brief explanation/review (2-3 sentences)
        2. 5 practice questions (mix of types)
        3. 1 creative activity
        4. Answer key
        
        Make it engaging and appropriate for Grade {grade} level.
        
        Create the worksheet in {language}:
        """
        
        worksheet = self.gemini.generate_content(prompt, language)
        return worksheet