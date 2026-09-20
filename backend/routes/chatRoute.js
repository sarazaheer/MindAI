import express from "express";
import {
  chatWithBot,
  getConversations,
  getMessagesByConversation,
  deleteConversation,
  renameConversation,
} from "../controllers/chatController.js";
import authUser from "../middlewares/authUser.js";

const chatRouter = express.Router();

// Send Message (Create new chat or add to existing)
chatRouter.post("/", authUser, chatWithBot);

// Get Sidebar List (All conversations for user)
chatRouter.get("/conversations", authUser, getConversations);

// Get Specific Chat History (When clicking a sidebar item)
chatRouter.get("/:conversationId", authUser, getMessagesByConversation);

chatRouter.delete(
  "/conversation/:conversationId",
  authUser,
  deleteConversation,
);
chatRouter.put("/conversation/:conversationId", authUser, renameConversation);

export default chatRouter;
