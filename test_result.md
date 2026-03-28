#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "JurisAI - AI-Powered Legal Assistant & Lawyer Marketplace for India. Full-stack app with JWT auth, AI legal analysis (GPT-4o), lawyer marketplace, case management, community forums, notifications."

backend:
  - task: "JWT Authentication (Register + Login)"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "JWT auth with bcrypt, register and login endpoints. Test user: arjun@test.com / test123"
        - working: true
        - agent: "testing"
        - comment: "✅ All auth endpoints working: register (new user), login (arjun@test.com), and /auth/me with Bearer token. JWT tokens generated correctly."

  - task: "Cases CRUD API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "GET /api/cases, GET /api/cases/{id}, POST /api/cases. 3 seeded cases."
        - working: true
        - agent: "testing"
        - comment: "✅ All cases endpoints working: GET /api/cases (retrieved 3 cases), GET /api/cases/{id} (single case), POST /api/cases (case creation). All CRUD operations functional."

  - task: "AI Legal Analysis API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "POST /api/analyze uses GPT-4o via emergentintegrations. Returns structured JSON with summary, risk, strategies, laws, outcomes."
        - working: true
        - agent: "testing"
        - comment: "✅ AI analysis working: POST /api/analyze successfully analyzed property dispute case, returned structured JSON with risk level MEDIUM, strategies, applicable laws, and timeline estimates."

  - task: "Lawyers API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "GET /api/lawyers with optional tier/specialty filter. 5 seeded Indian lawyers."
        - working: true
        - agent: "testing"
        - comment: "✅ All lawyers endpoints working: GET /api/lawyers (retrieved 5 lawyers), specialty filtering (found 1 criminal law specialist), GET /api/lawyers/{id} (single lawyer details)."

  - task: "Community Posts API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "GET/POST /api/community/posts, POST /api/community/posts/{id}/reply"
        - working: true
        - agent: "testing"
        - comment: "✅ Community features working: GET /api/community/posts (retrieved 3 posts), POST /api/community/posts (created new post), POST /api/community/posts/{id}/reply (reply functionality)."

  - task: "Notifications API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "GET /api/notifications, POST mark read, POST mark all read. 5 seeded notifications."
        - working: true
        - agent: "testing"
        - comment: "✅ Notifications working: GET /api/notifications (retrieved 5 notifications), POST /api/notifications/{id}/read (mark single), POST /api/notifications/read-all (mark all read)."

  - task: "Messages API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "GET /api/messages/{case_id}, POST /api/messages"
        - working: true
        - agent: "testing"
        - comment: "✅ Messages working: GET /api/messages/general (retrieved 3 messages), POST /api/messages (message creation). Chat functionality operational."

  - task: "Evidence Analysis API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "POST /api/evidence/analyze uses GPT-4o for evidence analysis"
        - working: true
        - agent: "testing"
        - comment: "✅ Evidence analysis working: POST /api/evidence/analyze successfully analyzed property document, returned strength score 85 with insights and legal signals."

metadata:
  created_by: "main_agent"
  version: "2.1"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    - agent: "main"
    - message: "Full backend has been built with JWT auth, AI analysis, lawyers, cases, community, notifications, messages, and evidence. All endpoints need testing. Auth credentials: arjun@test.com / test123. Backend runs on port 8001 with /api prefix. Database is MongoDB with seeded data. Please test all endpoints."
    - agent: "testing"
    - message: "✅ BACKEND TESTING COMPLETE: All 8 backend tasks tested successfully with 100% pass rate (20/20 tests passed). JWT auth, Cases CRUD, AI analysis (GPT-4o), Lawyers API, Community posts, Notifications, Messages, and Evidence analysis all working correctly. Backend URL: https://lawtech-india-1.preview.emergentagent.com/api. No critical issues found."
