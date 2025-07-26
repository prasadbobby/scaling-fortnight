#!/usr/bin/env python3
import requests
import json
import time

def test_simple_workflow():
    base_url = "http://localhost:8080"
    
    print("🔍 Testing Simple Workflow...")
    
    # Test simple workflow
    try:
        response = requests.post(
            f"{base_url}/api/agentic/test-simple-workflow",
            json={"teacher_id": "test_teacher"},
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Simple workflow: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Simple workflow started: {data}")
            
            workflow_id = data['workflow_id']
            
            # Monitor workflow
            for i in range(10):
                time.sleep(1)
                status_response = requests.get(f"{base_url}/api/agentic/workflow-status/{workflow_id}")
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    print(f"Status: {status_data['workflow']['status']}")
                    if status_data['workflow']['status'] in ['completed', 'error']:
                        break
                        
        else:
            print(f"❌ Simple workflow failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Simple workflow error: {e}")

if __name__ == "__main__":
    test_simple_workflow()