# Sentinel Zero-Trust AI Gateway

This is an interactive dashboard and WAF (Web Application Firewall) proxy for AI payloads, built for our cybersecurity buildathon.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Python FastAPI + SQLite

---

## How to Run Locally

If you just cloned this repository, you need to start **both** the backend and the frontend in two separate terminal windows.

### 1. Start the Backend (Terminal 1)
The backend runs on Python and uses a virtual environment to manage dependencies.

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment (only needed the first time)
python3 -m venv venv

# Activate the virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows (Command Prompt):
# venv\Scripts\activate.bat
# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# Install dependencies (only needed the first time)
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```
The backend will now be running on `http://localhost:8000`. You can view the API docs at `http://localhost:8000/docs`.

### 2. Start the Frontend (Terminal 2)
The frontend is a React application built with Vite.

```bash
# Navigate to the frontend folder
cd frontend

# Install Node modules (only needed the first time)
npm install

# Start the development server
npm run dev
```
The dashboard will now be running on `http://localhost:5173`. Open this URL in your browser to interact with the Sentinel Gateway!
