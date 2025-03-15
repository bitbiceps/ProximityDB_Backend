import articleModel from "../models/articleModels.js";
import topicModel from "../models/topicModel.js";
import userModel from "../models/userModel.js";
import { articleStatus } from "../helpers/utils.js";
import { socketEvents } from "../helpers/utils.js";
import io from "../server.js";
import { sendTopicVerifySuccessfully , sendArticleVerifySuccesfullly } from "../helpers/mailer.js";

export const handleGetAllCount = async (req, res) => {
  try {
    // Aggregation to count documents by status from both articleModel and topicModel
    const statusCounts = await articleModel.aggregate([
      // Combine with topicModel collection
      {
        $unionWith: {
          coll: "topics", // Correct the name of the collection (ensure it is lowercase if it's `topics`)
        },
      },
      {
        $group: {
          _id: "$status", // Group by the 'status' field
          count: { $sum: 1 }, // Count the documents for each status
        },
      },
    ]);

    // Initialize the response object with default values
    const count = {
      pending: { count: 0, rise: 8.5 },
      review: { count: 0, rise: 8.5 },
      completed: { count: 0, rise: 8.5 },
    };

    // Default rise value
    const riseValue = 8.5;

    // Process the aggregation result and assign to the count object
    statusCounts.forEach((status) => {
      if (status._id === articleStatus.pending) {
        count.pending = { count: status.count, rise: riseValue };
      } else if (status._id === articleStatus.inReview) {
        count.review = { count: status.count, rise: riseValue };
      } else if (status._id === articleStatus.completed) {
        count.completed = { count: status.count, rise: riseValue };
      }
    });

    // Send back the result as a JSON response
    return res.status(200).json({
      message: "Success Fetching Article and Topic Stats",
      data: count,
    });
  } catch (error) {
    // Log the error and respond with a failure message
    console.error("Error fetching article and topic counts:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    // Get the total number of users using the faster estimatedDocumentCount
    const totalUsers = await userModel.estimatedDocumentCount();

    // Fetch users based on page and limit using range-based pagination
    let users;
    if (page > 1) {
      const lastUser = await userModel
        .find()
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(1);
      if (lastUser.length > 0) {
        const lastUserId = lastUser[0]._id;
        users = await userModel.find({ _id: { $gt: lastUserId } }).limit(limit);
      }
    } else {
      users = await userModel.find().limit(limit);
    }

    if (users.length > 0) {
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
    }

    throw new Error("No users found");
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: error.message });
  }
};

export const getReviewCounts = async (req, res) => {
  try {
    const { userId } = req.query;
    // Get the count of articles with status "review"
    const articlesInReview = await articleModel.find({
      userId,
    });

    // Get the count of topics with status "review"
    const topicsInReview = await topicModel.find({
      userId,
    });

    return res.status(200).json({
      message: "Counts fetched successfully",
      count:
        parseInt(articlesInReview.length) + parseInt(topicsInReview.length),
      topics: topicsInReview,
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
    const { articleId } = req.body; // Get articleId from the request parameters

    // Find the article document by its ID
    const article = await articleModel.findOne({ _id: articleId }).populate('userId');
    const topic = await topicModel.findOne({ articleId });
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Set the `submitted` field to true and `updateRequested` to false
    article.status = articleStatus.completed;
    article.updateRequested = false;
    topic.articleStatus = "completed";
    // Save the updated article
    await topic.save();
    await article.save();

    io.emit(socketEvents.TEST__BROADCAST, {
    message: "Article is verified successfully",
   });

    await sendArticleVerifySuccesfullly(article.userId.email)

    return res.status(200).json({
      message: "Article marked completed",
      updatedArticle: article, // Return the updated article document
    });
  } catch (error) {
    console.error("Error submitting article:", error);
    return res
      .status(500)
      .json({ message: "Error submitting article", error: error.message });
  }
};

export const handleTopicMarkCompleted = async (req, res) => {
  try {
    const { _id, index } = req.body; // Get the topic _id and index from the request body

    // Find the topic document by its _id
    const topic = await topicModel.findById(_id).populate('userId');

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

    io.emit(socketEvents.TEST__BROADCAST, {
        message: "Topic is verified successfully",
    });

    await sendTopicVerifySuccessfully(topic.userId.email , topic.topics[index].value )

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
    const { userId, message , date} = req.body;

    if (!userId || !message || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newReply = {
      message,
      createdAt: new Date(date),
    };

    user.teamReply.unshift(newReply);
    await user.save();

    return res.status(200).json({ message: "Message sent successfully", teamReply: newReply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleTopicSuggestion = async (req, res) => {
  try {
    const { topicId, status } = req.body;

    const topic = await topicModel.findById(topicId).populate('userId');

    if (!topic) {
      return res.status(400).json({ message: "Topic not found" });
    }

    if (status === "approved" && topic.suggestion?.topic) {
      topic.finalTopic = topic.suggestion.topic;
      const newTopic = {
        value: topic.suggestion.topic,
        updateRequested: false,
        verifyRequested: false,
      };
      topic.status = "completed";
      topic.topics.push(newTopic);

      const newReply = {
        message: `Your title has been approved: ${topic.suggestion.topic}`,
        createdAt: new Date(),
      };

      if (topic.userId) {
        topic.userId.teamReply.unshift(newReply); // Update teamReply array
        await topic.userId.save(); // Explicitly save the user document
      }
    }

    // If status is "approved" or "rejected", remove the suggestion
    if (status === "approved" || status === "rejected") {
      topic.suggestion = null;
    }

    // Save the updated topic
    await topic.save();

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

