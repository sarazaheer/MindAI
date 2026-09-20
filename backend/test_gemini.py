import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# Load environment variables from .env file
load_dotenv()

# Ensure API key is set in the environment
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("Google API key not found. Please set GOOGLE_API_KEY environment variable.")

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)

# Test request
response = llm.invoke([HumanMessage(content="Hey Gemini, say hello in a cool way!")])

print("Gemini Response:")
print(response.content)