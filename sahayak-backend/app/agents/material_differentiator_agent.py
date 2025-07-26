# sahayak-backend/app/agents/material_differentiator_agent.py
from .base_agent import BaseAgent, AgentMessage
from ..services.gemini_service import GeminiService
from typing import Dict, List, Any
import uuid
from datetime import datetime, timezone

class MaterialDifferentiatorAgent(BaseAgent):
    def __init__(self, gemini_service: GeminiService):
        super().__init__(
            agent_id="material_differentiator",
            name="Material Differentiator Agent",
            capabilities=[
                "content_adaptation",
                "difficulty_scaling", 
                "multi_grade_optimization",
                "accessibility_enhancement",
                "learning_style_adaptation"
            ]
        )
        self.gemini = gemini_service
        
    async def process_message(self, message: AgentMessage) -> AgentMessage:
        task = message.content.get('task')
        
        if task == 'create_differentiated_materials':
            result = await self.create_differentiated_materials(message.content['input'])
        elif task == 'differentiate_textbook_page':
            result = await self.differentiate_textbook_page(
                message.content['input']['image_data'],
                message.content['input']['grade_levels'],
                message.content['input']['language']
            )
        elif task == 'create_multi_level_assessment':
            result = await self.create_multi_level_assessment(
                message.content['input']['topic'],
                message.content['input']['grade_levels'],
                message.content['input']['language']
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
    
    async def create_differentiated_materials(self, content_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create differentiated materials from base content"""
        
        content_package = content_data.get('content_package', {})
        differentiated_materials = {}
        
        # Extract unique grade levels from content
        grade_levels = set()
        for item in content_package.values():
            grade_levels.add(item.get('grade_level'))
        
        grade_levels = sorted(list(grade_levels))
        
        # Differentiate each content item for different learning levels
        for content_key, content_item in content_package.items():
            base_content = content_item.get('content', '')
            subject = content_item.get('subject', '')
            grade = content_item.get('grade_level', 5)
            content_type = content_item.get('type', '')
            
            # Create differentiated versions
            differentiated_versions = await self.create_grade_variations(
                base_content, subject, grade, content_type
            )
            
            differentiated_materials[content_key] = {
                'original': content_item,
                'differentiated_versions': differentiated_versions,
                'grade_adaptations': await self.create_grade_adaptations(
                    base_content, subject, grade_levels, content_type
                ),
                'accessibility_features': await self.add_accessibility_features(base_content),
                'learning_style_variations': await self.create_learning_style_variations(
                    base_content, subject, grade, content_type
                )
            }
        
        await self.learn_from_interaction({
            'task_type': 'material_differentiation',
            'success_score': 0.88,
            'patterns': {
                'grade_levels': list(grade_levels),
                'content_types': list(set(item.get('type') for item in content_package.values())),
                'differentiation_strategies': ['grade_adaptation', 'accessibility', 'learning_styles']
            }
        })
        
        return {
            'differentiated_materials': differentiated_materials,
            'differentiation_summary': {
                'total_items_processed': len(content_package),
                'grade_levels_covered': list(grade_levels),
                'differentiation_types': ['beginner', 'intermediate', 'advanced', 'accessibility', 'visual', 'auditory', 'kinesthetic']
            },
            'metadata': {
                'differentiated_by': self.agent_id,
                'differentiation_time': datetime.utcnow().isoformat(),
                'quality_score': 0.88
            }
        }
    
    def differentiate_textbook_page(self, image_data: bytes, grade_levels: List[int], language: str) -> Dict[str, Any]:
        """Differentiate textbook page for different grade levels (legacy method for backward compatibility)"""
        
        # Use Gemini to analyze the image and create differentiated content
        try:
            # Analyze the textbook page
            analysis_prompt = f"""
            Analyze this textbook page and create differentiated materials for grades {grade_levels} in {language}.
            
            For each grade level, create:
            1. A simplified worksheet based on the content
            2. Key vocabulary appropriate for that grade
            3. Practice exercises at the right difficulty level
            4. Learning objectives for that grade
            
            Make sure the content is culturally relevant and pedagogically sound.
            """
            
            # This would use the vision model to analyze the image
            analysis_result = self.gemini.analyze_image_and_generate(image_data, analysis_prompt)
            
            # Create differentiated materials for each grade
            differentiated_materials = {}
            for grade in grade_levels:
                grade_prompt = f"""
                Based on the textbook analysis, create a worksheet for Grade {grade} in {language}:
                
                Analysis: {analysis_result}
                
                Create appropriate content for Grade {grade} including:
                - Simplified explanations
                - Age-appropriate vocabulary
                - Practice exercises
                - Assessment questions
                
                Worksheet for Grade {grade}:
                """
                
                worksheet_content = self.gemini.generate_content(grade_prompt, language)
                
                differentiated_materials[grade] = {
                    'worksheet': worksheet_content,
                    'difficulty_level': self.get_difficulty_level(grade),
                    'estimated_time': f"{self.get_estimated_time(grade)} minutes"
                }
            
            return {
                'success': True,
                'differentiated_materials': differentiated_materials,
                'source_analysis': analysis_result,
                'grade_levels': grade_levels,
                'language': language
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to process textbook page'
            }
    
    def create_multi_level_assessment(self, topic: str, grade_levels: List[int], language: str) -> Dict[str, Any]:
        """Create assessments for multiple grade levels (legacy method for backward compatibility)"""
        
        try:
            assessments = {}
            
            for grade in grade_levels:
                assessment_prompt = f"""
                Create an assessment for {topic} suitable for Grade {grade} students in {language}.
                
                Include:
                1. 5 multiple choice questions
                2. 3 short answer questions
                3. 1 practical/application question
                4. Answer key with explanations
                
                Make it age-appropriate and culturally relevant.
                
                Assessment:
                """
                
                assessment_content = self.gemini.generate_content(assessment_prompt, language)
                assessments[grade] = assessment_content
            
            return {
                'success': True,
                'assessments': assessments,
                'topic': topic,
                'grade_levels': grade_levels,
                'language': language
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create assessments'
            }
    
    async def create_grade_variations(self, content: str, subject: str, base_grade: int, content_type: str) -> Dict[str, str]:
        """Create variations for different difficulty levels"""
        
        variations = {}
        
        # Create beginner version (1 grade below)
        beginner_prompt = f"""
        Adapt this {content_type} about {subject} for students who are 1 grade level below (simpler than Grade {base_grade}):
        
        Original content: {content}
        
        Make it:
        - Simpler vocabulary
        - Shorter sentences
        - Basic concepts only
        - More visual/concrete examples
        
        Adapted content:
        """
        
        variations['beginner'] = self.gemini.generate_content(beginner_prompt)
        
        # Create advanced version (1 grade above)
        advanced_prompt = f"""
        Enhance this {content_type} about {subject} for students who are 1 grade level above (more complex than Grade {base_grade}):
        
        Original content: {content}
        
        Make it:
        - More sophisticated vocabulary
        - Complex concepts
        - Critical thinking elements
        - Extended applications
        
        Enhanced content:
        """
        
        variations['advanced'] = self.gemini.generate_content(advanced_prompt)
        
        # Keep intermediate as original
        variations['intermediate'] = content
        
        return variations
    
    async def create_grade_adaptations(self, content: str, subject: str, grade_levels: List[int], content_type: str) -> Dict[int, str]:
        """Create specific adaptations for each grade level"""
        
        adaptations = {}
        
        for grade in grade_levels:
            adaptation_prompt = f"""
            Adapt this {content_type} about {subject} specifically for Grade {grade} students:
            
            Original content: {content}
            
            Consider Grade {grade} characteristics:
            - Cognitive development level
            - Attention span
            - Prior knowledge
            - Learning capabilities
            - Interest areas
            
            Create Grade {grade} specific version:
            """
            
            adaptations[grade] = self.gemini.generate_content(adaptation_prompt)
        
        return adaptations
    
    async def add_accessibility_features(self, content: str) -> Dict[str, str]:
        """Add accessibility features to content"""
        
        accessibility_features = {}
        
        # Large print version
        accessibility_features['large_print'] = f"[LARGE PRINT VERSION]\n{content}\n[END LARGE PRINT]"
        
        # Simple language version
        simple_prompt = f"""
        Rewrite this content using very simple language for students with learning difficulties:
        
        Original: {content}
        
        Use:
        - Very simple words
        - Short sentences
        - Clear structure
        - Step-by-step format
        
        Simple version:
        """
        
        accessibility_features['simple_language'] = self.gemini.generate_content(simple_prompt)
        
        # Audio description version
        audio_prompt = f"""
        Create an audio-friendly description of this content for students with visual impairments:
        
        Content: {content}
        
        Include:
        - Clear verbal descriptions
        - Spatial relationships
        - Visual elements described
        - Audio cues
        
        Audio description:
        """
        
        accessibility_features['audio_description'] = self.gemini.generate_content(audio_prompt)
        
        return accessibility_features
    
    async def create_learning_style_variations(self, content: str, subject: str, grade: int, content_type: str) -> Dict[str, str]:
        """Create variations for different learning styles"""
        
        learning_styles = {}
        
        # Visual learner version
        visual_prompt = f"""
        Adapt this {content_type} for visual learners (Grade {grade}, {subject}):
        
        Content: {content}
        
        Add:
        - Visual descriptions
        - Diagrams suggestions
        - Color coding ideas
        - Spatial arrangements
        - Charts and graphs references
        
        Visual learner version:
        """
        
        learning_styles['visual'] = self.gemini.generate_content(visual_prompt)
        
        # Auditory learner version
        auditory_prompt = f"""
        Adapt this {content_type} for auditory learners (Grade {grade}, {subject}):
        
        Content: {content}
        
        Add:
        - Rhythm and rhyme
        - Discussion prompts
        - Verbal repetition
        - Sound associations
        - Music connections
        
        Auditory learner version:
        """
        
        learning_styles['auditory'] = self.gemini.generate_content(auditory_prompt)
        
        # Kinesthetic learner version
        kinesthetic_prompt = f"""
        Adapt this {content_type} for kinesthetic learners (Grade {grade}, {subject}):
        
        Content: {content}
        
        Add:
        - Hands-on activities
        - Movement exercises
        - Physical manipulatives
        - Role-playing elements
        - Touch and feel components
        
        Kinesthetic learner version:
        """
        
        learning_styles['kinesthetic'] = self.gemini.generate_content(kinesthetic_prompt)
        
        return learning_styles
    
    def get_difficulty_level(self, grade: int) -> str:
        """Get difficulty level for grade"""
        if grade <= 3:
            return "Basic"
        elif grade <= 6:
            return "Intermediate"
        elif grade <= 9:
            return "Advanced"
        else:
            return "Expert"
    
    def get_estimated_time(self, grade: int) -> int:
        """Get estimated time for grade"""
        if grade <= 3:
            return 20
        elif grade <= 6:
            return 30
        elif grade <= 9:
            return 45
        else:
            return 60