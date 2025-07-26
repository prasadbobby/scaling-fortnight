from google.cloud import aiplatform
import base64
from typing import Optional

class VeoService:
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
            print("✅ Veo service initialized")
        except Exception as e:
            print(f"⚠️  Veo service disabled: {str(e)}")
            self.enabled = False
    
    def generate_educational_video(self, description: str, duration: int = 30) -> Optional[bytes]:
        """Generate educational videos using Veo"""
        if not self.enabled:
            print("ℹ️  Veo service not available - skipping video generation")
            return None
            
        try:
            endpoint = f"projects/{self.project_id}/locations/{self.location}/publishers/google/models/veo-3-fast-generate-001"
            
            prompt = f"Educational video: {description}. Create a {duration}-second educational animation suitable for classroom use. Simple, clear, and engaging for students."
            
            instances = [{
                "prompt": prompt,
                "duration": f"{duration}s",
                "aspectRatio": "16:9",
                "safetyFilterLevel": "block_some"
            }]
            
            response = self.client.predict(
                endpoint=endpoint,
                instances=instances
            )
            
            # Extract video data from response
            video_data = response.predictions[0]["bytesBase64Encoded"]
            return base64.b64decode(video_data)
            
        except Exception as e:
            print(f"⚠️  Video generation failed: {str(e)}")
            return None
    
    def create_concept_animation(self, concept: str, grade_level: int) -> Optional[bytes]:
        """Create animated explanations of concepts"""
        if not self.enabled:
            return None
            
        description = f"Animated explanation of {concept} for Grade {grade_level} students with simple visuals and smooth transitions"
        return self.generate_educational_video(description)
    
    def is_available(self) -> bool:
        """Check if service is available"""
        return self.enabled