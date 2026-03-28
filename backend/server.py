from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os, logging, uuid, json, bcrypt, jwt as pyjwt
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import List, Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Config ───
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ─── Password Hashing ───
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ─── Auth Dependency ───
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─── Pydantic Models ───
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "user"

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    token: Optional[str] = None

class CaseCreate(BaseModel):
    title: str
    description: str
    category: str = "general"

class CaseResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    status: str
    risk_level: str
    success_probability: int
    assigned_lawyer: str
    case_number: str
    category: str
    created_at: str
    timeline: List[dict]
    progress_percentage: int

class LawyerResponse(BaseModel):
    id: str
    name: str
    specialty: List[str]
    tier: int
    experience_years: int
    rating: float
    cases_won: int
    total_cases: int
    location: str
    avatar_url: str
    consultation_fee: int
    verified: bool
    availability: str
    bio: str

class AnalyzeRequest(BaseModel):
    text: str
    case_id: Optional[str] = None

class AnalyzeResponse(BaseModel):
    summary: str
    warnings: List[str]
    actions: List[str]
    risk_level: str
    success_probability: int
    strategies: List[dict]
    applicable_laws: List[str]
    risk_factors: List[dict]
    outcome_predictions: List[dict]
    timeline_estimate: str

class MessageCreate(BaseModel):
    case_id: str
    sender: str
    text: str

class MessageResponse(BaseModel):
    id: str
    case_id: str
    sender: str
    text: str
    timestamp: str

class DocumentResponse(BaseModel):
    id: str
    case_id: str
    title: str
    file_type: str
    file_size: str
    uploaded_at: str
    status: str

class CommunityPostCreate(BaseModel):
    title: str
    category: str
    content: str

class CommunityReplyCreate(BaseModel):
    content: str
    is_lawyer: bool = False

class EvidenceAnalyzeRequest(BaseModel):
    text: str
    evidence_type: str = "document"

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    read: bool
    created_at: str

# ─── AI Service ───
async def generate_ai_response(text: str) -> dict:
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"legal-analysis-{uuid.uuid4()}",
            system_message="""You are JurisAI, an expert Indian legal assistant. Analyze the user's legal issue based on Indian law (IPC, CrPC, CPC, Indian Constitution, specific Acts).

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "summary": "A clear 2-3 sentence summary of the legal situation",
  "warnings": ["Warning 1", "Warning 2"],
  "actions": ["Recommended action 1", "Recommended action 2"],
  "risk_level": "LOW|MEDIUM|HIGH",
  "success_probability": 75,
  "strategies": [
    {"option": "A", "title": "Strategy A", "description": "...", "pros": ["Pro 1"], "cons": ["Con 1"], "steps": ["Step 1"]},
    {"option": "B", "title": "Strategy B", "description": "...", "pros": ["Pro 1"], "cons": ["Con 1"], "steps": ["Step 1"]}
  ],
  "applicable_laws": ["IPC Section 420", "Consumer Protection Act 2019"],
  "risk_factors": [
    {"factor": "Factor name", "impact": "HIGH", "score": 0.78, "description": "Details"}
  ],
  "outcome_predictions": [
    {"outcome": "Settlement", "probability": 70, "description": "Most likely resolution"},
    {"outcome": "Court Order", "probability": 30, "description": "If settlement fails"}
  ],
  "timeline_estimate": "2-6 months"
}

Respond with ONLY the JSON object, no markdown, no code blocks."""
        )
        chat.with_model("openai", "gpt-4o")
        user_message = UserMessage(text=f"Analyze this legal issue under Indian law:\n\n{text}")
        response = await chat.send_message(user_message)

        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
        return json.loads(cleaned)
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return {
            "summary": "Unable to complete AI analysis. Please try again.",
            "warnings": ["AI service temporarily unavailable"],
            "actions": ["Retry analysis", "Consult a legal professional"],
            "risk_level": "MEDIUM",
            "success_probability": 50,
            "strategies": [{"option": "A", "title": "Direct Consultation", "description": "Consult with a lawyer", "pros": ["Expert opinion"], "cons": ["Additional cost"], "steps": ["Find lawyer"]}],
            "applicable_laws": ["Consult a professional for applicable laws"],
            "risk_factors": [{"factor": "Incomplete analysis", "impact": "MEDIUM", "score": 0.5, "description": "AI could not fully analyze"}],
            "outcome_predictions": [{"outcome": "Requires professional review", "probability": 100, "description": "Manual review needed"}],
            "timeline_estimate": "Depends on case complexity"
        }

