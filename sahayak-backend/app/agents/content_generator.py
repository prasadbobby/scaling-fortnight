from typing import Dict, List, Optional
from ..services.gemini_service import GeminiService
from ..services.imagen_service import ImagenService
from ..services.veo_service import VeoService

class ContentGeneratorAgent:
    def __init__(self, gemini_service: GeminiService, imagen_service: ImagenService, veo_service: VeoService):
        self.gemini = gemini_service
        self.imagen = imagen_service
        self.veo = veo_service
    
    def generate_hyper_local_content(self, request: Dict) -> Dict:
        """Generate culturally relevant content in local language"""
        try:
            topic = request.get('topic')
            language = request.get('language', 'en')
            content_type = request.get('content_type', 'story')
            cultural_context = request.get('cultural_context', 'Indian rural')
            grade_level = request.get('grade_level', 5)
            
            if content_type == 'story':
                content = self.gemini.generate_story(topic, language, cultural_context)
            else:
                prompt = f"""
                Create educational {content_type} about {topic} in {language}.
                Context: {cultural_context}
                Grade Level: {grade_level}
                
                Make it culturally relevant and engaging for students.
                """
                content = self.gemini.generate_content(prompt, language)
            
            # Generate accompanying visual if requested and service is available
            visual_data = None
            visual_status = "not_requested"
            
            if request.get('include_visual', False):
                if self.imagen.is_available():
                    visual_description = f"{topic} illustration for Grade {grade_level} students"
                    visual_data = self.imagen.generate_educational_image(visual_description)
                    visual_status = "generated" if visual_data else "generation_failed"
                else:
                    visual_status = "service_unavailable"
            
            return {
                'content': content,
                'visual': visual_data,
                'visual_status': visual_status,
                'metadata': {
                    'topic': topic,
                    'language': language,
                    'content_type': content_type,
                    'grade_level': grade_level,
                    'cultural_context': cultural_context,
                    'services_used': {
                        'gemini': True,
                        'imagen': self.imagen.is_available(),
                        'veo': self.veo.is_available()
                    }
                }
            }
            
        except Exception as e:
            raise Exception(f"Content generation failed: {str(e)}")
    
    def create_educational_game(self, topic: str, grade_level: int, language: str) -> Dict:
        """Generate educational games on-the-fly"""
        prompt = f"""
        Create an interactive educational game about {topic} for Grade {grade_level} students in {language}.
        
        The game should:
        - Be playable in a classroom setting
        - Require minimal resources
        - Be engaging and educational
        - Include clear rules and objectives
        - Have variations for different skill levels
        
        Format the response as JSON with:
        - game_name
        - objective
        - rules
        - materials_needed
        - variations
        - assessment_criteria
        
        Respond in {language}:
        """
        
        try:
            game_content = self.gemini.generate_content(prompt, language)
            return {
                'game_content': game_content,
                'topic': topic,
                'grade_level': grade_level,
                'language': language,
                'services_used': {
                    'gemini': True,
                    'imagen': self.imagen.is_available(),
                    'veo': self.veo.is_available()
                }
            }
        except Exception as e:
            raise Exception(f"Game generation failed: {str(e)}")