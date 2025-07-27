# sahayak-backend/app/services/google_forms_service.py
import json
import os
from typing import Dict, List, Any, Optional
from googleapiclient.discovery import build
from google.oauth2 import service_account
from googleapiclient.errors import HttpError
import logging

logger = logging.getLogger(__name__)

class GoogleFormsService:
    def __init__(self, credentials_path: str = 'firebase_config.json'):
        """Initialize Google Forms API service"""
        self.forms_service = None
        self.drive_service = None
        self.credentials = None
        self.error_message = None
        
        try:
            if not os.path.exists(credentials_path):
                self.error_message = f"Credentials file not found: {credentials_path}"
                logger.error(self.error_message)
                return
            
            self.credentials = service_account.Credentials.from_service_account_file(
                credentials_path,
                scopes=[
                    'https://www.googleapis.com/auth/forms.body',
                    'https://www.googleapis.com/auth/forms.responses.readonly',
                    'https://www.googleapis.com/auth/drive.file'
                ]
            )
            
            self.forms_service = build('forms', 'v1', credentials=self.credentials)
            self.drive_service = build('drive', 'v3', credentials=self.credentials)
            
            logger.info("✅ Google Forms API initialized successfully")
            
        except Exception as e:
            self.error_message = f"Failed to initialize Google Forms API: {str(e)}"
            logger.error(self.error_message)
    
    def is_available(self) -> bool:
        """Check if Google Forms API is available"""
        return (self.forms_service is not None and 
                self.drive_service is not None and 
                self.credentials is not None)
    
    def get_error_message(self) -> str:
        """Get the error message if service is not available"""
        return self.error_message or "Unknown error"
    
    def get_service_account_email(self) -> str:
        """Get service account email"""
        if self.credentials:
            return self.credentials.service_account_email
        return "Not available"
    
    def create_quiz_form(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a Google Form with quiz questions using proper API calls"""
        try:
            if not self.is_available():
                raise Exception("Google Forms API not available")
            
            # Step 1: Create form with ONLY title
            form_body = {
                "info": {
                    "title": quiz_data['title']
                }
            }
            
            form = self.forms_service.forms().create(body=form_body).execute()
            form_id = form['formId']
            
            logger.info(f"✅ Created form with ID: {form_id}")
            
            # Step 2: Update form with description and quiz settings using batchUpdate
            initial_updates = [
                {
                    "updateFormInfo": {
                        "info": {
                            "description": quiz_data['description']
                        },
                        "updateMask": "description"
                    }
                },
                {
                    "updateSettings": {
                        "settings": {
                            "quizSettings": {
                                "isQuiz": True
                            }
                        },
                        "updateMask": "quizSettings.isQuiz"
                    }
                }
            ]
            
            self.forms_service.forms().batchUpdate(
                formId=form_id,
                body={"requests": initial_updates}
            ).execute()
            
            logger.info(f"✅ Updated form settings for: {form_id}")
            
            # Step 3: Add questions
            self._add_questions_to_form(form_id, quiz_data['questions'])
            
            # Generate URLs
            form_url = f"https://docs.google.com/forms/d/{form_id}/viewform"
            edit_url = f"https://docs.google.com/forms/d/{form_id}/edit"
            responses_url = f"https://docs.google.com/forms/d/{form_id}/responses"
            
            return {
                'success': True,
                'form_id': form_id,
                'form_url': form_url,
                'edit_url': edit_url,
                'responses_url': responses_url,
                'total_questions': len(quiz_data['questions']),
                'total_points': quiz_data.get('total_points', 0)
            }
            
        except HttpError as e:
            logger.error(f"❌ Google Forms API error: {e}")
            error_detail = json.loads(e.content.decode()) if e.content else {}
            return {
                'success': False,
                'error': f"Google Forms API error: {error_detail.get('error', {}).get('message', str(e))}"
            }
        except Exception as e:
            logger.error(f"❌ Form creation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _add_questions_to_form(self, form_id: str, questions: List[Dict[str, Any]]):
        """Add questions to the form using batch update"""
        try:
            requests = []
            
            for i, question in enumerate(questions):
                question_request = self._create_question_request(question, i)
                if question_request:
                    requests.append(question_request)
            
            if requests:
                # Execute batch update
                batch_update_body = {"requests": requests}
                self.forms_service.forms().batchUpdate(
                    formId=form_id, 
                    body=batch_update_body
                ).execute()
                
                logger.info(f"✅ Added {len(requests)} questions to form {form_id}")
            
        except Exception as e:
            logger.error(f"❌ Error adding questions: {e}")
            raise
    
    def _create_question_request(self, question: Dict[str, Any], index: int) -> Optional[Dict[str, Any]]:
        """Create a question request for batch update"""
        try:
            question_item = {
                "title": question['text'],
                "questionItem": {
                    "question": {
                        "required": True,
                        "grading": {
                            "pointValue": question.get('points', 1),
                            "correctAnswers": {},
                            "whenRight": {
                                "text": question.get('explanation', 'Correct!')
                            },
                            "whenWrong": {
                                "text": f"Incorrect. {question.get('explanation', 'Please review this topic.')}"
                            }
                        }
                    }
                }
            }
            
            # Handle different question types
            if question['type'] == 'multiple_choice':
                # Multiple choice question
                options = []
                correct_answers = []
                
                for option in question['options']:
                    option_obj = {"value": option}
                    options.append(option_obj)
                    
                    if option == question['correct_answer']:
                        correct_answers.append(option_obj)
                
                question_item["questionItem"]["question"]["choiceQuestion"] = {
                    "type": "RADIO",
                    "options": options
                }
                question_item["questionItem"]["question"]["grading"]["correctAnswers"]["answers"] = correct_answers
                
            elif question['type'] == 'true_false':
                # True/False question
                options = [{"value": "True"}, {"value": "False"}]
                correct_answer = question['correct_answer']
                correct_answers = [{"value": correct_answer}]
                
                question_item["questionItem"]["question"]["choiceQuestion"] = {
                    "type": "RADIO",
                    "options": options
                }
                question_item["questionItem"]["question"]["grading"]["correctAnswers"]["answers"] = correct_answers
                
            elif question['type'] in ['short_answer', 'fill_blank']:
                # Short answer question
                question_item["questionItem"]["question"]["textQuestion"] = {
                    "paragraph": False
                }
                question_item["questionItem"]["question"]["grading"]["correctAnswers"]["answers"] = [
                    {"value": question['correct_answer']}
                ]
            
            return {
                "createItem": {
                    "item": question_item,
                    "location": {"index": index}
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error creating question request: {e}")
            return None
    
    def get_form_responses(self, form_id: str) -> Dict[str, Any]:
        """Get responses from a form"""
        try:
            if not self.is_available():
                raise Exception("Google Forms API not available")
            
            responses = self.forms_service.forms().responses().list(formId=form_id).execute()
            form = self.forms_service.forms().get(formId=form_id).execute()
            
            return {
                'success': True,
                'form_title': form['info']['title'],
                'responses': responses.get('responses', []),
                'response_count': len(responses.get('responses', []))
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting responses: {e}")
            return {
                'success': False,
                'error': str(e)
            }