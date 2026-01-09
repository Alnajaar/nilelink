
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List
import uvicorn
import logging
from fraud_model import NileLinkAI
import os
import uuid
import time
from datetime import datetime
from apm import apm_service, create_apm_middleware

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

app = FastAPI(title="NileLink AI Decision Intelligence Service", version="1.0.0")

# Add APM middleware
app.add_middleware(create_apm_middleware(apm_service))

ai_system = NileLinkAI()

class TransactionData(BaseModel):
    amount: float
    currency: str = "USD"
    userId: str
    userAgeDays: int = 0
    txnHistoryCount: int = 0
    ipCountry: str = "Unknown"
    billingCountry: str = "Unknown"
    timestamp: str = None
    merchantId: str = None
    items: List[dict] = []  # Added for InventoryAgent analysis

class UserContext(BaseModel):
    role: str = "customer"  # customer, vendor, admin, investor
    environment: str = "online"  # online/offline/stable/crisis
    system_state: str = "marketplace"  # POS/Marketplace/Wallet/Delivery/etc.
    emotional_signals: List[str] = []  # stress, confusion, urgency, etc.
    urgency_level: int = 5  # 1-10 scale
    permission_level: int = 1  # 0-5 scale (Observer to Guardian)

class FeedbackRequest(BaseModel):
    request_id: str
    outcome: str # SUCCESS, FAILURE, DISPUTED
    actual_data: dict = {}
    timestamp: str = None

class AnalyzeRequest(BaseModel):
    data: TransactionData
    context: UserContext

def format_prediction_response(
    success: bool,
    result_data: dict,
    start_time: float,
    model_info: dict = None,
    warnings: list = None,
    request_id: str = None
):
    """Formats the response according to the new standardized AI contract"""
    if model_info is None:
        model_info = {
            "name": "NeuralMesh-Orchestrator",
            "version": "1.2.0",
            "type": "hybrid"
        }
    
    latency = (time.time() - start_time) * 1000
    
    # Extract prediction specific fields
    primary_result = result_data.get('decision', 'UNKNOWN')
    risk_level = result_data.get('risk_level', 'UNKNOWN')
    
    # Confidence is often an average of agent confidences or a specific model score
    confidence = 0.0
    if 'agent_insights' in result_data:
        confidences = [v.get('confidence', 0) for v in result_data['agent_insights'].values()]
        if confidences:
            confidence = sum(confidences) / len(confidences)
    elif 'score' in result_data:
        # Map 0-100 score to 0-1 confidence
        confidence = 1.0 - (result_data['score'] / 100.0)

    # Compile the final contract
    response = {
        "success": success,
        "request_id": request_id or str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": os.getenv("NODE_ENV", "development"),
        "latency_ms": round(latency, 2),
        
        "prediction": {
            "primary_result": primary_result,
            "confidence_score": round(confidence, 4),
            "explanation": f"System analyzed transaction with {risk_level} risk level."
        },
        
        "model": model_info,
        
        "safety": {
            "warnings": warnings or [],
            "fallback_applied": model_info.get("type") == "rule-based"
        },
        
        "data": result_data, # Full backward compatibility
        "inventory_signal": result_data.get('inventory_signal', 'STABLE')
    }
    
    return response

@app.get("/health")
async def health_check():
    apm_health = apm_service.health_check()
    return {
        "status": "healthy",
        "service": "ai-decision-intelligence",
        "version": "1.0.0",
        "apm": apm_health
    }

@app.get("/agents")
async def get_agents():
    """Get information about all active agents"""
    return {
        "agents": [agent.value for agent in ai_system.orchestrator.agents.keys()],
        "description": "Multi-agent decision intelligence system"
    }

@app.get("/memory/{user_role}/{system_state}")
async def get_memory(user_role: str, system_state: str):
    """Get learning memory for specific context (user-controlled)"""
    key = f"{user_role}_{system_state}"
    memory_data = ai_system.memory.get(key, [])
    return {
        "memory_entries": len(memory_data),
        "recent_patterns": memory_data[-5:] if memory_data else [],
        "learning_active": True
    }

