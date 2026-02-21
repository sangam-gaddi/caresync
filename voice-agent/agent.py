"""
HealthOS Voice Agent - Dr. ARIA (AI Doctor)

AI-powered voice doctor that provides health consultations via voice.
Uses the triage-assigned specialist persona from the HealthOS platform.

Uses: LiveKit, Deepgram STT, Cerebras LLM (via OpenAI plugin), Cartesia TTS

Run with: python agent.py dev
"""

import asyncio
import json
import os
import logging
from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    cartesia,
    deepgram,
    silero,
    openai,
)

# Load environment variables from parent directory
import pathlib
script_dir = pathlib.Path(__file__).parent.absolute()
env_path = script_dir.parent / ".env.local"
load_dotenv(str(env_path))

# Enable logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("healthos-doctor")

# Verify API keys on startup
logger.info(f"LIVEKIT_URL: {os.getenv('LIVEKIT_URL', 'NOT SET')}")
logger.info(f"DEEPGRAM_API_KEY: {'SET' if os.getenv('DEEPGRAM_API_KEY') else 'NOT SET'}")
logger.info(f"CEREBRAS_API_KEY: {'SET' if os.getenv('CEREBRAS_API_KEY') else 'NOT SET'}")
logger.info(f"CARTESIA_API_KEY: {'SET' if os.getenv('CARTESIA_API_KEY') else 'NOT SET'}")


# ────────────────────────────────────────────────────────────
# DEFAULT SYSTEM PROMPT — Used when no triage data is provided
# ────────────────────────────────────────────────────────────
DEFAULT_INSTRUCTIONS = """You are Dr. ARIA (Autonomous Real-time Intelligence Assistant), 
an advanced AI healthcare doctor embedded in the HealthOS platform.

PERSONALITY:
- Warm, empathetic, and professional
- Speaks in clear, accessible medical language
- Asks follow-up questions to understand symptoms
- Always recommends consulting a real doctor for serious concerns
- Reassuring but honest

CAPABILITIES:
- Symptom analysis and initial assessment
- Health education and wellness advice
- Medication information (general only, no prescriptions)
- Mental health check-ins and stress management
- Lifestyle and nutrition guidance

GUIDELINES:
- Keep responses conversational and SHORT (2-3 sentences usually)
- Never diagnose definitively — use phrases like "this could indicate" or "it may be worth checking"
- Always recommend professional medical consultation for concerning symptoms
- Be supportive and reduce health anxiety when appropriate
- Ask clarifying questions before jumping to conclusions
"""


def get_system_instructions(patient_data: dict) -> str:
    """
    Generate system instructions based on the triage-assigned specialist persona.
    Falls back to general practitioner if no specialist data is provided.
    """
    # If room metadata contains a pre-built systemPrompt from the triage engine, use it
    system_prompt = patient_data.get('systemPrompt', '')
    if system_prompt:
        return system_prompt
    
    # Otherwise build a basic prompt from available patient data
    patient_name = patient_data.get('patientName', 'Patient')
    specialist_type = patient_data.get('specialistType', 'General Practitioner')
    
    return f"""{DEFAULT_INSTRUCTIONS}

CURRENT PATIENT: {patient_name}
YOUR SPECIALIST ROLE: {specialist_type}

Remember to greet the patient warmly without trying to pronounce their name.
Use friendly greetings like "Hello there!" or "Hi, welcome to your consultation!"
"""


class HealthDoctorAgent(Agent):
    """Dr. ARIA — The HealthOS AI Doctor Voice Agent"""
    
    def __init__(self, patient_data: dict):
        instructions = get_system_instructions(patient_data)
        super().__init__(instructions=instructions)
        self.patient_data = patient_data


async def entrypoint(ctx: agents.JobContext):
    """Main entry point for the voice agent"""
    
    logger.info("🏥 Dr. ARIA Voice Agent starting up!")
    
    # Connect to room
    await ctx.connect()
    logger.info(f"✅ Connected to room: {ctx.room.name}")
    
    # Parse patient data from room metadata (set by the Next.js voice API)
    patient_data = {}
    try:
        if ctx.room.metadata:
            patient_data = json.loads(ctx.room.metadata)
            logger.info(f"📋 Patient connected: {patient_data.get('patientName', 'Unknown')}")
            logger.info(f"🩺 Specialist: {patient_data.get('specialistType', 'General')}")
    except Exception as e:
        logger.warning(f"Could not parse room metadata: {e}")
    
    specialist_type = patient_data.get('specialistType', 'General Practitioner')
    patient_name = patient_data.get('patientName', 'Patient')
    
    # Initialize the doctor agent with triage data
    agent = HealthDoctorAgent(patient_data)
    
    # Set up LLM with Cerebras (fast inference, free)
    llm_instance = openai.LLM(
        base_url="https://api.cerebras.ai/v1",
        api_key=os.getenv("CEREBRAS_API_KEY"),
        model="llama3.1-8b"
    )
    
    # Create agent session with Deepgram for BOTH STT and TTS (reliable, single provider)
    logger.info("📦 Creating Dr. ARIA session with Deepgram STT + TTS...")
    session = AgentSession(
        stt=deepgram.STT(model="nova-2", language="en"),
        llm=llm_instance,
        tts=deepgram.TTS(
            model="aura-asteria-en",  # Professional female English voice
        ),
        vad=silero.VAD.load(),
    )
    
    logger.info("▶️ Starting Dr. ARIA voice session...")
    
    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(
            noise_cancellation=True,
        ),
    )
    
    logger.info("🎤 Dr. ARIA is live!")
    
    # Short greeting — keep it brief so TTS responds quickly
    greeting = (
        f"Greet the patient warmly in 1-2 sentences. "
        f"You are Dr. ARIA, an AI {specialist_type}. "
        f"Do NOT use the patient's name. Ask what they'd like to discuss."
    )
    
    try:
        await session.generate_reply(instructions=greeting)
        logger.info("✅ Dr. ARIA greeted the patient!")
    except Exception as e:
        logger.error(f"Greeting failed: {e}")
    
    # Keep agent running until disconnected
    await asyncio.Future()


if __name__ == "__main__":
    logger.info("🏁 Starting Dr. ARIA — HealthOS Voice Doctor...")
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
