import articleModel from "../models/articleModels.js";
import topicModel from "../models/topicModel.js"; // Assuming you have a topicModel
import openAi from "../openAi.js";
import { articleStatus } from "../utils.js";

export const handleTopicCreation = async (req, res) => {
  try {
    const {
      numberOfArticles,
      userId,
      question1,
      question2,
      question3,
      question4,
      question5,
      question6,
      question7,
      question8,
    } = req.body;

    // Find the article by ID
    const topic = await topicModel.find({ userId });

    if (topic.length) {
      return res.status(200).json({ message: "Topics found", data: topic });
    }

    for (let i = 0; i < numberOfArticles; i++) {
      const response = await openAi.writer.chat.completions.create({
        model: "gpt-3.5-turbo", // Or "gpt-4" if you want to use GPT-4
        messages: [
          {
            role: "system",
            content: `You are an AI that generates an array of 3 relevant topics based on an questions content. Please avoid using numbers in the topics.
                Question 1: ${question1}
              Question 2: ${question2}
              Question 3: ${question3}
              Question 4: ${question4}
              Question 5: ${question5}
              Question 6: ${question6}
              Question 7: ${question7}
              Question 8: ${question8}
              `,
          },
          {
            role: "user",
            content: `Based on the following questions, generate 3 relevant 
        -It should be list of strings for example ["topic","topic","topic"]
        topics`, // Assuming article.value is the content
          },
        ],
        max_tokens: 100, // Increase token count for longer responses
        temperature: 0.7, // Adjust creativity level if necessary
      });

      // Clean up the response: remove unwanted characters and split into topics
      const rawTopics = response.choices[0].message.content.trim().split("\n");

      const cleanedTopics = rawTopics
        .map((line) => line.trim()) // Trim spaces
        .filter((line) => line && !line.toLowerCase().includes("topics:")) // Remove empty or "topics:" lines
        .map((line) => line.replace(/^[\d\-\.\s]+/, "")); // Remove leading numbers and dashes

      // If no valid topics are generated, use placeholders
      const finalTopics = cleanedTopics.length
        ? cleanedTopics
        : [
            "Enhancing Memory Through Lifestyle Changes",
            "The Impact of Sleep on Memory Consolidation",
            "Cognitive Benefits of Physical and Mental Activities",
          ];

      await topicModel.create({
        userId,
        topics: JSON.parse(finalTopics[0]).map((topic) => ({
          value: topic,
          updateRequested: false,
          verifyRequested: false,
        })),
      });
    }

    // Find the newly created topic from the topicModel
    const newTopicDetails = await topicModel.find({ userId });

    return res.status(200).json({ message: "Success", data: newTopicDetails });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const getTopicById = async (req, res) => {
  try {
    // Extract the topicId from the query parameter
    const { topicId } = req.query;

    // Validate the topicId
    if (!topicId) {
      return res.status(400).json({ message: "Topic ID is required" });
    }

    // Find the topic by topicId in the database
    const topic = await topicModel.findOne({ _id: topicId });

    if (!topic) {
      return res.status(404).json({ message: "Something went wrong" });
    }

    // Return the topic if found
    return res.status(200).json({ message: "Success", topic });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error retrieving topic", error: error.message });
  }
};

export const handleUpdateTopicRequest = async (req, res) => {
  try {
    const { topicId, index } = req.body; // Get topicId and index from params

    // Find the topic document by its ID
    const topic = await topicModel.findOne({ "topics._id": topicId });

    if (!topic) {
      return res.status(404).json({ message: "Topic document not found" });
    }

    // Check if the index is within the valid range of the `topics` array
    if (index < 0 || index >= topic.topics.length) {
      return res.status(400).json({ message: "Invalid index" });
    }

    // Find the topic at the given index in the `topics` array
    const topicToUpdate = topic.topics[index];

    // Toggle the `updateRequested` field of the found topic

    console.log(topicToUpdate);
    topicToUpdate.updateRequested = !topicToUpdate.updateRequested;

    // Save the updated topic document
    await topic.save();

    return res.status(200).json({
      message: "Topic updateRequested status toggled successfully",
      updatedTopic: topicToUpdate, // Return the updated topic object
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    return res
      .status(500)
      .json({ message: "Error updating topic", error: error.message });
  }
};

export const handleVerifyTopicRequest = async (req, res) => {
  try {
    const { topicId, index } = req.body; // Get topicId and index from body

    // Find the topic document by its ID
    console.log("topic", topicId, index);

    const topic = await topicModel.findOne({ "topics._id": topicId });
    console.log("topic", topic);
    if (!topic) {
      return res.status(404).json({ message: "Topic document not found" });
    }

    // Check if the index is within the valid range of the `topics` array
    if (index < 0 || index >= topic.topics.length) {
      return res.status(400).json({ message: "Invalid index" });
    }

    // Find the topic at the given index in the `topics` array
    const topicToUpdate = topic.topics[index];

    // Toggle the `verifyRequested` field of the found topic
    topicToUpdate.updateRequested = false;
    topicToUpdate.verifyRequested = true;

    // Save the updated topic document
    await topic.save();

    return res.status(200).json({
      message: "Topic verifyRequested status toggled successfully",
      updatedTopic: topicToUpdate, // Return the updated topic object
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    return res
      .status(500)
      .json({ message: "Error updating topic", error: error.message });
  }
};

export const handleUpdateSuggestion = async (req, res) => {
  try {
    const { topicId, suggestion } = req.body; // Get topicId and suggestion from the request body
    console.log("fghjk", topicId, suggestion);
    // Find the topic document by its ID
    const topic = await topicModel.findOne({ _id: topicId });

    if (!topic) {
      return res.status(404).json({ message: "Topic document not found" });
    }

    // Update the suggestion field of the found topic
    topic.suggestion = suggestion || ""; // Set the suggestion to the value passed, or default to an empty string

    // Save the updated topic document
    await topic.save();

    return res.status(200).json({
      message: "Suggestion updated successfully",
      updatedTopic: topic, // Return the updated topic document
    });
  } catch (error) {
    console.error("Error updating suggestion:", error);
    return res
      .status(500)
      .json({ message: "Error updating suggestion", error: error.message });
  }
};

export const handleSubmitTopic = async (req, res) => {
  try {
    const { _id } = req.body; // Get topicId from the request body
    const topic = await topicModel.findById(_id);

    if (!topic) {
      return res.status(404).json({ message: "Topic document not found" });
    }

    // Set the `submitted` field to `true`
    topic.status = articleStatus.inReview;

    // Reset the `updateRequested` and `verifyRequested` fields for all topics in the `topics` array
    topic.topics.forEach((t) => {
      t.updateRequested = false;
      t.verifyRequested = false;
    });

    // Set the suggestion to `null`
    topic.suggestion = null;

    // Save the updated topic document
    await topic.save();

    return res.status(200).json({
      message: "Topic submitted successfully",
      updatedTopic: topic, // Return the updated topic document
    });
  } catch (error) {
    console.error("Error submitting topic:", error);
    return res
      .status(500)
      .json({ message: "Error submitting topic", error: error.message });
  }
};

export const getAllTopics = async (req, res) => {
  try {
    const { userId } = req.query; // Correct usage of req.params
    console.log("useR", userId);
    const topics = await topicModel.find({ userId });
    if (topics) {
      return res.status(200).json({ message: "Topics Found", data: topics });
    }
    throw new Error("No Topic Found For This User");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
