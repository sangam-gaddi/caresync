# HealthOS - Project Report & Documentation

## 1. Project Overview
HealthOS is a revolutionary healthcare platform designed with a modern, macOS-inspired user interface. It aims to reduce healthcare to pure intelligence by providing patients with real-time health scoring, intelligent triage, and an AI-powered voice doctor for medical consultations and lifestyle guidance.

## 2. Technology Stack

### **Frontend Architecture**
- **Framework:** Next.js 14 (App Router)
- **UI & Styling:** React 18, Tailwind CSS, Shadcn UI / Radix UI primitives
- **Animations & 3D Engine:** GSAP (`@gsap/react`), React Three Fiber (`@react-three/fiber`, `@react-three/drei`), Framer Motion
- **State Management:** Zustand, React Query (`@tanstack/react-query`)
- **Web3 / Decentralization Integration:** Wagmi, Viem, RainbowKit

### **Backend & Database**
- **Backend API:** Next.js Serverless Route Handlers
- **Database:** MongoDB 
- **ODM (Object Data Modeling):** Mongoose (`lib/models/` schemas)
- **Authentication:** Custom JWT flow using `jose` and Appwrite APIs

### **AI & Voice Intelligence**
- **Voice Agent Framework:** LiveKit (`livekit-agents` and `livekit-server-sdk` running in Python)
- **Large Language Model (LLM):** Cerebras API (`llama3.1-8b`) for ultra-low latency inference
- **Speech-to-Text (STT):** Deepgram (`nova-2` model)
- **Text-to-Speech (TTS):** Deepgram (`aura-asteria-en` voice)
- **Voice Activity Detection (VAD):** Silero VAD

---

## 3. Core Features & Working Mechanisms

### 3.1. Advanced Health Engine
The Health Engine (`lib/health-engine.ts`) acts as the core ruleset to determine a patient's overall health score (0-100) and the specific real-time status of their major organs:
- **Organs Monitored:** Heart, Liver, Lungs, Kidneys, Brain, Stomach.
- **Dynamic Assessment:** The status of each organ dynamically evaluates to "healthy", "warning", or "critical" based on patient vulnerabilities (hypertension, diabetes, heart disease, etc.), current symptomatic issues, and lifestyle factors (e.g., smoking, stress level, fat intake, alcohol consumption, sleep).
- **Gamified Scoring:** Penalties and bonuses are applied dynamically. For instance, high stress combined with smoking penalizes heart and lung scores, while an excellent diet and high exercise frequency boost the overall health baseline.

### 3.2. Intelligent AI Triage System
The Triage Engine (`lib/triage-engine.ts`) processes massive amounts of patient health data to route the patient to the most relevant AI Specialist Persona:
- **Specialist Personas:** AI Cardiologist (🫀), AI Pulmonologist (🫁), AI Neurologist (🧠), AI Gastroenterologist (🏥), AI Nephrologist (💧), and a General Practitioner (🩺).
- **Scoring Logic:** Point-based system assigns priority based on critical organ alerts, pre-existing vulnerabilities, and lifestyle patterns. The top-scoring persona is selected to drive the clinical interaction.

### 3.3. Dr. ARIA: Real-Time Voice AI Doctor
- **Persona Context Injection:** Dr. ARIA consumes real-time context from the Triage Engine (patient name, vitals score, critical organ status, and specialized medical prompt instructions).
- **Conversational Voice:** Implemented in Python via LiveKit and Deepgram. WebRTC allows for ultra-fast, bidirectional voice interaction. It's programmed to be warm, empathetic, and scientifically rigorous, dynamically adjusting its terminology based on whether it is playing a Cardiologist or Neurologist.

### 3.4. Next-Gen Front-End UI Structure
- **Interactive macOS-like Shell:** Instead of traditional dashboards, the authenticated user lands in an "OS Shell" (`components/os`). Apps like Appointments, Health Profile, and AI Doctor open in draggable, resizable windows mimicking desktop interfaces.
- **Dynamic 3D Interfaces:** Highly polished landing sequence incorporating 3D models with React Three Fiber, scroll-triggered animations via GSAP, and cinematic reveals.

### 3.5. Medical Data Management
- Complete hospital and appointment booking infrastructure exposed via RESTful API routes (`/app/api`).
- Models exist for Availability Slots, Avatars, Cities, Health Profiles, Specialists, and Hospitals. 

---

## 4. Project File Structure Analysis
```
healthcare-os/
├── app/                  # Next.js App Router (frontend pages & backend APIs)
│   ├── api/              # RESTful backend handlers for appointments, patients, seed, etc.
│   ├── landing/          # Core landing page route
│   ├── login/            # Authentication interface
│   ├── os/               # Main authenticated desktop application shell
│   └── page.tsx          # Initial entry point with rich GSAP animations
├── components/           # React Components broken down by feature domain
│   ├── admin/            # Hospital system administration 
│   ├── landing/          # Reusable UI elements for front page (Marquee, Preloader)
│   ├── os/               # Windowing system elements (Taskbar, Windows)
│   └── chat/             # Chatbot UI
├── lib/                  # Application Core Logic & Utilities
│   ├── models/           # Mongoose Database schemas (user, hospital, slot, etc.)
│   ├── health-engine.ts  # Core algorithmic calculator for vitals & organ health
│   ├── triage-engine.ts  # Ruleset generator for Specialist assignment
│   └── db.ts             # MongoDB Connection handler
├── voice-agent/          # Autonomous Python Backend
│   ├── agent.py          # Real-time WebSocket logic orchestrating Dr. ARIA (LiveKit, Cerebras)
│   └── requirements.txt  # Python dependency specifications
├── .env.local            # Environment configuration (Deepgram, Cerebras, MongoDB URLs)
└── package.json          # Node dependency orchestrator
```
