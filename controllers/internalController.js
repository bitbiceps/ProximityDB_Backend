import articleModel from "../models/articleModels.js";
import topicModel from "../models/topicModel.js";
import userModel from "../models/userModel.js";
import { articleStatus } from "../helpers/utils.js";
import createTask from "../helpers/clickUp.js";
import { socketEvents } from "../helpers/utils.js";
import io from "../server.js";
import { sendNotification } from "../server.js";
import {
  sendTopicVerifySuccessfully,
  sendArticleVerifySuccesfullly,
  sendWelcomeEmailToTeam,
} from "../helpers/mailer.js";
import MessageModel from "../models/messageModal.js";
import teamMessageModel from "../models/teamMessageModel.js";
import ticketModel from "../models/ticketModel.js";
import teamModel from "../models/teamModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const handleGetAllCount = async (req, res) => {
  try {
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Missing teamId in request body",
      });
    }

    const member = await teamModel.findById(teamId).select("role _id");
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    // Status constants
    const STATUS = {
      UNDER_REVIEW: "under review",
      PUBLISH: "publish",
      UNPUBLISH: "unpublish",
    };

    if (member.role === "sudo") {
      const results = await articleModel.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            unassigned: [{ $match: { assignee: null } }, { $count: "count" }],
            byStatus: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);

      const counts = {
        total: results[0].total[0]?.count || 0,
        unassigned: results[0].unassigned[0]?.count || 0,
        totalPublish:
          results[0].byStatus.find((s) => s._id === STATUS.PUBLISH)?.count || 0,
        underReview:
          results[0].byStatus.find((s) => s._id === STATUS.UNDER_REVIEW)
            ?.count || 0,
        unpublished:
          results[0].byStatus.find((s) => s._id === STATUS.UNPUBLISH)?.count ||
          0,
      };

      return res.status(200).json({
        success: true,
        message: "Dashboard counts fetched successfully",
        data: counts,
        role: member.role,
      });
    }

    const results = await articleModel.aggregate([
      {
        $match: {
          assignee: member._id,
          status: {
            $in: [STATUS.UNDER_REVIEW, STATUS.PUBLISH, STATUS.UNPUBLISH],
          },
        },
      },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          totalAssigned: [{ $count: "count" }],
        },
      },
    ]);

    const counts = {
      underReview: 0,
      publish: 0,
      unpublish: 0,
      totalAssigned: results[0].totalAssigned[0]?.count || 0,
    };

    results[0].byStatus.forEach(({ _id, count }) => {
      if (_id === STATUS.UNDER_REVIEW) counts.underReview = count;
      if (_id === STATUS.PUBLISH) counts.publish = count;
      if (_id === STATUS.UNPUBLISH) counts.unpublish = count;
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard counts fetched successfully",
      data: counts,
      role: member.role,
    });
  } catch (error) {
    console.error("Error fetching article counts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { teamId, role } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const usersWithArticles = await articleModel.distinct("userId");

    const totalUsers = await userModel.countDocuments({
      _id: { $in: usersWithArticles },
    });

    // Fetch users with articles using pagination
    const users = await userModel
      .find({ _id: { $in: usersWithArticles } })
      .select("-questionnaire")
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return res.status(200).json({
      message: "Successful",
      users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching users with articles:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getReviewCounts = async (req, res) => {
  try {
    const { userId } = req.query;
    // Get the count of articles with status "review"
    const articlesInReview = await articleModel.find({ userId });

    return res.status(200).json({
      message: "Counts fetched successfully",
      article: articlesInReview,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const handleArticleMarkCompleted = async (req, res) => {
  try {
    const { articleId } = req.body; // Get articleId from the request body

    // Find the article document by its ID

    // Handle case if article is not found
    const article = await articleModel.findById(articleId).populate("userId");
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Fetch user and topic in parallel (using article.userId and articleId)
    const [user, topic] = await Promise.all([
      userModel.findById(article.userId),
      topicModel.findById(article.topicId),
    ]);

    // Handle case if topic is not found
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Set the `submitted` field to true and `updateRequested` to false
    article.status = articleStatus.completed;
    article.updateRequested = false;
    topic.articleStatus = "completed";

    // Save the updated article and topic in parallel
    await Promise.all([article.save(), topic.save()]);

    // // Create a task for the user (assuming createTask is a function that sends data to some service)
    // await createTask(
    //   `${user.fullName} <Press> ${topic.finalTopic}`,
    //   // `${user.email}\n${article.value}`
    //   `${article.value} \n  **Selected Outlet :  ${article?.metaData?.selectedOutlet} **`
    // );

    const articleUrl = `${process.env.FRONTEND_URL_Sec}/generated_article?id=${articleId}`;

    sendNotification({
      userId: article?.userId?._id || article?.userId,
      message: "Article is verified successfully",
    });

    // await sendArticleVerifySuccesfullly(article.userId.email, articleUrl);

    return res.status(200).json({
      message: "Article marked completed",
      updatedArticle: article, // Return the updated article document
    });
  } catch (error) {
    console.error("Error submitting article:", error);
    return res.status(500).json({
      message: "Error submitting article",
      error: error.message,
    });
  }
};

export const handleTopicMarkCompleted = async (req, res) => {
  try {
    const { _id, index } = req.body; // Get the topic _id and index from the request body

    // Find the topic document by its _id
    const topic = await topicModel.findById(_id).populate("userId");

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Check if the provided index is valid
    if (index < 0 || index >= topic.topics.length) {
      return res.status(400).json({ message: "Invalid index provided" });
    }
    // Update the topic's status to "completed"
    topic.status = "completed"; // Or any status you want

    // Set the finalTopic to the value of the topic at the given index
    topic.finalTopic = topic.topics[index].value;

    // Save the updated topic document
    await topic.save();

    sendNotification({
      userId: topic?.userId?._id || topic?.userId,
      message: "Topic is verified successfully",
    });

    // await sendTopicVerifySuccessfully(
    //   topic.userId.email,
    //   topic.topics[index].value
    // );

    return res.status(200).json({
      message: "Topic marked as completed",
      data: topic, // Return the updated topic document
    });
  } catch (error) {
    console.error("Error marking topic as completed:", error);
    return res.status(500).json({
      message: "Error marking topic as completed",
      error: error.message,
    });
  }
};

export const getOutletList = async (req, res) => {
  try {
    // Add logic to decide outlet dynamically if necessary
    const outlets = ["Outlet 1", "Outlet 2", "Outlet 3"];
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ message: "Article ID is missing" });
    }

    // Fetch the article using await and ensure populate is correct
    const article = await articleModel.findById(articleId).populate("topicId");

    if (!article) {
      return res.status(404).json({ message: "Article does not exist" });
    }

    // Return the list of outlets along with the article data
    return res.status(200).json({ outlets, article });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: error.message });
  }
};

export const handleSendTeamMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res
        .status(400)
        .json({ message: "User ID and message are required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newMessage = new MessageModel({
      userId,
      content: message,
      messageType: "general",
      overview: "General Team Message",
    });

    await newMessage.save();

    return res.status(200).json({
      message: "Message sent successfully",
      savedMessage: newMessage,
    });
  } catch (error) {
    console.error("Error sending team message:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleTopicSuggestion = async (req, res) => {
  try {
    const { msgId, topicId, status, updatedTopic, content } = req.body;

    const topic = await topicModel.findById(topicId).populate("userId");

    if (!topic) {
      return res.status(400).json({ message: "Topic not found" });
    }

    const message = await MessageModel.findById(msgId);

    if (!message) {
      return res.status(400).json({ message: "Message not found" });
    }

    if (status === "approved" && updatedTopic) {
      topic.finalTopic = updatedTopic;
      const newTopic = {
        value: updatedTopic,
        updateRequested: false,
        verifyRequested: false,
      };
      topic.status = "completed";
      message.content = "Topic request is approved successfully";
      message.topicContent.topic = updatedTopic;
      message.topicContent.message = content;
      message.topicContent.status = "approved";
    }

    if (status === "rejected") {
      message.content = "Topic update request rejected";
      message.topicContent.status = "rejected";
    }

    // If status is "approved" or "rejected", remove the suggestion
    if (status === "approved" || status === "rejected") {
      topic.suggestion = null;
    }

    // Save the updated topic
    await topic.save();
    await message.save();

    return res.status(200).json({
      message: `Topic suggestion ${status} successfully`,
      updatedTopic: topic,
    });
  } catch (error) {
    console.error("Error handling topic suggestion:", error);
    return res.status(500).json({
      message: "Error processing topic suggestion",
      error: error.message,
    });
  }
};

export const fetchAllUserMessageList = async (req, res) => {
  try {
    const messagesByUsers = await MessageModel.aggregate([
      {
        $sort: { createdAt: -1 }, // Sort messages globally by latest createdAt
      },
      {
        $group: {
          _id: "$userId", // Group messages by userId
          messages: { $push: "$$ROOT" }, // Push all messages (latest first)
          latestMessageAt: { $first: "$createdAt" }, // Capture the latest message timestamp
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $project: {
          _id: 1,
          "userData._id": 1,
          "userData.email": 1,
          "userData.fullName": 1,
          messages: { $reverseArray: "$messages" }, // Reverse to get oldest-to-newest order
          latestMessageAt: 1,
        },
      },
      {
        $sort: { latestMessageAt: -1 }, // Sort users by latest message time (descending)
      },
    ]);

    return res.status(200).json({
      message: "User messages fetched successfully",
      data: messagesByUsers,
    });
  } catch (error) {
    console.error("Error fetching user messages:", error);
    return res.status(500).json({
      message: "Error fetching user messages",
      error: error.message,
    });
  }
};

export const handleReadMessage = async (req, res) => {
  try {
    const { userId } = req.body;
    const messagesToUpdate = await MessageModel.find({
      userId,
      status: "sent",
      read: false,
    }).sort({ createdAt: -1 }); // Sort by latest first

    if (!messagesToUpdate.length) {
      return res.status(200).json({ message: "No unread sent messages found" });
    }

    // Extract message IDs
    const messageIds = messagesToUpdate.map((msg) => msg._id);

    // Update all found messages to mark them as read
    await MessageModel.updateMany(
      { _id: { $in: messageIds } },
      { $set: { read: true } }
    );

    return res.status(200).json({
      message: `Marked ${messageIds.length} messages as read successfully`,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleSelectOutlet = async (req, res) => {
  try {
    const { outlet_name, articleId } = req.body;

    const article = await articleModel.findByIdAndUpdate(
      articleId,
      { "metaData.selectedOutlet": outlet_name },
      { new: true } // Returns the updated document
    );

    if (!article) {
      return res.status(400).json({ message: "Article not found" });
    }

    res.status(200).json({ message: "Outlet selected successfully", article });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { userId, subject, subTopic = "", description } = req.body;

    if (!userId || !subject) {
      return res.status(400).json({ error: "userId and subject are required" });
    }

    // Check existing open/pending tickets count
    const openTicketsCount = await ticketModel.countDocuments({
      userId,
      status: { $in: ["open", "pending"] },
    });

    if (openTicketsCount >= 3) {
      return res.status(400).json({
        message:
          "You already have 3 open or pending tickets. Please close some before creating new ones.",
      });
    }

    const ticket = await ticketModel.create({
      userId,
      subject,
      description,
      subTopic,
      status: "open", // Set default status
    });

    if (description) {
      await teamMessageModel.create({
        ticketId: ticket._id,
        senderId: userId,
        senderRole: 'user', // Assuming the creator is a user
        text: description,
        readBy: [userId],
      });
    }

    res.status(201).json({ message: "Ticket created", ticket });
  } catch (err) {
    console.error("createTicket error:", err);
    res.status(500).json({
      message: "Failed to create ticket",
      details: err.message,
    });
  }
};

export const getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({ error: "ticketId is required" });
    }

    const ticket = await ticketModel.findById(ticketId);

    res.status(201).json({ message: "Ticket fetched", ticket });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to get ticket", details: err.message });
  }
};

// List tickets (all for team, or user-specific)
export const listTickets = async (req, res) => {
  try {
    const { userId, isTeam } = req.query;

    if (!isTeam && !userId) {
      return res
        .status(400)
        .json({ error: "userId is required if not fetching for team" });
    }

    const tickets =
      isTeam === "true"
        ? await ticketModel.find().sort({ updtedAt: -1 })
        : await ticketModel.find({ userId }).sort({ updatedAt: -1 });

    res.status(200).json(tickets);
  } catch (err) {
    console.error("listTickets error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch tickets", details: err.message });
  }
};

// Get messages for a ticket
export const getMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({ error: "ticketId is required" });
    }

    const messages = await teamMessageModel
      .find({ ticketId })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch messages", details: err.message });
  }
};

// Post a message on a ticket
export const postMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { senderId, senderRole, text } = req.body;

    // 🚨 Validate required fields

    if (![ticketId, senderId, senderRole, text].every(Boolean)) {
      return res.status(400).json({
        error: "ticketId, senderId, senderRole, and text are required",
      });
    }

    // 💬 Create the message
    const newMessage = await teamMessageModel.create({
      ticketId,
      senderId,
      senderRole,
      text,
      readBy: [senderId],
    });

    // 📨 Fetch all messages for this ticket, sorted chronologically
    const allMessages = await teamMessageModel
      .find({ ticketId })
      .sort({ createdAt: 1 });

    // ✅ Success response
    res.status(201).json({
      message: "Message posted successfully",
      newMessage,
      allMessages,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to send message",
      details: err.message,
    });
  }
};

