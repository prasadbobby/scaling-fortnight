from google.cloud import aiplatform
from typing import List, Optional
import base64
import logging

class ImagenService:
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        self.enabled = False
        
        try:
            aiplatform.init(project=project_id, location=location)
            self.client = aiplatform.gapic.PredictionServiceClient(
                client_options={"api_endpoint": f"{location}-aiplatform.googleapis.com"}
            )
            self.enabled = True
            print("✅ Imagen service initialized")
        except Exception as e:
            print(f"⚠️  Imagen service disabled: {str(e)}")
            self.enabled = False
    
    def generate_educational_image(self, description: str, style: str = "simple line drawing") -> Optional[bytes]:
        """Generate educational images using Imagen"""
        if not self.enabled:
            print("ℹ️  Imagen service not available - skipping image generation")
            return None
            
        try:
            endpoint = f"projects/{self.project_id}/locations/{self.location}/publishers/google/models/imagen-3.0-fast-generate-001"
            
            prompt = f"Educational {style}: {description}. Simple, clear, black and white line drawing suitable for classroom use and blackboard reproduction."
            
            instances = [{
                "prompt": prompt,
                "sampleCount": 1,
                "aspectRatio": "1:1",
                "safetyFilterLevel": "block_some",
                "personGeneration": "dont_allow"
            }]
            
            response = self.client.predict(
                endpoint=endpoint,
                instances=instances
            )
            
            # Extract image data from response
            image_data = response.predictions[0]["bytesBase64Encoded"]
            return base64.b64decode(image_data)
            
        except Exception as e:
            print(f"⚠️  Image generation failed: {str(e)}")
            return None
    
    def generate_diagram(self, concept: str, grade_level: int) -> Optional[bytes]:
        """Generate educational diagrams"""
        if not self.enabled:
            return None
            
        description = f"Educational diagram explaining {concept} for Grade {grade_level} students"
        return self.generate_educational_image(description, "scientific diagram")
    
    def generate_worksheet_visual(self, topic: str, grade_level: int) -> Optional[bytes]:
        """Generate visuals for worksheets"""
        if not self.enabled:
            return None
            
        description = f"Worksheet illustration for {topic}, suitable for Grade {grade_level}"
        return self.generate_educational_image(description, "worksheet illustration")
    
    def is_available(self) -> bool:
        """Check if service is available"""
        return self.enabled