@app.post("/memory/clear/{user_role}/{system_state}")
async def clear_memory(user_role: str, system_state: str):
    """Clear learning memory for specific context (user control)"""
    key = f"{user_role}_{system_state}"
    if key in ai_system.memory:
        del ai_system.memory[key]
        return {"status": "cleared", "message": f"Memory cleared for {key}"}
    return {"status": "not_found", "message": f"No memory found for {key}"}

@app.post("/analyze")
@apm_service.time_operation("ai.analyze_transaction")
async def analyze_transaction(request: AnalyzeRequest):
    start_time = time.time()
    try:
        logger.info(f"Received analysis request for user {request.data.userId}")

        request_id = str(uuid.uuid4())
        result = ai_system.process_request(request.data.model_dump(), request.context.model_dump(), request_id=request_id)
        
        return format_prediction_response(
            success=True, 
            result_data=result.get('data', {}), 
            start_time=start_time,
            request_id=request_id
        )
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        apm_service.record_error(e, {"endpoint": "/analyze", "user_id": request.data.userId})
        return format_prediction_response(
            success=False,
            result_data={"error": str(e), "decision": "ERROR"},
            start_time=start_time,
            model_info={"name": "NeuralMesh-Orchestrator", "version": "1.2.0", "type": "hybrid"},
            warnings=[f"Internal error: {str(e)}"]
        )

# Legacy endpoint for backward compatibility
@app.post("/predict")
async def predict_fraud(data: TransactionData):
    start_time = time.time()
    try:
        logger.info(f"Received legacy prediction request for user {data.userId}")

        # Create default context for legacy requests
        default_context = {
            "role": "customer",
            "environment": "online",
            "system_state": "marketplace",
            "emotional_signals": [],
            "urgency_level": 5,
            "permission_level": 1
        }

        request_id = data.timestamp or str(uuid.uuid4())
        result = ai_system.process_request(data.model_dump(), default_context, request_id=request_id)
        
        # Original legacy format required these specific nested fields
        legacy_data = {
            "score": 50 if result["data"]["risk_level"] == "HIGH" else 25,
            "decision": result["data"]["decision"],
            "reasons": result["data"]["concerns"]
        }

        return format_prediction_response(
            success=True,
            request_id=request_id,
            result_data=legacy_data,
            start_time=start_time,
            model_info={"name": "NeuralMesh-Legacy-Adapter", "version": "1.0.0", "type": "hybrid"}
        )
    except Exception as e:
        logger.error(f"Legacy prediction failed: {str(e)}")
        return format_prediction_response(
            success=False,
            result_data={"error": str(e), "decision": "ERROR"},
            start_time=start_time,
            warnings=[f"Legacy endpoint error: {str(e)}"]
        )

@app.post("/analyze/behavior")
async def analyze_behavior(request: Request):
    """Analyze user behavior patterns for loyalty and gamification"""
    try:
        body = await request.json()
        user_id = body.get("userId")
        factors = body.get("factors", {})
        
        # Create default context
        context = ContextData(
            user_role="customer",
            environment="online",
            system_state="loyalty",
            emotional_signals=[],
            urgency_level=5
        )
        
        # Use BehaviorAgent directly for specialized analysis
        behavior_agent = ai_system.orchestrator.agents[AgentRole.BEHAVIOR]
        analysis = behavior_agent.analyze(context, {"factors": factors})
        
        # Derive cluster score and segment from agent response
        score = analysis.confidence if not analysis.concerns else 0.3
        segment = "POWER_USER" if "POWER_USER" in str(analysis.insights) else "STANDARD"
        if "CHURN_RISK" in str(analysis.concerns):
            segment = "CHURN_RISK"

        return {
            "success": True,
            "userId": user_id,
            "behaviorClusterScore": round(score, 4),
            "segment": segment,
            "recommendation": analysis.recommendation
        }
    except Exception as e:
        logger.error(f"Behavior analysis failed: {str(e)}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