// Close a ticket
export const closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({ error: "ticketId is required" });
    }

    const ticket = await ticketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.status === "closed") {
      return res.status(400).json({ error: "Ticket is already closed" });
    }

    ticket.status = "closed";
    ticket.updatedAt = new Date();

    await ticket.save();

    res.status(200).json({ message: "Ticket closed successfully", ticket });
  } catch (err) {
    console.error("closeTicket error:", err);
    res
      .status(500)
      .json({ error: "Failed to close ticket", details: err.message });
  }
};

export const addNewTeamMember = async (req, res) => {
  const { username, email, role } = req.body;

  if (!username || !email || !role) {
    return res
      .status(400)
      .json({ message: "Username , email  and role are required" });
  }

  try {
    const exists = await teamModel.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Team member already exists" });

    const newMember = new teamModel({ username, email, role });
    await newMember.save();

    const token = jwt.sign(
      {
        id: newMember._id,
        email: email,
        role: role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    sendWelcomeEmailToTeam(email , token);

    res.status(201).json({ message: "Team member added", member: newMember });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating team member", error: err.message });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    // First get all team members
    const members = await teamModel.find(
      {},
      "username email role createdAt _id"
    );

    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const totalAssigned = await articleModel.countDocuments({
          assignee: member._id,
        });

        const totalPublished = await articleModel.countDocuments({
          assignee: member._id,
          status: "publish", // assuming you have a status field
        });

        return {
          ...member.toObject(), // convert mongoose doc to plain object
          totalAssigned,
          totalPublished,
        };
      })
    );

    res.status(200).json({ members: membersWithStats });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching team members",
      error: err.message,
    });
  }
};

