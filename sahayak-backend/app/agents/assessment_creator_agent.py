# sahayak-backend/app/agents/assessment_creator_agent.py
from .base_agent import BaseAgent, AgentMessage
from ..services.gemini_service import GeminiService
from typing import Dict, List, Any
import uuid
from datetime import datetime, timezone

class AssessmentCreatorAgent(BaseAgent):
    def __init__(self, gemini_service: GeminiService):
        super().__init__(
            agent_id="assessment_creator",
            name="Assessment Creator Agent",
            capabilities=[
                "formative_assessment_design",
                "summative_assessment_creation", 
                "rubric_development",
                "adaptive_testing",
                "progress_tracking_systems",
                "peer_assessment_design"
            ]
        )
        self.gemini = gemini_service
        
    async def process_message(self, message: AgentMessage) -> AgentMessage:
        task = message.content.get('task')
        
        if task == 'design_assessments':
            result = await self.design_comprehensive_assessments(message.content['input'])
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
    
    async def design_comprehensive_assessments(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Design comprehensive assessments based on content and materials"""
        
        content_package = input_data.get('content_package', {})
        materials = input_data.get('differentiated_materials', {})
        
        assessments = {}
        
        # Extract subjects and grades from content
        subjects = set()
        grade_levels = set()
        
        for item in content_package.values():
            subjects.add(item.get('subject', ''))
            grade_levels.add(item.get('grade_level', 5))
        
        subjects = list(subjects)
        grade_levels = sorted(list(grade_levels))
        
        # Create assessments for each subject-grade combination
        for subject in subjects:
            for grade in grade_levels:
                assessment_key = f"{subject}_grade_{grade}_assessment"
                
                # Get relevant content for this subject-grade
                relevant_content = self.extract_relevant_content(content_package, subject, grade)
                
                # Create comprehensive assessment
                assessment_package = await self.create_grade_subject_assessment(
                    subject, grade, relevant_content
                )
                
                assessments[assessment_key] = assessment_package
        
        # Create cross-curricular assessments
        cross_curricular = await self.create_cross_curricular_assessments(subjects, grade_levels, content_package)
        
        # Create adaptive assessment system
        adaptive_system = await self.create_adaptive_assessment_system(assessments)
        
        await self.learn_from_interaction({
            'task_type': 'assessment_design',
            'success_score': 0.91,
            'patterns': {
                'subjects': subjects,
                'grade_levels': grade_levels,
                'assessment_types': ['formative', 'summative', 'adaptive', 'cross_curricular']
            }
        })
        
        return {
            'individual_assessments': assessments,
            'cross_curricular_assessments': cross_curricular,
            'adaptive_assessment_system': adaptive_system,
            'assessment_rubrics': await self.create_comprehensive_rubrics(assessments),
            'progress_tracking_system': await self.design_progress_tracking(assessments),
            'metadata': {
                'total_assessments': len(assessments),
                'subjects_covered': subjects,
                'grade_levels_covered': grade_levels,
                'assessment_creator': self.agent_id,
                'creation_time': datetime.now(timezone.utc).isoformat()
            }
        }
    
    async def create_grade_subject_assessment(self, subject: str, grade: int, relevant_content: Dict) -> Dict[str, Any]:
        """Create comprehensive assessment for specific grade and subject"""
        
        content_summary = self.summarize_content(relevant_content)
        
        # Diagnostic Pre-Assessment
        diagnostic_prompt = f"""
        Create a diagnostic pre-assessment for Grade {grade} {subject}:
        
        Content to assess: {content_summary}
        
        Create 5 questions that:
        - Assess prior knowledge
        - Identify learning gaps
        - Are quick to complete (10 minutes)
        - Include multiple choice and short answer
        
        Include answer key and interpretation guide.
        
        Diagnostic Assessment:
        """
        
        diagnostic = self.gemini.generate_content(diagnostic_prompt)
        
        # Formative Assessment Activities
        formative_prompt = f"""
        Create 4 formative assessment activities for Grade {grade} {subject}:
        
        Content: {content_summary}
        
        Each activity should:
        - Take 5-10 minutes
        - Provide immediate feedback
        - Check understanding of specific concepts
        - Be engaging and interactive
        
        Formative Activities:
        """
        
        formative = self.gemini.generate_content(formative_prompt)
        
        # Summative Assessment
        summative_prompt = f"""
        Create a comprehensive summative assessment for Grade {grade} {subject}:
        
        Content covered: {content_summary}
        
        Include:
        - 10 multiple choice questions
        - 5 short answer questions
        - 2 long answer/application questions
        - 1 creative/project component
        - Complete answer key with explanations
        - Scoring rubric
        
        Assessment duration: 45 minutes
        
        Summative Assessment:
        """
        
        summative = self.gemini.generate_content(summative_prompt)
        
        # Performance-Based Assessment
        performance_prompt = f"""
        Create a performance-based assessment for Grade {grade} {subject}:
        
        Content: {content_summary}
        
        Design a practical task that:
        - Applies learned concepts
        - Can be completed in class
        - Uses minimal resources
        - Demonstrates real understanding
        - Includes peer evaluation component
        
        Performance Task:
        """
        
        performance = self.gemini.generate_content(performance_prompt)
        
        # Self-Assessment Tool
        self_assessment_prompt = f"""
        Create a self-assessment tool for Grade {grade} students in {subject}:
        
        Content: {content_summary}
        
        Include:
        - Simple self-reflection questions
        - Learning goal checklist
        - Confidence rating scales
        - Goal setting prompts
        
        Self-Assessment Tool:
        """
        
        self_assessment = self.gemini.generate_content(self_assessment_prompt)
        
        return {
            'diagnostic_assessment': diagnostic,
            'formative_activities': formative,
            'summative_assessment': summative,
            'performance_based': performance,
            'self_assessment': self_assessment,
            'subject': subject,
            'grade_level': grade,
            'estimated_total_time': '90 minutes',
            'difficulty_level': self.determine_difficulty_level(grade),
            'learning_objectives_covered': self.extract_objectives(relevant_content)
        }
    
    async def create_cross_curricular_assessments(self, subjects: List[str], grade_levels: List[int], content_package: Dict) -> Dict[str, Any]:
        """Create assessments that span multiple subjects"""
        
        cross_curricular = {}
        
        # Create subject combination assessments
        if len(subjects) >= 2:
            for grade in grade_levels:
                combination_prompt = f"""
                Create a cross-curricular assessment for Grade {grade} that combines {', '.join(subjects)}:
                
                Design a project or assessment that:
                - Integrates concepts from all subjects
                - Is appropriate for Grade {grade}
                - Can be completed in 2-3 class periods
                - Includes collaboration elements
                - Has clear evaluation criteria
                
                Cross-Curricular Assessment:
                """
                
                cross_curricular[f"grade_{grade}_integrated"] = self.gemini.generate_content(combination_prompt)
        
        return cross_curricular
    
    async def create_adaptive_assessment_system(self, assessments: Dict) -> Dict[str, Any]:
        """Create adaptive assessment system that adjusts to student performance"""
        
        adaptive_prompt = f"""
        Design an adaptive assessment system based on the created assessments:
        
        Number of assessments: {len(assessments)}
        
        Create a system that:
        - Adjusts difficulty based on student responses
        - Provides personalized learning paths
        - Identifies strength and weakness patterns
        - Suggests remediation or enrichment
        - Tracks progress over time
        
        Include:
        - Decision tree for adaptation
        - Performance thresholds
        - Intervention strategies
        - Progress indicators
        
        Adaptive System:
        """
        
        adaptive_system = self.gemini.generate_content(adaptive_prompt)
        
        return {
            'system_description': adaptive_system,
            'adaptation_rules': await self.create_adaptation_rules(),
            'performance_thresholds': self.define_performance_thresholds(),
            'intervention_strategies': await self.create_intervention_strategies()
        }
    
    async def create_comprehensive_rubrics(self, assessments: Dict) -> Dict[str, Any]:
        """Create detailed rubrics for all assessments"""
        
        rubrics = {}
        
        for assessment_key, assessment_data in assessments.items():
            rubric_prompt = f"""
            Create a detailed rubric for this assessment:
            
            Assessment: {assessment_key}
            Subject: {assessment_data.get('subject', '')}
            Grade: {assessment_data.get('grade_level', '')}
            
            Create a 4-level rubric (Excellent, Good, Satisfactory, Needs Improvement) with:
            - Clear performance criteria
            - Specific descriptors for each level
            - Point values
            - Observable behaviors
            
            Rubric:
            """
            
            rubrics[assessment_key] = self.gemini.generate_content(rubric_prompt)
        
        return rubrics
    
    async def design_progress_tracking(self, assessments: Dict) -> Dict[str, Any]:
        """Design system to track student progress over time"""
        
        tracking_prompt = f"""
        Design a progress tracking system for these assessments:
        
        Total assessments: {len(assessments)}
        
        Create a system that:
        - Tracks individual student progress
        - Identifies class-wide trends
        - Provides visual progress indicators
        - Alerts for students needing support
        - Generates progress reports
        
        Progress Tracking System:
        """
        
        tracking_system = self.gemini.generate_content(tracking_prompt)
        
        return {
            'tracking_system': tracking_system,
            'progress_indicators': await self.define_progress_indicators(),
            'reporting_templates': await self.create_reporting_templates(),
            'intervention_triggers': self.define_intervention_triggers()
        }
    
    def extract_relevant_content(self, content_package: Dict, subject: str, grade: int) -> Dict:
        """Extract content relevant to specific subject and grade"""
        relevant = {}
        for key, item in content_package.items():
            if item.get('subject') == subject and item.get('grade_level') == grade:
                relevant[key] = item
        return relevant
    
    def summarize_content(self, content: Dict) -> str:
        """Create summary of content for assessment creation"""
        summaries = []
        for item in content.values():
            content_text = item.get('content', '')
            summary = content_text[:200] + '...' if len(content_text) > 200 else content_text
            summaries.append(f"{item.get('type', '')}: {summary}")
        return '\n'.join(summaries)
    
    def determine_difficulty_level(self, grade: int) -> str:
        """Determine difficulty level based on grade"""
        if grade <= 3:
            return "Elementary"
        elif grade <= 6:
            return "Intermediate"
        elif grade <= 9:
            return "Advanced"
        else:
            return "Expert"
    
    def extract_objectives(self, content: Dict) -> List[str]:
        """Extract learning objectives from content"""
        objectives = []
        for item in content.values():
            item_objectives = item.get('learning_objectives', [])
            objectives.extend(item_objectives)
        return list(set(objectives))  # Remove duplicates
    
    async def create_adaptation_rules(self) -> List[Dict]:
        """Create rules for adaptive assessment"""
        return [
            {"condition": "score < 60%", "action": "provide_easier_questions", "support": "remediation_content"},
            {"condition": "score > 90%", "action": "provide_harder_questions", "support": "enrichment_activities"},
            {"condition": "consistent_errors", "action": "identify_misconceptions", "support": "targeted_instruction"}
        ]
    
    def define_performance_thresholds(self) -> Dict[str, int]:
        """Define performance thresholds for different actions"""
        return {
            "mastery": 85,
            "proficient": 70,
            "developing": 55,
            "needs_support": 40
        }
    
    async def create_intervention_strategies(self) -> Dict[str, str]:
        """Create intervention strategies for different performance levels"""
        return {
            "needs_support": "One-on-one tutoring, basic concept review, alternative explanations",
            "developing": "Small group work, additional practice, peer support",
            "proficient": "Extension activities, leadership roles, deeper applications",
            "mastery": "Independent projects, mentoring others, advanced challenges"
        }
    
    async def define_progress_indicators(self) -> List[str]:
        """Define what indicates progress"""
        return [
            "Improvement in assessment scores over time",
            "Increased complexity of problems solved correctly",
            "Better quality of explanations and reasoning",
            "Greater independence in learning",
            "Ability to help peers"
        ]
    
    async def create_reporting_templates(self) -> Dict[str, str]:
        """Create templates for progress reports"""
        return {
            "student_report": "Individual progress summary with strengths, areas for growth, and goals",
            "parent_report": "Student progress communication for parents with specific examples",
            "teacher_report": "Classroom overview with student groupings and intervention needs",
            "admin_report": "School-level data with trends and recommendations"
        }
    
    def define_intervention_triggers(self) -> Dict[str, str]:
        """Define when interventions should be triggered"""
        return {
            "immediate": "Score below 40% on any assessment",
            "weekly": "No improvement shown over 2 weeks",
            "monthly": "Consistently below grade level expectations",
            "quarterly": "Not meeting annual learning goals"
        }