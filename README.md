# 🛡️ BiasLens: Enterprise AI Fairness Auditor

> **Transforming complex algorithmic bias into actionable, regulatory-ready insights.**

BiasLens is a high-fidelity, full-stack fairness auditing platform that empowers enterprises to identify, visualize, and mitigate bias in machine learning models. Built for the **Solution Challenge 2026**, it bridges the gap between raw data science and executive-level compliance.

---

## 🚀 Enterprise Model vs. Original Prototype

The v2.1 "Enterprise Model" represents a significant upgrade from our initial prototype, focusing on production stability, regulatory compliance, and deep data reactivity.

### Key Upgrades:
- **Full Data Reactivity**: Implemented a global `AuditKey` mechanism. Every new dataset upload now triggers a complete, clean re-mount of the dashboard tree, ensuring zero "state leakage" between auditing sessions.
*   **Professional Regulatory Engine**: Replaced simple text logs with a **Styled PDF Reporting Engine**. Generate submission-ready audit reports that map model performance directly to the **EU AI Act**, **NYC Local Law 144**, and **NIST RMF**.
*   **Interactive Command Center**: Added a global **Toast Notification System** providing real-time feedback for all dashboard interactions (exports, requests, mitigation).
*   **Contextual Breadcrumbs**: All views now feature persistent metadata bars (Filename, Record Count, Protected Attribute) so auditors always know which segment they are analyzing.
*   **Zero-Human-Image Policy**: Adhered to a premium, data-centric aesthetic using only high-fidelity graphs, custom SVGs, and professional panel layouts.
*   **Hardened Build Pipeline**: Resolved all `TS6133` TypeScript warnings and stale module errors for a 100% clean production build.

---

## ✨ Core Feature Suite

### 1. 📊 Executive Overview
A high-level command center displaying your **Global Fairness Score**. Includes a **Regulatory Shield** that provides instant pass/fail status against global AI laws and an **Equity Evolution** tracker for historical performance.

### 2. 🧠 Persona Impact Stories
Translates cold statistics into human-centered narratives. Using **Gemini 1.5 Pro**, BiasLens generates "The Invisible Wall" and "The Systemic Advantage" stories, explaining how specific bias mechanisms (like Demographic Parity gaps) affect real-world outcomes.

### 3. ⚖️ Detailed Audit Report
A deep-dive technical view featuring:
- **Bias Intensity Heatmaps**: Visualizing group-level disparities across Race, Gender, and Age.
- **Feature Risk Logs**: Identifying which input variables are acting as "bias proxies."
- **Export Suite**: One-click **CSV** and **Regulatory PDF** generation.

### 4. ⚡ Mitigation Sandbox
A "What-If" simulation environment. Adjust re-weighting intensities and feature exclusions in real-time to see how they impact the **Fairness vs. Accuracy Trade-off**. Once satisfied, export the mathematically corrected dataset.

---

## 💻 Tech Stack

**Frontend:**
- **React 18 + Vite**: Lightning-fast HMR and production builds.
- **Vanilla CSS + Custom Tokens**: A bespoke, premium design system (Dark Mode).
- **Recharts**: Responsive, high-fidelity data visualizations.
- **Custom SVG Icons**: Zero-dependency branding and iconography.

**Backend:**
- **FastAPI**: High-performance asynchronous API layer.
- **Pandas**: Industrial-strength metric calculation.
- **Google Generative AI**: Powered by `gemini-1.5-pro` for automated narrative generation.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
export GEMINI_API_KEY="your-key-here"
uvicorn main:app --reload --port 8000
```

### 2. Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

### 3. Verification
Run `npm run build` in the frontend directory to verify the production-ready state (confirmed 0 errors).

---

## ⚖️ Compliance & Privacy
BiasLens is designed with privacy-first principles. All PDF and CSV report generation happens **client-side** using secure Blob mechanisms, ensuring that sensitive audit summaries never leave your secure environment.

---

## 👥 Authors

- **Aarya Rai** — [@AaryaRai01](https://github.com/AaryaRai01)
- **Aayush Rai** — [@aayushrai987](https://github.com/aayushrai987)

---
Built for the Solution Challenge 2026
