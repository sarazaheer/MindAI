import axios from "axios";
import chatModel from "../models/chatModel.js";
import conversationModel from "../models/conversationModel.js";

const pythonUrl = "http://127.0.0.1:5000/chat";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Detects the specific error signatures of a Render free-tier service
// that's asleep or mid-cold-start: an explicit 502/503 from Render's
// proxy, OR a connection-level failure (no response at all) if the
// service hasn't started listening yet. Previously only 502/503 were
// checked, missing the "not listening yet" case entirely.
const isColdStartError = (error) => {
  const status = error.response?.status;
  if (status === 502 || status === 503) return true;
  if (error.code === "ECONNABORTED") return true; // our own timeout
  if (!error.response) return true; // ECONNREFUSED, ECONNRESET, DNS, etc.
  return false;
};

async function callPython(payload) {
  // Render free-tier cold starts can take 30-60+ seconds for a service
  // this heavy (Flask + LangChain + Gemini SDK). The previous version
  // retried exactly once after an 8-second wait — nowhere near enough,
  // so the retry itself usually failed too. This now retries up to 3
  // times with increasing delays (10s, 20s, 30s = up to ~60s of total
  // patience) before finally giving up.
  const retryDelaysMs = [10000, 20000, 30000];

  let lastError;
  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt++) {
    try {
      return await axios.post(pythonUrl, payload, {
        timeout: 60000,
      });
    } catch (error) {
      lastError = error;

      if (attempt < retryDelaysMs.length && isColdStartError(error)) {
        const delay = retryDelaysMs[attempt];
        console.log(
          `Python service unreachable (attempt ${attempt + 1}). Retrying in ${
            delay / 1000
          }s...`,
        );
        await sleep(delay);
        continue;
      }

      throw lastError;
    }
  }
}

// 1. CHAT WITH BOT
export const chatWithBot = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.userId;

    if (!message?.trim()) {
      return res.status(400).json({
        reply: "Message cannot be empty.",
      });
    }

    let currentConversationId = conversationId;
    let isNewConversation = false;
    let newConversationTitle = "New Chat";

    // Create new conversation if needed
    if (!currentConversationId) {
      newConversationTitle =
        message.substring(0, 30) + (message.length > 30 ? "..." : "");

      const newConv = await conversationModel.create({
        userId,
        title: newConversationTitle,
        updatedAt: Date.now(),
      });

      currentConversationId = newConv._id;
      isNewConversation = true;
    } else {
      await conversationModel.findByIdAndUpdate(currentConversationId, {
        updatedAt: Date.now(),
      });
    }

    // Save user message
    await chatModel.create({
      userId,
      conversationId: currentConversationId,
      role: "user",
      content: message,
    });

    // Current conversation history
    const currentChats = await chatModel
      .find({ conversationId: currentConversationId })
      .sort({ timestamp: -1 })
      .limit(10);

    // Long-term memory
    const pastChats = await chatModel
      .find({
        userId,
        conversationId: { $ne: currentConversationId },
      })
      .sort({ timestamp: -1 })
      .limit(20);

    // Merge history
    const combinedChats = [...pastChats.reverse(), ...currentChats.reverse()];

    const historyForAi = combinedChats.map((chat) => ({
      role: chat.role === "user" ? "user" : "assistant",
      content: chat.content,
    }));

    // Call Python AI service
    const response = await callPython({
      message,
      history: historyForAi,
    });

    const botReply = response.data.reply || "No response from MindAI.";

    // Save bot response
    await chatModel.create({
      userId,
      conversationId: currentConversationId,
      role: "model",
      content: botReply,
    });

    // Return response
    res.json({
      reply: botReply,
      conversationId: currentConversationId,
      isNew: isNewConversation,
      title: newConversationTitle,
    });
  } catch (error) {
    console.error("========== CHAT ERROR ==========");
    console.error(error);

    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);

    // Slightly friendlier messaging: since a cold start can now take up
    // to ~60s of retrying before we give up, tell the user it's worth
    // trying again shortly rather than implying something is broken.
    const isColdStart =
      !error.response || [502, 503].includes(error.response?.status);

    return res.status(500).json({
      success: false,
      reply: isColdStart
        ? "MindAI is starting up. Please try sending your message again in a moment."
        : "Error processing chat.",
    });
  }
};

// 2. GET SIDEBAR (All Conversations)
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await conversationModel
      .find({ userId })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// 3. GET MESSAGES (Specific Conversation)
export const getMessagesByConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;

    const messages = await chatModel
      .find({ userId, conversationId })
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// 4. DELETE A CONVERSATION (and all its messages)
export const deleteConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;

    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      return res.json({ success: false, message: "Conversation not found" });
    }
    // Ownership check — same pattern as appointment cancellation: a user
    // should only ever be able to delete their OWN conversations.
    if (conversation.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    await conversationModel.findByIdAndDelete(conversationId);
    await chatModel.deleteMany({ conversationId });

    res.json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 5. RENAME A CONVERSATION
export const renameConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { title } = req.body;

    if (!title?.trim()) {
      return res.json({ success: false, message: "Title cannot be empty" });
    }

    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      return res.json({ success: false, message: "Conversation not found" });
    }
    if (conversation.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    conversation.title = title.trim().substring(0, 60);
    await conversation.save();

    res.json({
      success: true,
      message: "Conversation renamed",
      title: conversation.title,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
