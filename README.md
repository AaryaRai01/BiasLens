# 🛡️ BiasLens: AI Fairness Auditor

> **Transforming cold statistics into actionable, human-centered fairness.**

BiasLens is a full-stack, AI-powered fairness auditing platform designed to help developers and enterprises identify, understand, and mitigate structural bias in their machine learning models. 

Unlike traditional data science libraries that only output complex mathematical metrics, BiasLens provides a highly visual, action-oriented, and sociotechnical dashboard that bridges the gap between engineering and ethics.

---

## ✨ Key Features

### 1. 📊 Automated Bias Detection
Upload a dataset (`CSV` or `JSON`) containing your model's predictions, ground-truth labels, and protected attributes (like Race or Gender). BiasLens instantly calculates industry-standard fairness metrics:
- **Demographic Parity**
- **Equalized Odds**
- **Equal Opportunity**
- **Disparate Impact**

### 2. 🧠 GenAI "Empathy Engine"
Numbers alone don't change behavior. BiasLens integrates **Gemini 1.5 Pro** to translate complex statistics into **Persona Impact Stories**. It generates short, empathetic narratives explaining exactly how your model's bias affects hypothetical individuals in the real world (e.g., *“Meet Alex, who was unfairly denied a loan...”*).

### 3. ⚖️ Regulatory Compliance Grader
BiasLens maps your model's performance directly to real-world regulations. The dashboard evaluates your metrics against the **NYC Local Law 144 (4/5ths Rule)** and the **EU AI Act**, displaying clear "Compliant" or "High Risk" badges.

### 4. ⚡ "1-Click Mitigate" Sandbox
No need to write complex Python code to fix the bias. Click the **"1-Click Mitigate"** button to simulate dynamic debiasing techniques (like prediction re-weighting to close the fairness gap). The UI instantly animates to compare the "Original Model" with the "Mitigated Model".

### 5. 📥 Debiased Dataset Export
After mitigating the bias in the sandbox, click **"Download Dataset"** to export the mathematically corrected CSV. You can immediately plug this cleaned data back into your pipeline to train a fairer model.

---

## 💻 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS v4 (Custom Dark Mode Theme)
- Recharts (Data Visualization)
- Lucide React (Iconography)

**Backend:**
- Python 3 + FastAPI
- Pandas (Metric Calculation & Data Manipulation)
- Google Generative AI (`gemini-1.5-pro`)
- Uvicorn

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Start the Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install fastapi uvicorn pandas google-generativeai python-multipart
# Optional: Export your Gemini API Key for the Empathy Engine
export GEMINI_API_KEY="your-api-key-here"
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
1. Open your browser to `http://localhost:5173`
2. Click "Upload Dataset" and provide the included `sample_data.json` or `adult_census_audit.csv`
3. Explore the metrics, read the generated insights, and test the 1-Click Mitigation tool!

---

## 🔮 What's Next?
- **More Mitigation Algorithms:** Integrating Adversarial Debiasing and Calibrated Equalized Odds directly into the backend.
- **Continuous Monitoring:** API endpoints to allow live production models to stream predictions into the dashboard.
- **Custom Thresholding:** Allowing users to manually drag and drop approval thresholds to see real-time impact on Disparate Impact scores.

---
*Built with ❤️ for the Solution Challenge 2026*
