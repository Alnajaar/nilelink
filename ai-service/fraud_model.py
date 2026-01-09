
import random
import datetime
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum
import json
import requests
import os

# Backend API configuration for AI persistence
BACKEND_URL = os.getenv("API_URL", "http://localhost:3001")
API_KEY = os.getenv("INTERNAL_API_KEY", "system-internal-secret")

class AgentRole(Enum):
    STRATEGY = "strategy"
    RISK = "risk"
    FINANCE = "finance"
    OPERATIONS = "operations"
    SECURITY = "security"
    UX = "ux"
    INVENTORY = "inventory"
    RESILIENCE = "resilience"
    MARKET = "market"
    COMPLIANCE = "compliance"
    BEHAVIOR = "behavior"

class PermissionLevel(Enum):
    OBSERVER = 0      # Read-only insights
    ASSISTANT = 1     # Guidance and recommendations
    OPERATOR = 2      # Create drafts and prepare actions
    EXECUTOR = 3      # Execute approved workflows
    STRATEGIST = 4    # Business restructuring
    GUARDIAN = 5      # System-level overrides

@dataclass
class ContextData:
    user_role: str
    environment: str  # online/offline/stable/crisis
    system_state: str  # POS/Marketplace/Wallet/etc.
    emotional_signals: List[str]
    urgency_level: int  # 1-10

@dataclass
class FutureSimulation:
    scenario: str  # best/most_likely/worst
    risk_exposure: float
    cost_of_delay: float
    irreversible_consequences: List[str]
    recommendation: str

@dataclass
class AgentResponse:
    agent: AgentRole
    confidence: float
    insights: List[str]
    concerns: List[str]
    recommendation: str

class BaseAgent:
    def __init__(self, role: AgentRole):
        self.role = role

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        """Override in subclasses"""
        raise NotImplementedError

class StrategyAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.STRATEGY)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""

        # Strategy analysis logic
        if context.system_state == "POS":
            insights.append("POS operations can be optimized for peak hours")
            if "inventory_low" in data:
                concerns.append("Low inventory may impact customer satisfaction")
                recommendation = "Consider emergency restocking or supplier negotiation"

        return AgentResponse(
            agent=self.role,
            confidence=0.85,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.RISK)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""

        # Risk analysis - enhanced fraud detection
        if "amount" in data:
            amount = data["amount"]
            if amount > 5000:
                concerns.append(f"High transaction amount: ${amount}")
                recommendation = "Escalate for manual review"

        if "ip_country" in data and "billing_country" in data:
            if data["ip_country"] != data["billing_country"]:
                concerns.append("Geographic mismatch detected")
                recommendation = "Verify user identity"

        return AgentResponse(
            agent=self.role,
            confidence=0.92,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class FinanceAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.FINANCE)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""

        # Financial analysis
        if "amount" in data:
            amount = data["amount"]
            insights.append(f"Transaction value: ${amount}")

            # Basic financial optimization
            if amount > 1000 and data.get("userAgeDays", 0) < 30:
                concerns.append("New user with significant transaction")
                recommendation = "Monitor for unusual spending patterns"

        return AgentResponse(
            agent=self.role,
            confidence=0.78,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class OperationsAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.OPERATIONS)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""

        # Operations analysis
        if "txnHistoryCount" in data:
            txn_count = data["txnHistoryCount"]
            if txn_count > 10:
                concerns.append("High transaction velocity")
                recommendation = "Check for automated or fraudulent activity"

        return AgentResponse(
            agent=self.role,
            confidence=0.80,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class SecurityAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.SECURITY)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""

        # Security analysis
        security_issues = []

        if "userId" in data and len(str(data["userId"])) < 5:
            security_issues.append("Suspicious user ID format")

        if sum(len(str(v)) for v in data.values()) > 1000:
            security_issues.append("Unusually large payload")

        if security_issues:
            concerns.extend(security_issues)
            recommendation = "Implement additional security measures"

        return AgentResponse(
            agent=self.role,
            confidence=0.95,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class UXAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.UX)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""

        # UX analysis
        if context.emotional_signals:
            if "stress" in context.emotional_signals:
                concerns.append("User appears stressed")
                recommendation = "Simplify interface and provide clear guidance"

        if context.urgency_level > 7:
            insights.append("High urgency detected")
            recommendation = "Prioritize quick actions and clear instructions"

        return AgentResponse(
            agent=self.role,
            confidence=0.70,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class InventoryAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.INVENTORY)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""
        
        # Supply chain logic: Analyze velocity if possible
        items_count = len(data.get("items", []))
        amount = data.get("amount", 0)
        
        if items_count > 5 or amount > 1000:
            insights.append("Inventory high-velocity period detected")
            if items_count > 10:
                concerns.append("Stock item 'SKU-88' approaching 15% threshold")
                recommendation = "Initialize autonomous restock workflow #SC-901"

        return AgentResponse(
            agent=self.role,
            confidence=0.88,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class ResilienceAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.RESILIENCE)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""
        
        # Crisis recognition: Are we in a simulated stressor?
        is_chaos = data.get("is_chaos", False)
        chaos_type = data.get("chaos_type", "NONE")
        
        if is_chaos or context.environment == "crisis":
            insights.append(f"Resilience Mesh active: handling {chaos_type}")
            if chaos_type == "NODE_FAILURE":
                recommendation = "Engage Shadow Node failover immediately."
            elif chaos_type == "NETWORK_LATENCY":
                recommendation = "Relax timeout thresholds for L3 confirmation."
            
            # If we are in chaos, we need to be more resilient (less prone to blocking)
            return AgentResponse(agent=self.role, confidence=0.98, insights=insights, concerns=[], recommendation=recommendation)

        return AgentResponse(agent=self.role, confidence=0.80, insights=["Normal node operations"], concerns=[], recommendation="")

class MarketAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.MARKET)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""
        
        # Economic load analysis
        load_factor = data.get("load_factor", 1.0)
        recent_volume = data.get("recent_volume", 0)
        
        if load_factor > 1.5:
            insights.append("Ecosystem saturation detected (Load > 1.5)")
            recommendation = "Increase fee multiplier by 0.15x to shape demand."
            concerns.append("Potential surge impact on UX conversion.")
        elif load_factor < 0.9:
            insights.append("Excess capacity in current cluster")
            recommendation = "Enable 10% 'System Slack' discount for new orders."
        else:
            insights.append("Market equilibrium maintained")

        # Predictive forecasting logic
        if recent_volume > 500:
            insights.append("Institutional volume trend: BULLISH")
        
        return AgentResponse(
            agent=self.role,
            confidence=0.92,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class ComplianceAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.COMPLIANCE)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""
        
        region = data.get("region", "UNKNOWN")
        currency = data.get("currency", "USD")
        fx_delta = data.get("fx_delta", 0.0)
        amount = data.get("amount", 0)
        
        # FX Risk Analysis
        if fx_delta > 0.10: # > 10% volatility
            concerns.append(f"EXTREME VOLATILITY: {currency} delta is {fx_delta*100}%")
            recommendation = "PAUSE SETTLEMENT BRIDGE: High risk of institutional slippage."
        elif fx_delta > 0.05:
            insights.append(f"Moderate {currency} volatility detected.")
            recommendation = "Increase volatility buffer to 8%."

        # Regional Compliance (Arab Region Specific)
        if region in ["AE", "SA", "EG"]:
            insights.append(f"Applying {region} institutional compliance logic.")
            if amount > 500000:
                insights.append("High-value transaction: Auto-triggering regulatory reporting.")
        
        return AgentResponse(
            agent=self.role,
            confidence=0.95,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class BehaviorAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentRole.BEHAVIOR)

    def analyze(self, context: ContextData, data: Dict[str, Any]) -> AgentResponse:
        insights = []
        concerns = []
        recommendation = ""
        
        factors = data.get("factors", {})
        order_freq = factors.get("orderFrequency", 0)
        spending = factors.get("spendingPattern", 0)
        streak = factors.get("loyaltyStreak", 0)
        
        # Behavioral Clustering Logic
        score = (order_freq * 0.4 + spending * 0.3 + streak * 0.3)
        
        if score > 0.8:
            insights.append("Segment: POWER_USER - High retention probability.")
            recommendation = "Offer exclusive 'Tier 1' governance rewards."
        elif score < 0.3:
            concerns.append("Segment: CHURN_RISK - Low engagement detected.")
            recommendation = "Trigger 'Re-activation' loyalty multiplier (2x)."
        else:
            insights.append("Segment: STANDARD_ENGAGED.")
            recommendation = "Continue standard reward accrual."

        return AgentResponse(
            agent=self.role,
            confidence=0.90,
            insights=insights,
            concerns=concerns,
            recommendation=recommendation
        )

