import google.generativeai as genai
from google.cloud import aiplatform
from typing import Dict, List, Optional
import json
import base64
from PIL import Image
import io

class GeminiService:
    def __init__(self, api_key: str, project_id: str):
        genai.configure(api_key=api_key)
        aiplatform.init(project=project_id, location="us-central1")
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.vision_model = genai.GenerativeModel('gemini-2.5-flash')
    
    def generate_content(self, prompt: str, language: str = 'en') -> str:
        """Generate text content using Gemini"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Content generation failed: {str(e)}")
    
    def analyze_image_and_generate(self, image_data: bytes, prompt: str) -> str:
        """Analyze image and generate content based on it"""
        try:
            image = Image.open(io.BytesIO(image_data))
            response = self.vision_model.generate_content([prompt, image])
            return response.text
        except Exception as e:
            raise Exception(f"Image analysis failed: {str(e)}")
    
    def generate_differentiated_content(self, base_content: str, grade_levels: List[int], language: str) -> Dict[int, str]:
        """Generate content for different grade levels"""
        results = {}
        for grade in grade_levels:
            prompt = f"""
            Adapt the following content for Grade {grade} students in {language}:
            
            Original Content: {base_content}
            
            Requirements:
            - Use age-appropriate vocabulary
            - Adjust complexity level
            - Include relevant examples
            - Keep cultural context intact
            
            Generate adapted content in {language}:
            """
            
            try:
                adapted_content = self.generate_content(prompt, language)
                results[grade] = adapted_content
            except Exception as e:
                results[grade] = f"Error generating content for Grade {grade}: {str(e)}"
        
        return results
    
    def explain_concept(self, question: str, grade_level: int, language: str) -> str:
        """Provide simple explanations for complex concepts"""
        prompt = f"""
        You are a helpful teacher explaining concepts to Grade {grade_level} students in {language}.
        
        Question: {question}
        
        Provide a simple, accurate explanation that:
        - Uses age-appropriate language for Grade {grade_level}
        - Includes easy-to-understand analogies
        - Uses examples from Indian context
        - Is culturally relevant
        - Keeps the explanation concise but complete
        
        Respond in {language}:
        """
        
        return self.generate_content(prompt, language)
    
    def generate_story(self, topic: str, language: str, cultural_context: str) -> str:
        """Generate culturally relevant stories"""
        prompt = f"""
        Create an educational story in {language} about {topic} with {cultural_context} context.
        
        Requirements:
        - Make it engaging for children
        - Include educational elements
        - Use familiar cultural references
        - Keep it age-appropriate
        - Length: 200-300 words
        
        Story in {language}:
        """
        
        return self.generate_content(prompt, language)