async def analyze_evidence_ai(text: str) -> dict:
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"evidence-{uuid.uuid4()}",
            system_message="""You are JurisAI evidence analyst. Analyze the evidence text and return ONLY valid JSON:
{
  "summary": "Evidence analysis summary",
  "insights": ["Insight 1", "Insight 2"],
  "fraud_flags": ["Flag 1"],
  "legal_signals": ["IPC 420 - Fraud", "Admissible under Indian Evidence Act"],
  "strength_score": 75,
  "recommendation": "How to use this evidence"
}"""
        )
        chat.with_model("openai", "gpt-4o")
        response = await chat.send_message(UserMessage(text=f"Analyze this evidence:\n\n{text}"))
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
        return json.loads(cleaned.strip())
    except Exception as e:
        logger.error(f"Evidence analysis error: {e}")
        return {"summary": "Analysis unavailable", "insights": [], "fraud_flags": [], "legal_signals": [], "strength_score": 50, "recommendation": "Please retry"}

# ─── Seed Data ───
async def seed_database():
    # Seed admin user
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@jurisai.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "name": "Admin", "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Seeded admin user")

    # Seed test user
    test_email = "arjun@test.com"
    existing_test = await db.users.find_one({"email": test_email})
    test_user_id = None
    if not existing_test:
        result = await db.users.insert_one({
            "name": "Arjun Sharma", "email": test_email,
            "password_hash": hash_password("test123"),
            "role": "user", "phone": "+91 98765 43210",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        test_user_id = str(result.inserted_id)
        logger.info("Seeded test user")
    else:
        test_user_id = str(existing_test["_id"])

    # Seed lawyers
    lawyers_count = await db.lawyers.count_documents({})
    if lawyers_count == 0:
        lawyers = [
            {
                "id": str(uuid.uuid4()), "name": "Adv. Priya Sharma",
                "specialty": ["Criminal Law", "Cyber Crime"],
                "tier": 1, "experience_years": 15, "rating": 4.9,
                "cases_won": 312, "total_cases": 350, "location": "New Delhi",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
                "consultation_fee": 3000, "verified": True, "availability": "Available Today",
                "bio": "Senior criminal lawyer with 15+ years specializing in cyber crime, white-collar fraud, and criminal defense in High Court and Supreme Court of India."
            },
            {
                "id": str(uuid.uuid4()), "name": "Adv. Rajesh Kumar",
                "specialty": ["Property Law", "Real Estate"],
                "tier": 1, "experience_years": 22, "rating": 4.8,
                "cases_won": 480, "total_cases": 520, "location": "Mumbai",
                "avatar_url": "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200",
                "consultation_fee": 5000, "verified": True, "availability": "Next Available: Tomorrow",
                "bio": "Leading property law expert in Mumbai with expertise in ancestral property disputes, land acquisition, and RERA compliance."
            },
            {
                "id": str(uuid.uuid4()), "name": "Adv. Meera Patel",
                "specialty": ["Family Law", "Divorce", "Child Custody"],
                "tier": 1, "experience_years": 12, "rating": 4.7,
                "cases_won": 195, "total_cases": 230, "location": "Bangalore",
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
                "consultation_fee": 2500, "verified": True, "availability": "Available Today",
                "bio": "Compassionate family law attorney specializing in divorce, child custody, and domestic violence cases across Karnataka."
            },
            {
                "id": str(uuid.uuid4()), "name": "Adv. Arjun Reddy",
                "specialty": ["Corporate Law", "Startup Law"],
                "tier": 2, "experience_years": 8, "rating": 4.5,
                "cases_won": 120, "total_cases": 145, "location": "Hyderabad",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
                "consultation_fee": 2000, "verified": True, "availability": "Available This Week",
                "bio": "Corporate law specialist advising startups and SMEs on compliance, contracts, and intellectual property in the Hyderabad tech ecosystem."
            },
            {
                "id": str(uuid.uuid4()), "name": "Adv. Sneha Iyer",
                "specialty": ["Consumer Rights", "Product Liability"],
                "tier": 2, "experience_years": 10, "rating": 4.6,
                "cases_won": 165, "total_cases": 190, "location": "Chennai",
                "avatar_url": "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200",
                "consultation_fee": 2000, "verified": True, "availability": "Available Today",
                "bio": "Dedicated consumer rights advocate with track record of winning product liability and service deficiency cases under Consumer Protection Act."
            }
        ]
        await db.lawyers.insert_many(lawyers)
        logger.info("Seeded 5 lawyers")

    # Seed cases
    cases_count = await db.cases.count_documents({})
    if cases_count == 0:
        cases = [
            {
                "id": str(uuid.uuid4()), "user_id": test_user_id,
                "title": "Property Dispute Resolution", "category": "Property",
                "description": "Ancestral property partition dispute involving multiple family members in South Delhi",
                "status": "Active", "risk_level": "MEDIUM", "success_probability": 72,
                "assigned_lawyer": "Adv. Rajesh Kumar", "case_number": "MN-23109",
                "progress_percentage": 40,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "timeline": [
                    {"step": "Case Filed", "status": "completed", "date": "Oct 15, 2025"},
                    {"step": "Documents Received", "status": "completed", "date": "Nov 12, 2025"},
                    {"step": "Case Under Legal Review", "status": "in_progress", "date": "Dec 01, 2025"},
                    {"step": "Mediation Scheduled", "status": "pending", "date": ""},
                    {"step": "Decision: Accepted / Declined", "status": "pending", "date": ""}
                ]
            },
            {
                "id": str(uuid.uuid4()), "user_id": test_user_id,
                "title": "Consumer Complaint - Defective Product", "category": "Consumer",
                "description": "Filing complaint against electronics manufacturer for defective laptop",
                "status": "Review", "risk_level": "LOW", "success_probability": 88,
                "assigned_lawyer": "Adv. Sneha Iyer", "case_number": "CC-45201",
                "progress_percentage": 65,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "timeline": [
                    {"step": "Complaint Drafted", "status": "completed", "date": "Dec 01, 2025"},
                    {"step": "Notice Sent", "status": "completed", "date": "Dec 15, 2025"},
                    {"step": "Awaiting Response", "status": "in_progress", "date": "Jan 10, 2026"},
                    {"step": "Hearing Date", "status": "pending", "date": ""}
                ]
            },
            {
                "id": str(uuid.uuid4()), "user_id": test_user_id,
                "title": "Cyber Fraud Investigation", "category": "Criminal",
                "description": "Online banking fraud resulting in unauthorized transactions worth Rs 5 lakhs",
                "status": "Pending", "risk_level": "HIGH", "success_probability": 55,
                "assigned_lawyer": "Adv. Priya Sharma", "case_number": "CF-78432",
                "progress_percentage": 20,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "timeline": [
                    {"step": "FIR Filed", "status": "completed", "date": "Feb 20, 2026"},
                    {"step": "Evidence Collection", "status": "in_progress", "date": "Mar 01, 2026"},
                    {"step": "Cyber Cell Investigation", "status": "pending", "date": ""},
                    {"step": "Charge Sheet Filed", "status": "pending", "date": ""},
                    {"step": "Court Hearing", "status": "pending", "date": ""}
                ]
            }
        ]
        await db.cases.insert_many(cases)
        logger.info("Seeded 3 cases")

    # Seed documents
    docs_count = await db.documents.count_documents({})
    if docs_count == 0:
        documents = [
            {"id": str(uuid.uuid4()), "case_id": "all", "title": "Medical Report", "file_type": "PDF", "file_size": "2.4 MB", "uploaded_at": "Jan 16, 2025", "status": "verified"},
            {"id": str(uuid.uuid4()), "case_id": "all", "title": "Hospital Discharge Summary", "file_type": "PDF", "file_size": "1.8 MB", "uploaded_at": "Jan 15, 2025", "status": "verified"},
            {"id": str(uuid.uuid4()), "case_id": "all", "title": "Property Documents", "file_type": "PDF", "file_size": "5.2 MB", "uploaded_at": "Jan 14, 2025", "status": "pending"},
            {"id": str(uuid.uuid4()), "case_id": "all", "title": "Identity Documents", "file_type": "PDF", "file_size": "1.1 MB", "uploaded_at": "Jan 12, 2025", "status": "verified"},
            {"id": str(uuid.uuid4()), "case_id": "all", "title": "Bank Statements", "file_type": "PDF", "file_size": "3.6 MB", "uploaded_at": "Jan 10, 2025", "status": "verified"},
        ]
        await db.documents.insert_many(documents)
        logger.info("Seeded documents")

    # Seed messages
    msgs_count = await db.messages.count_documents({})
    if msgs_count == 0:
        messages = [
            {"id": str(uuid.uuid4()), "case_id": "general", "sender": "system", "text": "Welcome to JurisAI! Your legal assistant is ready to help.", "timestamp": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "case_id": "general", "sender": "system", "text": "Reminder: Please upload your ID to proceed.", "timestamp": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "case_id": "general", "sender": "lawyer", "text": "We've received your medical report, thank you!", "timestamp": datetime.now(timezone.utc).isoformat()},
        ]
        await db.messages.insert_many(messages)

    # Seed community posts
    posts_count = await db.community_posts.count_documents({})
    if posts_count == 0:
        posts = [
            {
                "id": str(uuid.uuid4()), "user_id": test_user_id, "user_name": "Arjun Sharma",
                "title": "Tenant not vacating after lease expiry - What are my options?",
                "category": "Property", "content": "My tenant's lease expired 3 months ago but they refuse to vacate the premises. I've sent multiple notices. What legal remedies do I have under Indian law?",
                "replies": [
                    {"id": str(uuid.uuid4()), "user_name": "Adv. Rajesh Kumar", "content": "You can file an eviction suit under the Rent Control Act applicable in your state. Additionally, you should send a legal notice through a registered advocate giving 30 days to vacate.", "is_lawyer": True, "created_at": datetime.now(timezone.utc).isoformat()},
                    {"id": str(uuid.uuid4()), "user_name": "Priya M", "content": "I had the same issue. Filing in Rent Tribunal was faster than civil court.", "is_lawyer": False, "created_at": datetime.now(timezone.utc).isoformat()}
                ],
                "likes": 24, "views": 156, "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()), "user_id": "other", "user_name": "Neha Gupta",
                "title": "Can I file a consumer complaint for delayed delivery?",
                "category": "Consumer", "content": "I ordered furniture worth Rs 2 lakhs online and it's been 3 months with no delivery. The company keeps giving excuses. Can I file a consumer complaint?",
                "replies": [
                    {"id": str(uuid.uuid4()), "user_name": "Adv. Sneha Iyer", "content": "Absolutely. This falls under 'deficiency in service' under the Consumer Protection Act 2019. You can file online at edaakhil.nic.in or visit your District Consumer Forum.", "is_lawyer": True, "created_at": datetime.now(timezone.utc).isoformat()}
                ],
                "likes": 18, "views": 89, "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()), "user_id": "other", "user_name": "Vikram Singh",
                "title": "FIR not being registered by police - What should I do?",
                "category": "Criminal", "content": "Police station is refusing to register my FIR for a theft case. They keep saying it's a civil matter. What are my legal options?",
                "replies": [],
                "likes": 31, "views": 203, "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.community_posts.insert_many(posts)
        logger.info("Seeded community posts")

    # Seed notifications
    notifs_count = await db.notifications.count_documents({})
    if notifs_count == 0:
        notifs = [
            {"id": str(uuid.uuid4()), "user_id": test_user_id, "title": "Case Update", "message": "Your property dispute case MN-23109 has been moved to legal review.", "type": "case_update", "read": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "user_id": test_user_id, "title": "New Message", "message": "Adv. Rajesh Kumar sent you a message regarding your case.", "type": "message", "read": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "user_id": test_user_id, "title": "Document Verified", "message": "Your Medical Report has been verified and added to the case file.", "type": "document", "read": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "user_id": test_user_id, "title": "Community Reply", "message": "Adv. Rajesh Kumar replied to your community post.", "type": "community", "read": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "user_id": test_user_id, "title": "AI Analysis Complete", "message": "Your legal analysis for the property dispute is ready to review.", "type": "analysis", "read": False, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.notifications.insert_many(notifs)
        logger.info("Seeded notifications")

    # Create indexes
    await db.users.create_index("email", unique=True)

# ─── AUTH ROUTES ───
@api_router.post("/auth/register")
async def register(data: RegisterRequest):
    email = data.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "name": data.name, "email": email,
        "password_hash": hash_password(data.password),
        "role": data.role, "phone": "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_access_token(user_id, email)
    return {"id": user_id, "name": data.name, "email": email, "role": data.role, "token": token}

@api_router.post("/auth/login")
async def login(data: LoginRequest):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    token = create_access_token(user_id, email)
    return {"id": user_id, "name": user["name"], "email": email, "role": user["role"], "token": token}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

# ─── CASES ROUTES ───
@api_router.get("/cases")
async def get_cases():
    cases = await db.cases.find({}, {"_id": 0}).to_list(100)
    return cases

@api_router.get("/cases/{case_id}")
async def get_case(case_id: str):
    case = await db.cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@api_router.post("/cases")
async def create_case(data: CaseCreate):
    case = {
        "id": str(uuid.uuid4()), "user_id": "current_user",
        "title": data.title, "description": data.description,
        "category": data.category, "status": "Pending",
        "risk_level": "MEDIUM", "success_probability": 50,
        "assigned_lawyer": "Unassigned", "case_number": f"JA-{uuid.uuid4().hex[:5].upper()}",
        "progress_percentage": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "timeline": [{"step": "Case Filed", "status": "completed", "date": datetime.now(timezone.utc).strftime("%b %d, %Y")}]
    }
    await db.cases.insert_one(case)
    case.pop("_id", None)
    return case

# ─── ANALYZE ROUTES ───
@api_router.post("/analyze")
async def analyze_legal_issue(data: AnalyzeRequest):
    result = await generate_ai_response(data.text)
    await db.analyses.insert_one({
        "id": str(uuid.uuid4()), "case_id": data.case_id or "standalone",
        "input_text": data.text, "result": result,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {
        "summary": result.get("summary", ""),
        "warnings": result.get("warnings", []),
        "actions": result.get("actions", []),
        "risk_level": result.get("risk_level", "MEDIUM"),
        "success_probability": result.get("success_probability", 50),
        "strategies": result.get("strategies", []),
        "applicable_laws": result.get("applicable_laws", []),
        "risk_factors": result.get("risk_factors", []),
        "outcome_predictions": result.get("outcome_predictions", []),
        "timeline_estimate": result.get("timeline_estimate", "")
    }

@api_router.post("/evidence/analyze")
async def analyze_evidence(data: EvidenceAnalyzeRequest):
    result = await analyze_evidence_ai(data.text)
    return result

# ─── LAWYERS ROUTES ───
@api_router.get("/lawyers")
async def get_lawyers(tier: Optional[int] = None, specialty: Optional[str] = None):
    query = {}
    if tier:
        query["tier"] = tier
    if specialty:
        query["specialty"] = {"$in": [specialty]}
    lawyers = await db.lawyers.find(query, {"_id": 0}).to_list(100)
    return lawyers

@api_router.get("/lawyers/{lawyer_id}")
async def get_lawyer(lawyer_id: str):
    lawyer = await db.lawyers.find_one({"id": lawyer_id}, {"_id": 0})
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    return lawyer

# ─── MESSAGES ROUTES ───
@api_router.get("/messages/{case_id}")
async def get_messages(case_id: str):
    messages = await db.messages.find({"case_id": case_id}, {"_id": 0}).to_list(100)
    return messages

@api_router.post("/messages")
async def create_message(data: MessageCreate):
    msg = {
        "id": str(uuid.uuid4()), "case_id": data.case_id,
        "sender": data.sender, "text": data.text,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(msg)
    msg.pop("_id", None)
    return msg

# ─── DOCUMENTS ROUTES ───
@api_router.get("/documents")
async def get_documents():
    docs = await db.documents.find({}, {"_id": 0}).to_list(100)
    return docs

# ─── COMMUNITY ROUTES ───
@api_router.get("/community/posts")
async def get_community_posts(category: Optional[str] = None):
    query = {} if not category or category == "All" else {"category": category}
    posts = await db.community_posts.find(query, {"_id": 0}).to_list(100)
    return posts

@api_router.get("/community/posts/{post_id}")
async def get_community_post(post_id: str):
    post = await db.community_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@api_router.post("/community/posts")
async def create_community_post(data: CommunityPostCreate):
    post = {
        "id": str(uuid.uuid4()), "user_id": "current_user", "user_name": "User",
        "title": data.title, "category": data.category, "content": data.content,
        "replies": [], "likes": 0, "views": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.community_posts.insert_one(post)
    post.pop("_id", None)
    return post

@api_router.post("/community/posts/{post_id}/reply")
async def reply_to_post(post_id: str, data: CommunityReplyCreate):
    reply = {
        "id": str(uuid.uuid4()), "user_name": "User",
        "content": data.content, "is_lawyer": data.is_lawyer,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.community_posts.update_one(
        {"id": post_id}, {"$push": {"replies": reply}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return reply

# ─── NOTIFICATIONS ROUTES ───
@api_router.get("/notifications")
async def get_notifications():
    notifs = await db.notifications.find({}, {"_id": 0}).to_list(100)
    return notifs

@api_router.post("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str):
    await db.notifications.update_one({"id": notif_id}, {"$set": {"read": True}})
    return {"status": "ok"}

@api_router.post("/notifications/read-all")
async def mark_all_read():
    await db.notifications.update_many({}, {"$set": {"read": True}})
    return {"status": "ok"}

# ─── ROOT ───
@api_router.get("/")
async def root():
    return {"message": "JurisAI API v1", "status": "active"}

# Include router + middleware
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await seed_database()
    logger.info("JurisAI Backend v2 started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
