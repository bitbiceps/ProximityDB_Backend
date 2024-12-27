import articleModel from "../models/articleModels.js";
import topicModel from "../models/topicModel.js";
import { articleStatus } from "../utils.js";

export const handleGetAllCount = async (req, res) => {
  try {
    // Aggregation to count documents by status
    const statusCounts = await articleModel.aggregate([
      {
        $group: {
          _id: "$status", // Group by 'status' field
          count: { $sum: 1 }, // Sum the count for each status
        },
      },
    ]);

    // Initialize the response object
    const count = {};

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
    return res
      .status(200)
      .json({ message: "Success Fetching Article Stats", data: count });
  } catch (error) {
    // Log the error and respond with a failure message
    console.error("Error fetching article counts:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const handleArticleMarkCompleted = async (req, res) => {
  try {
    const { articleId } = req.body; // Get articleId from the request parameters

    // Find the article document by its ID
    const article = await articleModel.findOne({ _id: articleId });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Set the `submitted` field to true and `updateRequested` to false
    article.status = articleStatus.completed;
    article.updateRequested = false;

    // Save the updated article
    await article.save();

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
    const { _id, index } = req.body; // Get articleId from the request parameters

    // Find the article document by its ID
    const topic = await topicModel.findById({ _id });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Set the `submitted` field to true and `updateRequested` to false
    topic.status = articleStatus.completed;
    topic.finalTopic = index;

    // Save the updated article
    await topic.save();

    return res.status(200).json({
      message: "Topic marked completed",
      data: topic, // Return the updated article document
    });
  } catch (error) {
    console.error("Error submitting topic:", error);
    return res
      .status(500)
      .json({ message: "Error submitting topic", error: error.message });
  }
};
