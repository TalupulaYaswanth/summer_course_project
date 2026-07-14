# CodeExplain – Plain-English AI Code Tutor

CodeExplain is a modern, responsive, production-ready full-stack AI web application designed to help developers and beginners understand programming code in simple language. By pasting snippets or uploading files, users get visual complexity charts, line commentary walk-throughs, variables and functions maps, dry run step trace simulators, security checklists, interview prep Q&A, and interactive test quizzes.

---

## 🏗️ Architecture & Technologies

### Frontend
- **Framework**: React.js (Vite + TypeScript)
- **Styling**: Tailwind CSS (Custom Developer Dark Theme)
- **Editor**: Monaco Editor (using `@monaco-editor/react`)
- **Transitions**: Framer Motion
- **Icons**: Lucide React
- **HTTP Routing**: React Router DOM & Axios client

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Server**: Uvicorn
- **ORM/Database**: SQLAlchemy (SQLite for development / PostgreSQL production-ready model compatibility)
- **Authentication**: JWT Session security & Passlib password encryption
- **AI Core**: Google Gemini API via official `google-genai` SDK with strict nested JSON schemas

---

## 📁 Project Folder Structure

```
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py      # Auth, explanation CRUD, favorite routes
│   │   ├── database.py           # SQLite engine & Session local
│   │   ├── models.py             # SQLAlchemy schemas (Users, Explanations)
│   │   ├── schemas.py            # Pydantic schema validation structures
│   │   ├── auth.py               # Token verification & encrypt utilities
│   │   ├── services/
│   │   │   └── gemini.py         # Google GenAI service configurations
│   │   └── main.py               # FastAPI router mounting & DB initialization
│   ├── requirements.txt          # Python package definitions
│   └── Dockerfile                # Backend container script
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # SaaS landing presentation view
│   │   │   ├── AuthPages.tsx     # Login/Signup forms
│   │   │   └── Dashboard.tsx     # Monaco editor and results tab layout
│   │   ├── App.tsx               # Auth providers & protected routing
│   │   ├── index.css             # Tailwind imports & scrollbar styles
│   │   └── main.tsx              # React mounting file
│   ├── tailwind.config.js        # Design tokens
│   ├── postcss.config.js         # PostCSS preprocessing
│   ├── package.json              # Javascript dependencies
│   ├── tsconfig.json             # Typescript configurations
│   ├── index.html                # Entry web template
│   └── Dockerfile                # Nginx compiled serve script
│
├── docker-compose.yml            # Services orchestrator config
├── .env.example                  # Environment key definitions
└── README.md                     # Documentation file
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Gemini API Key (Obtain one from [Google AI Studio](https://aistudio.google.com/))

### Configuration
Create a `.env` file in the root workspace based on `.env.example`:
```bash
cp .env.example .env
```
Open `.env` and fill in your details:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=super_secret_codeexplain_token_key_12345
```

---

### Local Installation (Without Docker)

#### 1. Setup Backend
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
3. Install package requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Boot up the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend will be running at http://localhost:8000. API docs available at http://localhost:8000/docs.*

#### 2. Setup Frontend
1. Open a new terminal and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite developer server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at http://localhost:5173.*

---

### Running via Docker Compose
To compile and spin up the complete frontend and backend services inside containers:
1. Ensure your `.env` file is populated in the root.
2. Build and run:
   ```bash
   docker-compose up --build
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🔌 API Documentation

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| **POST** | `/auth/signup` | Register a new user | No |
| **POST** | `/auth/login` | Login user, returns JWT Token | No |
| **GET** | `/auth/profile` | Get logged-in user profile details | **Yes** |
| **PUT** | `/auth/profile/key` | Update saved custom Gemini API Key | **Yes** |
| **POST** | `/explain` | Process code snippet with Gemini API | **Yes** |
| **GET** | `/history` | Fetch user's explanation walk-through history | **Yes** |
| **DELETE**| `/history/{id}` | Delete specific history entry | **Yes** |
| **GET** | `/favorites` | Fetch user bookmarked explanations | **Yes** |
| **POST** | `/favorite/{id}` | Toggle bookmark status for explanation | **Yes** |
