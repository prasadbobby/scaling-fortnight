import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from typing import Dict, List, Optional

class FirebaseDB:
    def __init__(self, credentials_path: str):
        if not firebase_admin._apps:
            cred = credentials.Certificate(credentials_path)
            firebase_admin.initialize_app(cred)
        self.db = firestore.client()
    
    def create_teacher(self, teacher_data: Dict) -> str:
        """Create a new teacher profile"""
        teacher_data['created_at'] = datetime.utcnow()
        teacher_data['updated_at'] = datetime.utcnow()
        doc_ref = self.db.collection('teachers').add(teacher_data)
        return doc_ref[1].id
    
    def save_content(self, content_data: Dict) -> str:
        """Save generated content"""
        content_data['created_at'] = datetime.utcnow()
        doc_ref = self.db.collection('content').add(content_data)
        return doc_ref[1].id
    
    def save_lesson_plan(self, plan_data: Dict) -> str:
        """Save lesson plan"""
        plan_data['created_at'] = datetime.utcnow()
        doc_ref = self.db.collection('lesson_plans').add(plan_data)
        return doc_ref[1].id
    
    def get_teacher_content(self, teacher_id: str, limit: int = 50) -> List[Dict]:
        """Get teacher's content history"""
        docs = self.db.collection('content')\
                    .where('teacher_id', '==', teacher_id)\
                    .order_by('created_at', direction=firestore.Query.DESCENDING)\
                    .limit(limit)\
                    .stream()
        return [doc.to_dict() for doc in docs]
    
    def save_assessment(self, assessment_data: Dict) -> str:
        """Save speech assessment results"""
        assessment_data['created_at'] = datetime.utcnow()
        doc_ref = self.db.collection('assessments').add(assessment_data)
        return doc_ref[1].id