export const assignTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const assignee = await teamModel.findOne({ username });
    if (!assignee) {
      return res.status(404).json({ message: "Team member not found" });
    }

    const ticket = await ticketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update current assignee
    ticket.assignee = assignee._id;

    // Add assignment to history
    ticket.assignmentHistory.push({
      assignedTo: assignee._id,
      assignedBy: req.user?._id || null, // assumes requireSudo attaches req.user
      assignedAt: new Date(),
    });

    await ticket.save();

    res.status(200).json({
      message: `Ticket assigned to ${username}`,
      ticket,
    });
  } catch (err) {
    console.error("Error assigning ticket:", err);
    res.status(500).json({
      message: "Error assigning ticket",
      error: err.message,
    });
  }
};

export const getAssignedTickets = async (req, res) => {
  const email = req.headers["internal-user-email"];
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!email) {
    return res.status(400).json({ message: "Missing x-user-email header" });
  }

  try {
    const member = await teamModel.findOne({ email: email.toLowerCase() });
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    let query = {};
    if (member.role === "team") {
      query.assignee = member._id;
    }

    const totalTickets = await ticketModel.countDocuments(query);
    const tickets = await ticketModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "email") // who created the ticket
      .populate("assignee", "username email"); // who's assigned

    res.status(200).json({
      message:
        member.role === "sudo"
          ? "All tickets"
          : `Tickets assigned to ${member.username}`,
      total: totalTickets,
      page,
      pageSize: limit,
      tickets,
    });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: err.message,
    });
  }
};

