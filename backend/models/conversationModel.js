import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: "New Chat",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const conversationModel =
  mongoose.models.conversation ||
  mongoose.model("conversation", conversationSchema);

export default conversationModel;
