# HealthOS: AI-Powered Healthcare Operating System

<img width="1916" height="874" alt="Screenshot 2026-02-21 081144" src="https://github.com/user-attachments/assets/8250f09a-0e5a-465f-98b3-3ea760fb5b47" />


HealthOS is a revolutionary healthcare platform designed with a modern, macOS-inspired user interface. It aims to reduce healthcare to pure intelligence by providing patients with real-time health scoring, intelligent triage, and an AI-powered voice doctor for medical consultations and lifestyle guidance.

---

## ✨ Features

- **Interactive OS Shell (`Dr. OS`):** Experience a fully functional, draggable, and resizable mac-OS styled window interface tailored for healthcare management.
- **Advanced Health Engine:** A core system that calculates real-time vital scores and evaluates the status of major organs (Heart, Liver, Lungs, Kidneys, Brain, Stomach) dynamically.
- **Intelligent Triage System:** Uses vast amounts of patient health data to route you to the best Specialist Persona (e.g., AI Cardiologist, AI Neurologist).
- **Dr. ARIA - Voice AI Doctor:** A highly empathetic, real-time voice-interactive medical assistant capable of diagnosing and providing medically sound lifestyle advice using the Cerebras LLM.
- **Gamified Health Scoring:** Encourages better health behaviors dynamically tracking lifestyle activities.
- **Dark, Cinematic 3D Interfaces:** Highly polished GSAP + React Three Fiber animated user experience for ultimate immersion.

---

## 📸 Screenshots

| Dashboard Interface | Medical UI |
| :---: | :---: |
|<img width="1911" height="868" alt="Screenshot 2026-02-21 081304" src="https://github.com/user-attachments/assets/3a8ee608-abe7-4021-a5ef-4c1d9f339a3c" />
 |
| <img width="867" height="596" alt="Screenshot 2026-02-21 081655" src="https://github.com/user-attachments/assets/e743e625-84bc-4e1b-b796-d0eb64c61f6b" />
|

_More immersive experiences in action:_

<img width="519" height="688" alt="Screenshot 2026-02-21 081418" src="https://github.com/user-attachments/assets/c9cda01a-0f8d-48d6-a40f-5023548a4a23" />


---

## 🚀 Technologies Used

**Frontend & Visuals:**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS, Shadcn UI / Radix UI
- **Animations:** GSAP, React Three Fiber, Framer Motion
- **State Management:** Zustand, React Query

**Backend & Storage:**
- **Server:** Next.js Route Handlers
- **Database:** MongoDB & Mongoose
- **Authentication:** JWT, Custom Auth & Appwrite

**AI Capabilities (Voice & Inference):**
- **Orchestration:** LiveKit (Python SDK running WebSocket logic)
- **Large Language Model (LLM):** Cerebras API (`llama3.1-8b`) for low latency inference
- **Speech-to-Text (STT):** Deepgram `nova-2`
- **Text-to-Speech (TTS):** Deepgram `aura-asteria-en`
- **VAD Processing:** Silero VAD

---

## 📂 File Structure

```text
healthcare-os/
├── app/                  # Next.js App Router (pages and api routes)
│   ├── api/              # RESTful API backend handlers
│   ├── landing/          # Core landing page
│   ├── login/            # Authentication UI
│   └── os/               # Main OS desktop application shell
├── components/           # React Components broken out by domain
│   ├── admin/            # Hospital system module
│   ├── chat/             # Chatbot UI
│   └── os/               # Windowing system components (Taskbar, Window limits)
├── lib/                  # Application Core Logic
│   ├── models/           # Mongoose schemas
│   ├── health-engine.ts  # Health score & vitals ruleset engine
│   ├── db.ts             # MongoDB database connection
│   └── triage-engine.ts  # Ruleset generator for Specialist assignment
├── public/               # Static assets & screenshots
├── voice-agent/          # Autonomous Python Backend
│   ├── agent.py          # Real-time WebSocket logic orchestrating Dr. ARIA 
│   └── requirements.txt  # Python dependency specifications
└── package.json          # Node dependency configurations
```

---

## 🛠️ Comprehensive Installation Guide

Follow these steps to run the HealthOS platform locally. This requires running both the Next.js Frontend and the Python Voice-Agent Backends concurrently.

### 1. Prerequisites
- **Node.js:** `v18.x` or higher
- **Python:** `v3.10` or higher
- **MongoDB:** A remote MongoDB cluster (Atlas) or local MongoDB instance running.
- Accounts & API Keys for: **Cerebras**, **Deepgram**, and **LiveKit**.

### 2. General Setup & Environment Variables

Clone the repository and jump into the main root folder:
```bash
git clone https://github.com/your-username/healthcare-os.git
cd healthcare-os
```

Create a `.env.local` file in the root directory:
```bash
touch .env.local
```

Populate the `.env.local` with following credentials:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/health-os

# LiveKit Confguration
LIVEKIT_URL=wss://<your-project>.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Deepgram and Cerebras
DEEPGRAM_API_KEY=your_deepgram_key
CEREBRAS_API_KEY=your_cerebras_key

# Authentication
JWT_SECRET=your_jwt_strong_secret
```

### 3. Running the Next.js Frontend

Install the necessary Node.js dependencies:
```bash
npm install
# or
yarn install
```

Start the Next.js Development Server:
```bash
npm run dev
# or 
yarn dev
```
_The server should now be running on [http://localhost:3000](http://localhost:3000). You can visit the landing sequence and log in._

### 4. Running the Voice Agent (Dr. ARIA Backend)

Open a new terminal session, keeping the Next.js app running.

Navigate to the voice agent directory:
```bash
cd voice-agent
```

Set up a virtual environment to safely install Python dependencies:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install the required Python dependencies:
```bash
pip install -r requirements.txt
```

Run the LiveKit worker/agent:
```bash
python agent.py dev
```
_The agent is now listening for real-time WebRTC connections via LiveKit. Initiate a voice call in the OS shell, and Dr. ARIA will respond instantly!_

---

## 🤝 Contributing
Contributions are more than welcome. Please make sure to update tests as appropriate and follow the existing code styles. Document major UI changes using screenshot diffs!

## 📜 License
[MIT](https://choosealicense.com/licenses/mit/)