export const ticketListUserWise = async (req, res) => {
  try {
    const tickets = await ticketModel
      .find({ status: { $ne: "closed" } })
      .sort({ createdAt: -1 });
    // Get all unique user IDs from the tickets
    const userIds = [
      ...new Set(tickets.map((t) => t.userId?.toString()).filter(Boolean)),
    ];

    // Fetch all users in one query
    const users = await userModel
      .find({
        _id: { $in: userIds },
      })
      .select("fullName email"); // Select only needed fields

    // Create a map for quick user lookup
    const userMap = new Map();
    users.forEach((user) => {
      userMap.set(user._id.toString(), {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      });
    });

    // Group tickets by user
    const resultMap = new Map();

    // Initialize with found users
    users.forEach((user) => {
      const userIdStr = user._id.toString();
      resultMap.set(userIdStr, {
        userDetails: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
        ticketData: [],
      });
    });

    // Assign tickets to users
    tickets.forEach((ticket) => {
      if (!ticket.userId) {
        return;
      }

      const userIdStr = ticket.userId.toString();
      const userGroup = resultMap.get(userIdStr);

      if (userGroup) {
        userGroup.ticketData.push({
          _id: ticket._id,
          subject: ticket.subject,
          subTopic: ticket.subTopic,
          description: ticket.description,
          status: ticket.status,
          ticketId: ticket.ticketId,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        });
      }
    });

    // Convert to array and filter out empty groups
    const result = Array.from(resultMap.values()).filter(
      (group) => group.ticketData.length > 0
    );

    result.sort((a, b) => {
      const aLatest = new Date(a.ticketData[0]?.createdAt).getTime();
      const bLatest = new Date(b.ticketData[0]?.createdAt).getTime();
      return bLatest - aLatest;
    });

    return res.status(200).json({
      message: "Tickets fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("listTickets error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch tickets", details: err.message });
  }
};

export const teamLogin = async (req, res) => {
  const email = req.headers["internal-user-email"];
  const { password } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Missing internal-user-email header" });
  }

  try {
    const member = await teamModel
      .findOne({ email: email.toLowerCase() })
      .populate("profileImage")
      .lean();

    if (!member) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Not a team member" });
    }

    // Check if password is set
    if (!member.password) {
      return res.status(403).json({
        success: false,
        message: "Please set up your password first",
        needsPasswordSetup: true,
      });
    }

    // If password is provided in request but user has no password set
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {...member},
    });
  } catch (error) {
    console.error("Team login failed:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

export const assignArticle = async (req, res) => {
  const { articleId } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const assignee = await teamModel.findOne({ username });
    if (!assignee) {
      return res.status(404).json({ message: "Team member not found" });
    }

    const article = await articleModel.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Update current assignee
    article.assignee = assignee._id;

    // Add assignment to history
    article.assignmentHistory.push({
      assignedTo: assignee._id,
      assignedBy: req.user?._id || null, // assumes requireSudo attaches req.user
      assignedAt: new Date(),
    });

    await article.save();

    res.status(200).json({
      message: `Article assigned to ${username}`,
      article,
    });
  } catch (err) {
    console.error("Error assigning article:", err);
    res.status(500).json({
      message: "Error assigning article",
      error: err.message,
    });
  }
};
export const getAssignedArticles = async (req, res) => {
  const email = req.headers["internal-user-email"];
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!email) {
    return res.status(400).json({ message: "Missing x-user-email header" });
  }

  try {
    const member = await teamModel.findOne({ email: email.toLowerCase() });
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    let query = {};
    if (member.role === "team") {
      query.assignee = member._id;
    }

    const totalArticles = await articleModel.countDocuments(query);
    const articles = await articleModel
      .find(query)
      .select("status userId assignee")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select:
          "email fullName phoneNumber gender role dateOfBirth profileImage",
        populate: {
          path: "profileImage",
          select: "filepath",
        },
      });

    return await res.status(200).json({
      message:
        member.role === "sudo"
          ? "All Articles"
          : `Articles assigned to ${member.username}`,
      total: totalArticles,
      page,
      pageSize: limit,
      articles,
    });
  } catch (err) {
    console.error("Error fetching Articles:", err);
    res.status(500).json({
      message: "Failed to fetch Articles",
      error: err.message,
    });
  }
};

