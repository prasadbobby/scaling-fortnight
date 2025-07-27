# sahayak-backend/app/services/forms_alternative_service.py
import json
import uuid
import base64
from typing import Dict, List, Any
from datetime import datetime

class FormsAlternativeService:
    """Alternative service when Google Forms API is unavailable"""
    
    def __init__(self):
        self.service_name = "Forms Alternative Service"
        print("🔄 Using Forms Alternative Service (API bypass)")
    
    def is_available(self) -> bool:
        return True
    
    def create_quiz_form(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create quiz using alternative method"""
        try:
            # Generate unique form identifier
            form_id = f"sahayak_{uuid.uuid4().hex[:10]}"
            
            # Create Google Apps Script code
            apps_script_code = self._generate_apps_script(quiz_data, form_id)
            
            # Create manual creation guide
            manual_guide = self._generate_manual_guide(quiz_data)
            
            # Create share-ready link format
            share_link = self._generate_share_link(quiz_data, form_id)
            
            return {
                'success': True,
                'form_id': form_id,
                'form_url': f"https://forms.google.com/quiz-{form_id}",  # Placeholder
                'edit_url': f"https://forms.google.com/edit-{form_id}",  # Placeholder
                'creation_method': 'manual_with_script',
                'apps_script_code': apps_script_code,
                'manual_guide': manual_guide,
                'share_link': share_link,
                'total_questions': len(quiz_data['questions']),
                'total_points': quiz_data.get('total_points', 0),
                'alternative_methods': {
                    'google_script_url': f"https://script.google.com/create?quiz_id={form_id}",
                    'manual_creation': True,
                    'copy_paste_ready': True
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Alternative creation failed: {str(e)}"
            }
    
    def _generate_apps_script(self, quiz_data: Dict[str, Any], form_id: str) -> str:
        """Generate Google Apps Script code to create the form"""
        
        script_code = f"""
// Google Apps Script to create quiz: {quiz_data['title']}
// Run this script at script.google.com

function createSahayakQuiz() {{
  // Create form
  var form = FormApp.create('{quiz_data['title']}');
  
  // Set description
  form.setDescription('{quiz_data['description']}');
  
  // Make it a quiz
  form.setIsQuiz(true);
  
  // Set settings
  form.setCollectEmail(true);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  
"""
        
        # Add questions
        for i, question in enumerate(quiz_data['questions']):
            script_code += self._generate_question_script(question, i)
        
        script_code += f"""
  
  // Log URLs
  console.log('Form created successfully!');
  console.log('Form URL: ' + form.getPublishedUrl());
  console.log('Edit URL: ' + form.getEditUrl());
  
  // Return URLs
  return {{
    formUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    id: form.getId()
  }};
}}

// Run this function to create your quiz
createSahayakQuiz();
"""
        
        return script_code
    
    def _generate_question_script(self, question: Dict[str, Any], index: int) -> str:
        """Generate script code for a single question"""
        
        if question['type'] == 'multiple_choice':
            choices = "', '".join(question['options'])
            correct_answer = question['correct_answer']
            
            return f"""
  // Question {index + 1}: Multiple Choice
  var item{index} = form.addMultipleChoiceItem();
  item{index}.setTitle('{question['text']}')
           .setChoices([
             item{index}.createChoice('{question['options'][0]}', '{question['options'][0]}' === '{correct_answer}'),
             item{index}.createChoice('{question['options'][1]}', '{question['options'][1]}' === '{correct_answer}'),
             item{index}.createChoice('{question['options'][2]}', '{question['options'][2]}' === '{correct_answer}'),
             item{index}.createChoice('{question['options'][3]}', '{question['options'][3]}' === '{correct_answer}')
           ])
           .setRequired(true)
           .setPoints({question.get('points', 1)});
  
  // Set feedback
  var feedback{index} = FormApp.createFeedback()
    .setDisplayText('{question.get('explanation', 'Correct!')}')
    .build();
  item{index}.setFeedbackForCorrect(feedback{index});
"""
        
        elif question['type'] == 'true_false':
            correct = question['correct_answer']
            return f"""
  // Question {index + 1}: True/False
  var item{index} = form.addMultipleChoiceItem();
  item{index}.setTitle('{question['text']}')
           .setChoices([
             item{index}.createChoice('True', '{correct}' === 'True'),
             item{index}.createChoice('False', '{correct}' === 'False')
           ])
           .setRequired(true)
           .setPoints({question.get('points', 1)});
"""
        
        elif question['type'] in ['short_answer', 'fill_blank']:
            return f"""
  // Question {index + 1}: Short Answer
  var item{index} = form.addTextItem();
  item{index}.setTitle('{question['text']}')
           .setRequired(true);
"""
        
        return ""
    
    def _generate_manual_guide(self, quiz_data: Dict[str, Any]) -> str:
        """Generate step-by-step manual creation guide"""
        
        guide = f"""
📝 MANUAL CREATION GUIDE: {quiz_data['title']}
{'='*60}

Step 1: Create Form
1. Go to forms.google.com
2. Click "+ Blank" to create new form
3. Title: {quiz_data['title']}
4. Description: {quiz_data['description']}

Step 2: Enable Quiz Mode
1. Click Settings (gear icon)
2. Toggle "Make this a quiz" → ON
3. Set "Release grade" → Later, after manual review
4. Toggle "Collect email addresses" → ON

Step 3: Add Questions
"""
        
        for i, question in enumerate(quiz_data['questions'], 1):
            guide += f"""
Question {i}: {question['type'].replace('_', ' ').title()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: {question['text']}
Type: {question['type'].replace('_', ' ').title()}
Points: {question.get('points', 1)}
Required: Yes
"""
            
            if question['type'] == 'multiple_choice':
                guide += "Options:\n"
                for option in question['options']:
                    correct_mark = " ✓ CORRECT" if option == question['correct_answer'] else ""
                    guide += f"  • {option}{correct_mark}\n"
            
            elif question['type'] == 'true_false':
                guide += f"Options:\n"
                guide += f"  • True {'✓ CORRECT' if question['correct_answer'] == 'True' else ''}\n"
                guide += f"  • False {'✓ CORRECT' if question['correct_answer'] == 'False' else ''}\n"
            
            if 'explanation' in question:
                guide += f"Answer Feedback: {question['explanation']}\n"
            
            guide += "\n"
        
        guide += f"""
Step 4: Final Settings
1. Click "Send" button
2. Copy the link to share with students
3. Use "Responses" tab to view results

📊 Quiz Summary:
- Total Questions: {len(quiz_data['questions'])}
- Total Points: {quiz_data.get('total_points', 0)}
- Estimated Time: {quiz_data.get('estimated_time', '15 minutes')}

Generated by Sahayak AI Teaching Assistant
"""
        
        return guide
    
    def _generate_share_link(self, quiz_data: Dict[str, Any], form_id: str) -> str:
        """Generate a shareable creation link"""
        
        # Encode quiz data for sharing
        quiz_json = json.dumps(quiz_data, indent=2)
        encoded_data = base64.b64encode(quiz_json.encode()).decode()
        
        return f"https://sahayak.ai/create-quiz?data={encoded_data}&id={form_id}"