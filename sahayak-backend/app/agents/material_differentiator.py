from typing import Dict, List
from ..services.gemini_service import GeminiService

class MaterialDifferentiatorAgent:
    def __init__(self, gemini_service: GeminiService):
        self.gemini = gemini_service
    
    def differentiate_textbook_page(self, image_data: bytes, grade_levels: List[int], language: str) -> Dict:
        """Create differentiated materials from textbook page"""
        try:
            # First, analyze the textbook page
            analysis_prompt = f"""
            Analyze this textbook page and extract:
            1. Main topic/subject
            2. Key concepts
            3. Current grade level
            4. Learning objectives
            5. Content summary
            
            Provide analysis in {language}:
            """
            
            page_analysis = self.gemini.analyze_image_and_generate(image_data, analysis_prompt)
            
            # Generate differentiated worksheets for each grade level
            differentiated_materials = {}
            
            for grade in grade_levels:
                worksheet_prompt = f"""
                Based on the textbook page analysis: {page_analysis}
                
                Create a worksheet for Grade {grade} students in {language} that includes:
                1. Simplified/enhanced explanations appropriate for Grade {grade}
                2. 3-5 questions of varying difficulty
                3. Activity suggestions
                4. Assessment rubric
                
                Format as a complete worksheet in {language}:
                """
                
                worksheet = self.gemini.generate_content(worksheet_prompt, language)
                differentiated_materials[grade] = {
                    'worksheet': worksheet,
                    'difficulty_level': self._determine_difficulty(grade),
                    'estimated_time': self._estimate_completion_time(grade)
                }
            
            return {
                'original_analysis': page_analysis,
                'differentiated_materials': differentiated_materials,
                'metadata': {
                    'grade_levels': grade_levels,
                    'language': language,
                    'generated_at': self._get_timestamp()
                }
            }
            
        except Exception as e:
            raise Exception(f"Material differentiation failed: {str(e)}")
    
    def create_multi_level_assessment(self, topic: str, grade_levels: List[int], language: str) -> Dict:
        """Create assessments for multiple grade levels"""
        assessments = {}
        
        for grade in grade_levels:
            prompt = f"""
            Create an assessment for {topic} suitable for Grade {grade} students in {language}.
            
            Include:
            1. 5 multiple choice questions
            2. 3 short answer questions
            3. 1 practical application question
            4. Answer key with explanations
            
            Ensure appropriate difficulty level for Grade {grade}.
            
            Assessment in {language}:
            """
            
            try:
                assessment = self.gemini.generate_content(prompt, language)
                assessments[grade] = assessment
            except Exception as e:
                assessments[grade] = f"Error generating assessment for Grade {grade}: {str(e)}"
        
        return {
            'assessments': assessments,
            'topic': topic,
            'grade_levels': grade_levels,
            'language': language
        }
    
    def _determine_difficulty(self, grade: int) -> str:
        """Determine difficulty level based on grade"""
        if grade <= 3:
            return "Basic"
        elif grade <= 6:
            return "Intermediate"
        elif grade <= 9:
            return "Advanced"
        else:
            return "Expert"
    
    def _estimate_completion_time(self, grade: int) -> str:
        """Estimate completion time based on grade"""
        base_time = 15 + (grade * 2)  # Base time increases with grade
        return f"{base_time}-{base_time + 10} minutes"
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.utcnow().isoformat()