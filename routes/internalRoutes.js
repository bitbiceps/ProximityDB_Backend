import { Router } from "express";
import {
  getAllUsers,
  getOutletList,
  getReviewCounts,
  handleArticleMarkCompleted,
  handleGetAllCount,
  handleTopicMarkCompleted,
  handleSendTeamMessage,
  handleTopicSuggestion,
  fetchAllUserMessageList,
  handleReadMessage,
  handleSelectOutlet,
  createTicket,
  listTickets,
  getMessages,
  postMessage,
  closeTicket,
  getTicket,
} from "../controllers/internalController.js";

const internalRouter = Router();

internalRouter.get("/stats", handleGetAllCount);
internalRouter.get("/users", getAllUsers);
internalRouter.get("/review/count", getReviewCounts);
internalRouter.patch("/complete-article", handleArticleMarkCompleted);
internalRouter.patch("/complete-topic", handleTopicMarkCompleted);
internalRouter.post("/outlet-list", getOutletList);
internalRouter.post("/send-message", handleSendTeamMessage);
internalRouter.post("/update-topic-suggestion", handleTopicSuggestion); // for approving or rejecting the title suggestion from the internal dashboard
internalRouter.get("/allMessageList", fetchAllUserMessageList);
internalRouter.post("/read-messsage", handleReadMessage);
internalRouter.post("/select-outlet", handleSelectOutlet);

// Team Messages
internalRouter.post("/tickets", createTicket); // Create ticket
internalRouter.get("/tickets/single/:ticketId", getTicket); // Get ticket
internalRouter.get("/tickets", listTickets); // List tickets
internalRouter.get("/tickets/:ticketId/messages", getMessages); // Get messages of a ticket
internalRouter.post("/tickets/:ticketId/messages", postMessage); // Post message on a ticket
internalRouter.patch("/tickets/:ticketId/close", closeTicket); // Post message on a ticket

export default internalRouter;
