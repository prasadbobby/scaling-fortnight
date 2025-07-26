# sahayak-backend/app/workflow/workflow_manager.py
import threading
import queue
import time
import uuid
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class WorkflowStatus(Enum):
    CREATED = "created"
    EXECUTING = "executing"
    COMPLETED = "completed"
    ERROR = "error"

@dataclass
class WorkflowEvent:
    id: str
    type: str
    data: Dict[str, Any]
    timestamp: str
    sent: bool = False

@dataclass
class Workflow:
    id: str
    type: str
    data: Dict[str, Any]
    teacher_id: str
    status: WorkflowStatus
    events: List[WorkflowEvent]
    results: Optional[Dict[str, Any]]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    progress: int = 0

class WorkflowManager:
    def __init__(self):
        self.workflows: Dict[str, Workflow] = {}
        self.event_queues: Dict[str, queue.Queue] = {}
        self.lock = threading.RLock()
        
    def create_workflow(self, workflow_type: str, data: Dict[str, Any], teacher_id: str) -> str:
        workflow_id = str(uuid.uuid4())
        
        with self.lock:
            workflow = Workflow(
                id=workflow_id,
                type=workflow_type,
                data=data,
                teacher_id=teacher_id,
                status=WorkflowStatus.CREATED,
                events=[],
                results=None,
                created_at=datetime.now(timezone.utc),
                started_at=None,
                completed_at=None
            )
            
            self.workflows[workflow_id] = workflow
            self.event_queues[workflow_id] = queue.Queue()
            
        return workflow_id
    
    def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        with self.lock:
            return self.workflows.get(workflow_id)
    
    def update_workflow_status(self, workflow_id: str, status: WorkflowStatus, **kwargs):
        with self.lock:
            if workflow_id in self.workflows:
                workflow = self.workflows[workflow_id]
                workflow.status = status
                
                if 'started_at' in kwargs:
                    workflow.started_at = kwargs['started_at']
                if 'completed_at' in kwargs:
                    workflow.completed_at = kwargs['completed_at']
                if 'progress' in kwargs:
                    workflow.progress = kwargs['progress']
    
    def log_workflow_event(self, workflow_id: str, event_type: str, data: Dict[str, Any]):
        with self.lock:
            if workflow_id in self.workflows:
                event = WorkflowEvent(
                    id=str(uuid.uuid4()),
                    type=event_type,
                    data=data,
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
                
                self.workflows[workflow_id].events.append(event)
                
                # Add to event queue for streaming
                if workflow_id in self.event_queues:
                    try:
                        self.event_queues[workflow_id].put_nowait(asdict(event))
                    except queue.Full:
                        pass  # Skip if queue is full
    
    def complete_workflow(self, workflow_id: str, results: Dict[str, Any]):
        with self.lock:
            if workflow_id in self.workflows:
                workflow = self.workflows[workflow_id]
                workflow.status = WorkflowStatus.COMPLETED
                workflow.results = results
                workflow.completed_at = datetime.now(timezone.utc)
                workflow.progress = 100
    
    def get_events_for_streaming(self, workflow_id: str, timeout: float = 1.0) -> Optional[Dict]:
        if workflow_id not in self.event_queues:
            return None
            
        try:
            event = self.event_queues[workflow_id].get(timeout=timeout)
            return event
        except queue.Empty:
            return None
    
    def cleanup_workflow(self, workflow_id: str):
        with self.lock:
            if workflow_id in self.event_queues:
                del self.event_queues[workflow_id]
            # Keep workflow data for results retrieval