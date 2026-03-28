from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup logging early
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM Key
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ─── Pydantic Models ───
class UserLogin(BaseModel):
    name: str
    role: str  # "user" or "lawyer"

class UserResponse(BaseModel):
    id: str
    name: str
    role: str

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
    created_at: str
    timeline: List[dict]

class LawyerResponse(BaseModel):
    id: str
    name: str
    specialty: str
    tier: str
    experience_years: int
    rating: float
    cases_won: int
    total_cases: int
    location: str
    avatar_url: str
    consultation_fee: int

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

# ─── AI Service ───
async def generate_ai_response(text: str) -> dict:
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"legal-analysis-{uuid.uuid4()}",
            system_message="""You are JurisAI, an expert Indian legal assistant. You analyze legal issues clearly and simply based on Indian law (IPC, CrPC, CPC, Indian Constitution, specific Acts).

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "summary": "A clear 2-3 sentence summary of the legal situation",
  "warnings": ["Warning 1", "Warning 2"],
  "actions": ["Recommended action 1", "Recommended action 2"],
  "risk_level": "low|medium|high",
  "success_probability": 75,
  "strategies": [
    {"title": "Strategy A", "description": "Description", "pros": ["Pro 1"], "cons": ["Con 1"]},
    {"title": "Strategy B", "description": "Description", "pros": ["Pro 1"], "cons": ["Con 1"]}
  ]
}

Respond with ONLY the JSON object, no markdown, no code blocks, no extra text."""
        )
        chat.with_model("openai", "gpt-4o")

        user_message = UserMessage(text=f"Analyze this legal issue under Indian law and respond with ONLY valid JSON:\n\n{text}")
        response = await chat.send_message(user_message)

        import json
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        result = json.loads(cleaned)
        return result
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return {
            "summary": "Unable to complete AI analysis at this time. Please try again.",
            "warnings": ["AI service temporarily unavailable"],
            "actions": ["Please retry your analysis", "Consult a legal professional directly"],
            "risk_level": "medium",
            "success_probability": 50,
            "strategies": [
                {"title": "Direct Consultation", "description": "Consult with a lawyer from our marketplace", "pros": ["Expert opinion"], "cons": ["Additional cost"]}
            ]
        }

