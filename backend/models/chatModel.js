import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  // ✅ NEW FIELD: Link to a specific conversation
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "conversation",
    required: true,
    index: true,
  },

  role: {
    type: String,
    enum: ["user", "model"],
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chatModel;
