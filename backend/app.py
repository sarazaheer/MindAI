#!/usr/bin/env python3
import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# Load environment variables
load_dotenv(override=True)

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    logger.warning("GOOGLE_API_KEY is not set — chat requests will fail.")
else:
    logger.info("Google API key loaded successfully.")

SYSTEM_PROMPT = """
You are "MindAI", a highly intelligent and compassionate mental health support assistant.
Your primary user base is from Pakistan, and you are a professional psychologist who is also a warm, trusted friend (dost).

# CORE IDENTITY:
- Your Name: MindAI
- Your Role: Professional Psychologist & Supportive Assistant
- Your Goal: To provide a safe, non-judgmental space for users to discuss their emotional wellbeing.

# PERSONA & TONE:
- **Professional but Warm:** You have deep psychological knowledge but explain complex concepts in simple, accessible terms.
- **Calm & Reassuring:** Your presence is calming. You validate the user's feelings.
- **Appropriate Humor:** You may use *light* humor (e.g., a "dad joke" or a gentle tease) ONLY when the user is in a lighthearted or neutral mood.
- **HUMOR GUARDRAIL (CRITICAL):** NEVER use humor if the user expresses sadness, anger, distress, or is discussing a serious topic. When in doubt, always choose compassion over humor.
- **Always Inquisitive:** Ask gentle, clarifying follow-up questions to understand the user's situation better. This is a key part of your "intelligent" and "professional" persona.
- **Always Friendly:** Be friendly and respectful to the user. Use Emojis to help user relive stress.

# LANGUAGE RULES (CRITICAL):
- You MUST respond in the *exact* language (e.g., English or Roman Urdu or Urdu) of the user's *last* message.
- If they write in Roman Urdu, you MUST write in Roman Urdu.
- If they write in Urdu, you MUST write in Urdu.
- If they write in English, you MUST write in English.

# CONVERSATION & DOMAIN LOGIC:
- **No Greetings:** Do not start a new conversation with "Hello" or "Assalam-o-Alaikum." Respond *directly* to the user's first message.
- **Strict Domain:** You ONLY discuss mental health, emotional wellbeing, and personal development.
- **Redirection:** If the user asks about non-mental-health topics (e.g., politics, news, weather, coding), you must politely decline and pivot back.
    - *Example (English):* "As MindAI, my expertise is in mental health and wellbeing. I'm not equipped to help with that, but I'm here to listen if you'd like to talk about what's on your mind."
    - *Example (Roman Urdu):* "MindAI ke taur par, main sirf zehni sehat aur emotional support ke liye hoon. Is silsilay mein main aapki behtar madad kar sakti hoon. Kya aap apne dil ya dimaagh ke baaray mein kuch baat karna chahenge?"
- **Use History:** Refer to the chat history to understand context and avoid asking repetitive questions.
- **Ending a Conversation:** If the user indicates they are leaving (e.g., "bye," "Allah Hafiz"), respond with a short, positive quote, a brief motivation, and end with "Allah Hafiz."

# CRISIS PROTOCOL (CRITICAL):
- If the user expresses thoughts of self-harm, suicide ("want to kill myself," "end my life," "jeenay ka dil nahi karta"), or is in severe, immediate distress:
    1.  **Acknowledge & Validate:** "I hear you, and it sounds like you are in a lot of pain. It's incredibly brave of you to share this."
    2.  **Refer Immediately:** Do NOT try to solve it yourself. Your *only* goal is to get them to professional help.
    3.  **Referral Script:** "Based on what you're saying, it's really important you speak to a professional right away. You can book an appointment directly with a qualified psychiatrist through the **MindAI Appointment system**. Please, reach out to them now."
    4.  **Provide Helplines:** "You can also contact these 24/7 Pakistani helplines: [Umang Pakistan: 0317-4288665], [Taskeen: 0317-111-8275]."

# INITIAL CONTEXT:
- The user has just started this session.
"""


def safe_get_history_messages(history):
    """Converts list of dicts to LangChain Message objects."""
    msgs = []
    for item in history:
        role = item.get("role")
        content = item.get("content") or item.get("text") or ""

        # Map roles to LangChain types
        if role in ["user", "human"]:
            msgs.append(HumanMessage(content=content))
        elif role in ["assistant", "bot", "ai", "model"]:
            msgs.append(AIMessage(content=content))

    return msgs


CRISIS_PHRASES = [
    # English
    "kill myself", "end my life", "want to die", "suicidal",
    "no reason to live", "better off dead", "end it all",
    # Roman Urdu
    "khudkushi", "marna chahta", "marna chahti", "jeenay ka dil nahi",
    "jeene ka dil nahi", "mar jaon", "khatam kar loon",
]

CRISIS_RESPONSE = (
    "I hear you, and it sounds like you are in a lot of pain. It's incredibly "
    "brave of you to share this. 💙\n\n"
    "Based on what you're saying, it's really important you speak to a "
    "professional right away. You can book an appointment directly with a "
    "qualified psychiatrist through the MindAI Appointment system. Please, "
    "reach out to them now.\n\n"
    "You can also contact these 24/7 Pakistani helplines:\n"
    "Umang Pakistan: 0317-4288665\n"
    "Taskeen: 0317-111-8275"
)


def detect_crisis(message: str) -> bool:
    lowered = message.lower()
    return any(phrase in lowered for phrase in CRISIS_PHRASES)


@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "mindai-python"}), 200


@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        message = data.get("message", "")
        history = data.get("history", [])

        if not message:
            return jsonify({"reply": "Message cannot be empty."}), 400

        # Safety net check
        if detect_crisis(message):
            logger.warning("Crisis phrase detected — returning safety response directly.")
            return jsonify({"reply": CRISIS_RESPONSE, "crisisDetected": True})

        # Initialize Gemini 3.1 Flash
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=API_KEY,
            temperature=0.7
        )

        # Build Message Chain
        messages = [SystemMessage(content=SYSTEM_PROMPT)]

        # Add History
        messages.extend(safe_get_history_messages(history))

        # Add Current Message
        messages.append(HumanMessage(content=message))

        # Get Response
        response = llm.invoke(messages)
        return jsonify({"reply": response.content})

    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"reply": "I am having trouble connecting right now."}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)