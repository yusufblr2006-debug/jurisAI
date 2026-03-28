# JurisAI - AI-Powered Legal Assistant & Lawyer Marketplace

## Overview
JurisAI is a comprehensive legal-tech platform built for the Indian market. It provides AI-powered legal analysis, a lawyer marketplace, case management, and communication features.

## Tech Stack
- **Frontend**: React Native (Expo SDK 54) with expo-router
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Engine**: OpenAI GPT-4o via Emergent LLM Key

## Features

### 1. Authentication
- Simple login with name and role selection (Client/Lawyer)
- User persisted in MongoDB

### 2. Home Dashboard
- Personalized greeting (Good morning/afternoon/evening)
- Tabs: Overview, Documents, Tasks
- Hero Case Card with image, status badge, risk level
- Case Progress Timeline (vertical with completion status)
- Success Probability Ring Chart (SVG)
- Other cases listing

### 3. AI Legal Engine
- Text input for describing legal issues
- Quick templates for common legal scenarios
- AI-powered analysis returning:
  - Summary, Warnings, Recommended Actions
  - Risk Level (Low/Medium/High)
  - Success Probability percentage
  - Strategy options with pros/cons

### 4. Lawyer Marketplace
- 5 pre-seeded Indian lawyers
- Search by name or specialty
- Filter by specialty (Criminal, Property, Family, Corporate, Consumer)
- Tier badges (Platinum, Gold, Silver)
- Ratings, experience, win rates, consultation fees
- Consult button

### 5. Chat Interface
- Real-time messaging with legal team
- Message bubbles (blue for user, white for others)
- System messages support
- Attachment and mic buttons (UI ready)

### 6. Documents Section
- List of uploaded documents with metadata
- File type, size, upload date
- View/download actions

## API Endpoints
- `POST /api/auth/login` - Login/register user
- `GET /api/cases` - List all cases
- `GET /api/cases/:id` - Get single case
- `GET /api/lawyers` - List all lawyers
- `POST /api/analyze` - AI legal analysis
- `GET /api/messages/:caseId` - Get messages
- `POST /api/messages` - Send message
- `GET /api/documents` - List documents

## Navigation
Floating dark pill bottom navigation with 4 tabs:
- Home, AI Engine, Lawyers, Chat
