# 🛡️ BiasLens: Enterprise AI Fairness Auditor

> **Transforming complex algorithmic bias into actionable, regulatory-ready insights.**
> Built for the **Google Developer Groups Solution Challenge 2026**.

BiasLens is a high-fidelity, full-stack fairness auditing platform that empowers enterprises to identify, visualize, and mitigate bias in machine learning models. It bridges the gap between raw data science and executive-level compliance by translating cold statistics into human-centered narratives and structured regulatory reports.

---

## 🚀 Latest Updates & Improvements

The v2.1 "Enterprise Model" represents a significant upgrade from the original prototype, focusing on production stability, authentication security, and deep data reactivity:

*   **🔒 Firebase Authentication Integration**: Added secure client-side user accounts supporting both **Google Sign-In** and email/password signup/login.
*   **🔄 Global Data Reactivity**: Implemented a global `AuditKey` mechanism. Every new dataset upload triggers a complete, clean re-mount of the dashboard tree, preventing data leakage between auditing sessions.
*   **📋 Styled Regulatory Report Suite**: Generate submission-ready audit reports mapping model performance directly to key AI regulations (the **EU AI Act**, **NYC Local Law 144**, and **NIST RMF**).
*   **🍞 Live Command Toast Notifications**: Added a global reactive toast system providing real-time UI feedback for exports, mitigation actions, and file processing.
*   **🏗️ Hardened Production Pipeline**: Resolved typescript compilation issues (`TS6133` warnings) and added explicit package dependencies for a 100% clean build.

---

## ⚡ Google Technologies & AI Tools Integrated

BiasLens leverages state-of-the-art Google developer products and AI foundations to deliver a secure, intelligent, and scalable experience:

### 1. Google Generative AI (Gemini 1.5 Pro)
*   **Empathetic Persona Impact Stories**: Uses **Gemini 1.5 Pro** (`gemini-1.5-pro` model) to translate complex demographic parity gaps and statistical biases into real-world human stories. It automatically crafts narratives detailing how model disparities affect hypothetical users (like 'Alex' and 'Jordan') in real scenarios (e.g., credit line denials or resume screening bias).
*   **Automated Auditor Summaries**: Generates high-quality narrative syntheses of the model audit results to help non-technical stakeholders quickly grasp compliance status.

### 2. Google Firebase (Authentication)
*   **Google Sign-In**: Enables seamless authentication using Google Accounts via OAuth popups.
*   **Firebase Authentication SDK**: Manages secure user sessions, signup, sign-in, and account profile management on the client side using Firebase's secure global infrastructure.

---

## ✨ Core Feature Suite

### 1. 📊 Executive Overview
A high-level command center displaying the **Global Fairness Score**. Includes a **Regulatory Shield** that provides instant pass/fail status against global AI laws and an **Equity Evolution** tracker for historical performance.

### 2. 🧠 Persona Impact Stories
Powered by **Google Gemini**, this view translates metrics into human-centered narratives (e.g., "The Invisible Wall" and "The Systemic Advantage") to visualize the human cost of algorithmic bias.

### 3. ⚖️ Detailed Audit Report
A deep-dive technical view featuring:
- **Bias Intensity Heatmaps**: Visualizing group-level disparities across demographic groups.
- **Feature Risk Logs**: Identifying which input variables act as "bias proxies."
- **Export Suite**: Exporting debiased datasets in **CSV** and downloading ready-made compliance documentation.

### 4. ⚡ Mitigation Sandbox
A interactive "What-If" simulation environment. Adjust re-weighting intensities and feature exclusions in real-time to see how they impact the **Fairness vs. Accuracy Trade-off**.

---

## 💻 Tech Stack

*   **Frontend**: React (Vite) + TypeScript + Recharts + Google Fonts + Vanilla CSS
*   **Backend**: FastAPI (Python) + Pandas + Google Generative AI Python SDK
*   **Authentication**: Google Firebase Auth
*   **Hosting**: Netlify (Frontend) / Local uvicorn server (Backend)

---

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export GEMINI_API_KEY="your-gemini-api-key"
uvicorn main:app --reload --port 8000
```
*The backend API will run on `http://localhost:8000`.*

### 2. Frontend Setup (React/Vite)
Create a `.env` file in the `frontend/` directory:
```bash
touch frontend/.env
```
Populate it with your Firebase Web App configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Install packages and run locally:
```bash
cd frontend
npm install
npm run dev
```
*The frontend development server will run on `http://localhost:5173`.*

### 3. Production Build & Netlify Deploy
To verify the production build locally:
```bash
cd frontend
npm run build
```

When deploying to **Netlify**, configure the following environment variables in your Netlify Build Environment:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