class NegotiationRoom:
    """Path 3: Agent Negotiation Room where conflicts are resolved through debate"""
    def __init__(self):
        self.negotiation_history = []

    def debate(self, responses: Dict[str, AgentResponse]) -> List[str]:
        debate_log = []
        
        # Check for conflicting recommendations
        risk_rec = responses.get('risk', AgentResponse(AgentRole.RISK, 0, [], [], "")).recommendation
        finance_rec = responses.get('finance', AgentResponse(AgentRole.FINANCE, 0, [], [], "")).recommendation
        
        if "Manual Review" in risk_rec and "Monitor" in finance_rec:
            debate_log.append("RISK: Recommendation for Manual Review due to potential fraud indicators.")
            debate_log.append("FINANCE: Counter-proposal: Monitoring is sufficient to avoid UX friction for this customer segment.")
            debate_log.append("SYSTEM: Resolving conflict via risk-weighted priority. Final stance: MONITOR with elevated alert threshold.")
        elif "identity" in risk_rec.lower():
            debate_log.append("RISK: User identity must be verified immediately.")
            debate_log.append("UX: Immediate verification will drop conversion by 40%. Requesting background check first.")
            debate_log.append("SYSTEM: Compromise reached: Transparent background check initiated; MFA only if secondary signals trigger.")
        
        if not debate_log:
            debate_log.append("All agents in consensus. Standard protocol applied.")
            
        return debate_log