# ─── Seed Data ───
async def seed_database():
    lawyers_count = await db.lawyers.count_documents({})
    if lawyers_count == 0:
        lawyers = [
            {
                "id": str(uuid.uuid4()),
                "name": "Adv. Priya Sharma",
                "specialty": "Criminal Law",
                "tier": "Gold",
                "experience_years": 15,
                "rating": 4.9,
                "cases_won": 312,
                "total_cases": 350,
                "location": "New Delhi",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
                "consultation_fee": 3000
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Adv. Rajesh Kumar",
                "specialty": "Property Law",
                "tier": "Platinum",
                "experience_years": 22,
                "rating": 4.8,
                "cases_won": 480,
                "total_cases": 520,
                "location": "Mumbai",
                "avatar_url": "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200",
                "consultation_fee": 5000
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Adv. Meera Patel",
                "specialty": "Family Law",
                "tier": "Gold",
                "experience_years": 12,
                "rating": 4.7,
                "cases_won": 195,
                "total_cases": 230,
                "location": "Bangalore",
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
                "consultation_fee": 2500
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Adv. Arjun Reddy",
                "specialty": "Corporate Law",
                "tier": "Silver",
                "experience_years": 8,
                "rating": 4.5,
                "cases_won": 120,
                "total_cases": 145,
                "location": "Hyderabad",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
                "consultation_fee": 2000
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Adv. Sneha Iyer",
                "specialty": "Consumer Rights",
                "tier": "Gold",
                "experience_years": 10,
                "rating": 4.6,
                "cases_won": 165,
                "total_cases": 190,
                "location": "Chennai",
                "avatar_url": "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200",
                "consultation_fee": 2000
            }
        ]
        await db.lawyers.insert_many(lawyers)
        logger.info("Seeded 5 lawyers")

    cases_count = await db.cases.count_documents({})
    if cases_count == 0:
        cases = [
            {
                "id": str(uuid.uuid4()),
                "user_id": "demo_user",
                "title": "Property Dispute Resolution",
                "description": "Ancestral property partition dispute in New Delhi involving multiple family members",
                "status": "In Progress",
                "risk_level": "medium",
                "success_probability": 72,
                "assigned_lawyer": "Adv. Rajesh Kumar",
                "case_number": "MN-23109",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "timeline": [
                    {"step": "Case Filed", "status": "completed", "date": "2025-10-15"},
                    {"step": "Documents Received", "status": "completed", "date": "2025-11-12"},
                    {"step": "Case Under Legal Review", "status": "in_progress", "date": "2025-12-01"},
                    {"step": "Mediation Scheduled", "status": "pending", "date": ""},
                    {"step": "Decision: Accepted / Declined", "status": "pending", "date": ""}
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": "demo_user",
                "title": "Consumer Complaint - Defective Product",
                "description": "Filing complaint against electronics manufacturer for defective laptop under Consumer Protection Act",
                "status": "Review",
                "risk_level": "low",
                "success_probability": 88,
                "assigned_lawyer": "Adv. Sneha Iyer",
                "case_number": "CC-45201",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "timeline": [
                    {"step": "Complaint Drafted", "status": "completed", "date": "2025-12-01"},
                    {"step": "Notice Sent to Manufacturer", "status": "completed", "date": "2025-12-15"},
                    {"step": "Awaiting Response", "status": "in_progress", "date": "2026-01-10"},
                    {"step": "Hearing Date", "status": "pending", "date": ""}
                ]
            }
        ]
        await db.cases.insert_many(cases)
        logger.info("Seeded 2 cases")

    docs_count = await db.documents.count_documents({})
    if docs_count == 0:
        documents = [
            {"id": str(uuid.uuid4()), "case_id": "all", "title": "Medical Report", "file_type": "PDF", "file_size": "2.4 MB", "uploaded_at": "Jan 16, 2025", "status": "verified"},
            {"id": str(uuid.uuid4()), "case_id": "all", "title": "Hospital Discharge Summary", "file_type": "PDF", "file_size": "1.8 MB", "uploaded_at": "Jan 15, 2025", "status": "verified"},
            {"id": str(uuid.uuid4()), "case_id": "all", "title": "Property Documents", "file_type": "PDF", "file_size": "5.2 MB", "uploaded_at": "Jan 14, 2025", "status": "pending"},
            {"id": str(uuid.uuid4()), "case_id": "all", "title": "Identity Documents", "file_type": "PDF", "file_size": "1.1 MB", "uploaded_at": "Jan 12, 2025", "status": "verified"},
        ]
        await db.documents.insert_many(documents)
        logger.info("Seeded documents")

    msgs_count = await db.messages.count_documents({})
    if msgs_count == 0:
        messages = [
            {"id": str(uuid.uuid4()), "case_id": "general", "sender": "system", "text": "Reminder: Please upload your ID to proceed.", "timestamp": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "case_id": "general", "sender": "lawyer", "text": "We've received your medical report, thank you!", "timestamp": datetime.now(timezone.utc).isoformat()},
        ]
        await db.messages.insert_many(messages)
        logger.info("Seeded messages")


# ─── Routes ───
@api_router.get("/")
async def root():
    return {"message": "JurisAI API v1"}

@api_router.post("/auth/login", response_model=UserResponse)
async def login(data: UserLogin):
    existing = await db.users.find_one({"name": data.name, "role": data.role}, {"_id": 0})
    if existing:
        return UserResponse(**existing)
    user = {"id": str(uuid.uuid4()), "name": data.name, "role": data.role}
    await db.users.insert_one(user)
    return UserResponse(**user)

@api_router.get("/cases", response_model=List[CaseResponse])
async def get_cases():
    cases = await db.cases.find({}, {"_id": 0}).to_list(100)
    return [CaseResponse(**c) for c in cases]

@api_router.get("/cases/{case_id}", response_model=CaseResponse)
async def get_case(case_id: str):
    case = await db.cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return CaseResponse(**case)

@api_router.get("/lawyers", response_model=List[LawyerResponse])
async def get_lawyers():
    lawyers = await db.lawyers.find({}, {"_id": 0}).to_list(100)
    return [LawyerResponse(**l) for l in lawyers]

@api_router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_legal_issue(data: AnalyzeRequest):
    result = await generate_ai_response(data.text)
    analysis = {
        "id": str(uuid.uuid4()),
        "case_id": data.case_id or "standalone",
        "input_text": data.text,
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.analyses.insert_one(analysis)
    return AnalyzeResponse(
        summary=result.get("summary", ""),
        warnings=result.get("warnings", []),
        actions=result.get("actions", []),
        risk_level=result.get("risk_level", "medium"),
        success_probability=result.get("success_probability", 50),
        strategies=result.get("strategies", [])
    )

@api_router.get("/messages/{case_id}", response_model=List[MessageResponse])
async def get_messages(case_id: str):
    messages = await db.messages.find({"case_id": case_id}, {"_id": 0}).to_list(100)
    return [MessageResponse(**m) for m in messages]

@api_router.post("/messages", response_model=MessageResponse)
async def create_message(data: MessageCreate):
    msg = {
        "id": str(uuid.uuid4()),
        "case_id": data.case_id,
        "sender": data.sender,
        "text": data.text,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(msg)
    return MessageResponse(**msg)

@api_router.get("/documents", response_model=List[DocumentResponse])
async def get_documents():
    docs = await db.documents.find({}, {"_id": 0}).to_list(100)
    return [DocumentResponse(**d) for d in docs]

# Include router
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
    logger.info("JurisAI Backend started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
