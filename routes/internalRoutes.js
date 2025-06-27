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
  addNewTeamMember,
  getTeamMembers,
  assignTicket,
  getAssignedTickets,
  ticketListUserWise,
  teamLogin,
  assignArticle,
  getAssignedArticles,
  handleAddCustomStatus,
  handleGetUnassignedArticles,
  getUserDetails,
  handleAddOutlet
} from "../controllers/internalController.js";
import requireSudo from "../middleware/internalMiddlewares.js";

const internalRouter = Router();

internalRouter.post("/stats", handleGetAllCount);
internalRouter.post("/users", getAllUsers);
internalRouter.post("/user-details" , getUserDetails);
internalRouter.get("/review/count", getReviewCounts);
internalRouter.patch("/complete-article", handleArticleMarkCompleted);
internalRouter.patch("/complete-topic", handleTopicMarkCompleted);
internalRouter.post("/outlet-list", getOutletList);
internalRouter.post("/send-message", handleSendTeamMessage);
internalRouter.post("/update-topic-suggestion", handleTopicSuggestion); // for approving or rejecting the title suggestion from the internal dashboard
internalRouter.get("/allMessageList", fetchAllUserMessageList);
internalRouter.post("/read-messsage", handleReadMessage);
internalRouter.post("/select-outlet", handleSelectOutlet);
internalRouter.post("/add-outlet", handleAddOutlet);

// Team Messages
internalRouter.post("/tickets", createTicket); // Create ticket
internalRouter.get("/tickets/single/:ticketId", getTicket); // Get ticket
internalRouter.get("/tickets", listTickets); // List tickets
internalRouter.get("/tickets-all", ticketListUserWise); // List tickets
internalRouter.get("/tickets/:ticketId/messages", getMessages); // Get messages of a ticket
internalRouter.post("/tickets/:ticketId/messages", postMessage); // Post message on a ticket
internalRouter.patch("/tickets/:ticketId/close", closeTicket); // Post message on a ticket

// tickets
internalRouter.post("/team/add", requireSudo, addNewTeamMember);
internalRouter.get("/team/members", getTeamMembers);
// assigned tickets
internalRouter.post("/tickets/:ticketId/assign", requireSudo, assignTicket);
internalRouter.post("/article/:articleId/assign", requireSudo, assignArticle);

// get assigned tickets to a user

internalRouter.get("/team/get-tickets", getAssignedTickets);
//get assigned articles to a user

internalRouter.get("/team/get-articles", getAssignedArticles);
internalRouter.get("/team/login", teamLogin);

// add extra status 
internalRouter.get("/team/unassigned" , handleGetUnassignedArticles)
internalRouter.post("/article/add-status", requireSudo, handleAddCustomStatus)

// assigned tickets
internalRouter.post("/tickets/:ticketId/assign", assignTicket);


export default internalRouter;