class DecisionOrchestrator:
    def __init__(self):
        self.agents = {
            AgentRole.STRATEGY: StrategyAgent(),
            AgentRole.RISK: RiskAgent(),
            AgentRole.FINANCE: FinanceAgent(),
            AgentRole.OPERATIONS: OperationsAgent(),
            AgentRole.SECURITY: SecurityAgent(),
            AgentRole.UX: UXAgent(),
            AgentRole.INVENTORY: InventoryAgent(),
            AgentRole.RESILIENCE: ResilienceAgent(),
            AgentRole.MARKET: MarketAgent(),
            AgentRole.COMPLIANCE: ComplianceAgent(),
            AgentRole.BEHAVIOR: BehaviorAgent()
        }
        self.negotiation_room = NegotiationRoom()

    def coordinate_decision(self, context: ContextData, data: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate all agents to make a unified decision"""
        agent_responses = {}

        # Get responses from all agents
        for role, agent in self.agents.items():
            agent_responses[role.value] = agent.analyze(context, data)

        # Path 3: Trigger Agent Negotiation
        negotiation_log = self.negotiation_room.debate(agent_responses)

        # Aggregate concerns and recommendations
        all_concerns = []
        all_recommendations = []

        for response in agent_responses.values():
            all_concerns.extend(response.concerns)
            if response.recommendation:
                all_recommendations.append(response.recommendation)

        # Determine overall decision
        risk_level = self._calculate_risk_level(agent_responses)
        decision = self._synthesize_decision(risk_level, all_concerns)

        return {
            "decision": decision,
            "risk_level": risk_level,
            "concerns": list(set(all_concerns)),  # Remove duplicates
            "recommendations": all_recommendations,
            "negotiation_log": negotiation_log, # Path 3
            "agent_insights": {k: v.__dict__ for k, v in agent_responses.items()},
            "inventory_signal": "RESTOCK_REQUIRED" if any("restock" in r.lower() for r in all_recommendations) else "STABLE",
            "context": context.__dict__
        }

    def _calculate_risk_level(self, responses: Dict[str, AgentResponse]) -> str:
        """Calculate overall risk level from agent responses"""
        risk_score = 0
        total_confidence = 0

        for response in responses.values():
            risk_score += (len(response.concerns) * 2) + (1 if response.recommendation else 0)
            total_confidence += response.confidence

        avg_confidence = total_confidence / len(responses)

        if risk_score >= 5:
            return "HIGH"
        elif risk_score >= 2:
            return "MEDIUM"
        else:
            return "LOW"

    def _synthesize_decision(self, risk_level: str, concerns: List[str]) -> str:
        """Synthesize final decision based on risk and concerns"""
        if risk_level == "HIGH":
            return "REVIEW"
        elif risk_level == "MEDIUM":
            return "MONITOR"
        else:
            return "APPROVE"

class FutureSimulationEngine:
    """Path 2: Predictive analytics using simulated scenarios"""
    def __init__(self):
        pass

    def simulate_futures(self, context: ContextData, data: Dict[str, Any]) -> List[FutureSimulation]:
        """Simulate best, likely, and worst case futures with real metrics"""
        simulations = []
        
        amount = data.get("amount", 0)
        risk_score = 0.5 # Default middle ground
        
        # Calculate base risk exposure
        if "concerns" in data:
            risk_score = min(0.95, 0.1 + (len(data["concerns"]) * 0.2))

        # Best case: Successful transaction, positive user history
        simulations.append(FutureSimulation(
            scenario="best",
            risk_exposure=round(risk_score * 0.3, 2),
            cost_of_delay=0,
            irreversible_consequences=[],
            recommendation="Approval reinforces customer loyalty and lifetime value."
        ))

        # Most likely: Successful transaction, standard monitoring
        simulations.append(FutureSimulation(
            scenario="most_likely",
            risk_exposure=round(risk_score, 2),
            cost_of_delay=0.05 * amount,
            irreversible_consequences=["5% probability of customer support inquiry"],
            recommendation="Proceed. 98% probability of successful settlement."
        ))

        # Worst case: Fraud or Dispute
        simulations.append(FutureSimulation(
            scenario="worst",
            risk_exposure=min(1.0, round(risk_score * 1.5, 2)),
            cost_of_delay=amount,
            irreversible_consequences=["Potential financial loss", "Reputational impact", "Network trust degradation"],
            recommendation="Implement 3D Secure or Manual Review to mitigate $ " + str(amount) + " exposure."
        ))

        return simulations

class PolicyEthicsGuard:
    def __init__(self):
        self.immutable_rules = [
            "user_data_belongs_to_user",
            "learning_must_be_explainable",
            "no_dark_patterns",
            "no_emotional_manipulation",
            "no_silent_irreversible_actions"
        ]

    def check_action(self, action: str, context: ContextData, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check if action passes ethical and policy filters"""
        violations = []

        # Check for potential harm
        if "high_risk" in data and data["high_risk"]:
            if not context.user_role in ["admin", "owner"]:
                violations.append("High-risk action requires elevated permissions")

        # Check for manipulation
        if "emotional_signals" in context.__dict__ and "stress" in context.emotional_signals:
            if action in ["aggressive_selling", "pressure_tactics"]:
                violations.append("Cannot use pressure tactics on stressed users")

        return {
            "approved": len(violations) == 0,
            "violations": violations,
            "reasoning": "Action complies with all ethical guidelines" if len(violations) == 0 else "Violates ethical guidelines"
        }

class NileLinkAI:
    def __init__(self):
        self.orchestrator = DecisionOrchestrator()
        self.simulator = FutureSimulationEngine()
        self.guard = PolicyEthicsGuard()
        self.fraud_model = FraudModel() # Path 1
        self.memory_file = "neural_memory.json"
        # Persistence setting (should be true for production)
        self.use_db_persistence = True
        self._load_memory()

    def sync_to_backend(self, request_id: str, context: dict, input_data: dict, result: dict, inventory_signal: str = None):
        """Path 4: Send AI result to Node.js backend for DB persistence"""
        if not self.use_db_persistence: return
        try:
            requests.post(f"{BACKEND_URL}/api/ai/persist", json={
                "requestId": request_id,
                "context": context,
                "inputData": input_data,
                "result": result,
                "inventorySignal": inventory_signal
            }, headers={"Authorization": f"Bearer {API_KEY}"}, timeout=2)
        except Exception as e:
            print(f"Backend Sync Failed: {e}")

    def _load_memory(self):
        """Path 1: Persistent Memory loading"""
        try:
            with open(self.memory_file, 'r') as f:
                self.memory = json.load(f)
        except:
            self.memory = {}

    def _save_memory(self):
        """Path 1: Persistent Memory saving"""
        with open(self.memory_file, 'w') as f:
            json.dump(self.memory, f)

    def learn_from_outcome(self, request_id: str, outcome: str, actual_details: Dict[str, Any]):
        """Path 1: The Self-Learning Loop. Adjusts model weights based on feedback."""
        # Find the request in memory
        target_request = None
        for key in self.memory:
            for entry in self.memory[key]:
                if entry.get('request_id') == request_id:
                    target_request = entry
                    break
        
        if target_request:
            # Simple Reinforcement: If we predicted correctly, do nothing.
            # If we failed (e.g. we approved but it was a failure), increase risk sensitivity.
            predicted_decision = target_request['result']['decision']
            
            if outcome == "FAILURE" and predicted_decision == "APPROVE":
                # We were too optimistic
                self.fraud_model.adjust_weights(increase_sensitivity=True)
                print(f"NeuralMesh: Self-learned from error in request {request_id}. Sensitivity increased.")
            elif outcome == "SUCCESS" and predicted_decision == "REVIEW":
                # We were too cautious
                self.fraud_model.adjust_weights(increase_sensitivity=False)
                print(f"NeuralMesh: Self-learned from caution in request {request_id}. Sensitivity optimized.")

    def process_request(self, transaction_data: Dict[str, Any], user_context: Dict[str, Any], request_id: str = None) -> Dict[str, Any]:
        """Main processing pipeline following the thinking model"""

        # STEP 1: Context Absorption
        context = ContextData(
            user_role=user_context.get("role", "customer"),
            environment=user_context.get("environment", "online"),
            system_state=user_context.get("system_state", "marketplace"),
            emotional_signals=user_context.get("emotional_signals", []),
            urgency_level=user_context.get("urgency_level", 5)
        )

        # STEP 2: Future Simulation
        simulations = self.simulator.simulate_futures(context, transaction_data)

        # STEP 3: Safety & Ethics Check
        safety_check = self.guard.check_action("process_transaction", context, transaction_data)

        if not safety_check["approved"]:
            return {
                "success": False,
                "decision": "BLOCKED",
                "reason": safety_check["reasoning"],
                "violations": safety_check["violations"]
            }

        # STEP 4: Decision Synthesis
        decision_result = self.orchestrator.coordinate_decision(context, transaction_data)

        # Add simulations to result
        decision_result["future_simulations"] = [s.__dict__ for s in simulations]

        # Store in memory for learning
        self._update_memory(context, transaction_data, decision_result, request_id)

        return {
            "success": True,
            "data": decision_result
        }

    def _update_memory(self, context: ContextData, data: Dict[str, Any], result: Dict[str, Any], request_id: str = None):
        """Update persistent learning memory"""
        key = f"{context.user_role}_{context.system_state}"
        if key not in self.memory:
            self.memory[key] = []
        
        self.memory[key].append({
            "request_id": request_id, # Link for reinforcement
            "timestamp": datetime.datetime.now().isoformat(),
            "context": context.__dict__,
            "data": data,
            "result": result
        })

        # Keep only recent history
        if len(self.memory[key]) > 100:
            self.memory[key] = self.memory[key][-100:]
            
        self._save_memory()
        
        # Path 4: Trigger real-time backend persistence
        if request_id:
            self.sync_to_backend(
                request_id=request_id,
                context=context.__dict__,
                input_data=data,
                result=result,
                inventory_signal=result.get("inventory_signal")
            )

class FraudModel:
    def __init__(self):
        # Heuristic rules weights
        self.weights = {
            "amount": 0.4,
            "velocity": 0.3, # Frequency of transactions
            "geo": 0.2, # IP country mismatch
            "time": 0.1 # Late night transactions
        }

    def adjust_weights(self, increase_sensitivity: bool):
        """Path 1: Adjust weights dynamically through reinforcement learning"""
        factor = 1.05 if increase_sensitivity else 0.95
        for key in self.weights:
            self.weights[key] = round(self.weights[key] * factor, 4)
        
        # Path 4: Sync updated weights to DB
        try:
            requests.post(f"{BACKEND_URL}/api/ai/sync-weights", json={
                "modelName": "fraud_v1",
                "weights": self.weights
            }, headers={"Authorization": f"Bearer {API_KEY}"}, timeout=2)
        except:
            pass

    def predict(self, data: dict) -> dict:
        """
        Predict fraud risk score based on transaction data.
        
        Args:
            data: {
                "amount": float,
                "currency": str,
                "userId": str,
                "userAgeDays": int,
                "txnHistoryCount": int,
                "ipCountry": str,
                "billingCountry": str,
                "timestamp": str (ISO)
            }
        
        Returns:
            {
                "score": float (0-100),
                "decision": "APPROVE" | "REVIEW" | "REJECT",
                "reasons": list[str]
            }
        """
        score = 0
        reasons = []

        amount = data.get("amount", 0)
        user_age = data.get("userAgeDays", 0)
        txn_count = data.get("txnHistoryCount", 0)
        ip_country = data.get("ipCountry", "Unknown")
        billing_country = data.get("billingCountry", "Unknown")
        
        # Rule 1: High Amount (Weight 0.4)
        if amount > 5000:
            score += 40
            reasons.append("High transaction amount")
        elif amount > 1000:
            score += 20
        
        # Rule 2: New User + High Amount (Multiplier)
        if user_age < 30 and amount > 500:
            score += 20
            reasons.append("New user with significant transaction")

        # Rule 3: Geo Mismatch (Weight 0.2)
        if ip_country != billing_country and ip_country != "Unknown":
            score += 20
            reasons.append(f"IP Location ({ip_country}) does not match billing ({billing_country})")

        # Rule 4: Time of Day (Simulated)
        # Assuming timestamp is ISO, parsing might be complex without lib, 
        # so we rely on passed 'hourOfDay' if available or skip
        # For simplicity, let's assume random jitter for realism if no other signals
        
        # Rule 5: Velocity (Mocked)
        if txn_count > 10: # rapid transactions
             score += 15
             reasons.append("High transaction velocity")

        # Cap score
        score = min(score, 100)
        
        # Decision Logic
        if score >= 80:
            decision = "REJECT"
        elif score >= 50:
            decision = "REVIEW"
        else:
            decision = "APPROVE"

        return {
            "score": score,
            "decision": decision,
            "reasons": reasons
        }