export const handleAddCustomStatus = async (req, res) => {
  const { status, articleId } = req.body;

  if (!status || typeof status !== "string" || !articleId) {
    return res
      .status(400)
      .json({ message: "Status and articleId are required" });
  }
  try {
    const updatedArticle = await articleModel.findByIdAndUpdate(
      articleId,
      { $addToSet: { extraStatus: status } }, // use $addToSet to avoid duplicates
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }
    return res
      .status(200)
      .json({ message: "Status added", article: updatedArticle });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const handleGetUnassignedArticles = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
  const skip = (page - 1) * limit;

  try {
    const totalUnassigned = await articleModel.countDocuments({
      assignee: null,
    });

    const articles = await articleModel
      .find({ assignee: null }) // Only unassigned articles
      .select("status userId createdAt") // Include createdAt for reference
      .sort({ createdAt: -1 }) // Latest first
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select: "fullName email",
      });

    return res.status(200).json({
      success: true,
      message: "Unassigned articles fetched successfully",
      data: {
        articles: articles,
        pagination: {
          total: totalUnassigned,
          page,
          pageSize: limit,
          totalPages: Math.ceil(totalUnassigned / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching unassigned articles:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unassigned articles",
      error: error.message,
    });
  }
};
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userModel
      .findById(userId)
      .select("fullName email gender phoneNumber profileImage dateOfBirth")
      .populate({
        path: "profileImage",
        select: "filepath",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [totalArticles, publishedArticles] = await Promise.all([
      articleModel.countDocuments({ userId }),
      articleModel.countDocuments({
        userId,
        status: "publish",
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          fullName: user.fullName,
          dateOfBirth: user.dateOfBirth,
          email: user.email,
          gender: user.gender,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage?.filepath || null,
        },
        articleStats: {
          total: totalArticles,
          published: publishedArticles,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const handleAddOutlet = async (req, res) => {
  const { outletName, articleId } = req.body;
  if (!outletName || !articleId) {
    return res
      .status(400)
      .json({ message: "Outlet name and article ID are required" });
  }
  try {
    const article = await articleModel.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    const newOutlet = {
      Outlets_Name: outletName,
    };

    article.metaData.outlets.push(newOutlet);
    await article.save();

    return res
      .status(200)
      .json({ message: "Outlet added successfully", article });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const handleUpdateTeamProfile = async (req, res) => {
  try {
    const { team, phone, dob, gender } = req.body;

    if (!team) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    const updatedTeam = await teamModel.findByIdAndUpdate(
      team,
      {
        phone,
        dob,
        gender,
      },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.status(200).json({
      message: "Team profile updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Error updating team profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleGetTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    const team = await teamModel
      .findById(teamId)
      .populate("profileImage")
      .lean();

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.status(200).json({ data: team });
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleSetPasswordTeam = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const team = await teamModel.findById(decoded.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update team password
    team.password = hashedPassword;
    await team.save();

    return res.status(200).json({
      success: true,
      message: "Password set successfully",
    });
  } catch (error) {
    console.error("Error setting team password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { password, email } = req.body;
    if (!password) {
      return res.status(400).json({ message: "New password cannot be empty." });
    }

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email cannot be empty." });
    }

    // Find the userModel by email
    const user = await teamModel.findOne({ email });

    // If userModel is not found
    if (!user) {
      return res.status(404).json({ message: "user not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the userModel's password
    user.password = hashedPassword;

    // Save the updated userModel
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    // Handle any errors
    return res
      .status(500)
      .json({ error: "Failed to change password. " + error.message });
  }
};