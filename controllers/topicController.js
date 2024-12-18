import OpenAI from "openai"; // Assuming you have OpenAI set up
import articleModel from "../models/articleModels.js";
import topicModel from "../models/topicModel.js"; // Assuming you have a topicModel

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY || "your-openai-api-key", // Your OpenAI API key here
// });

export const handleTopicCreation = async (req, res) => {
  try {
    const { articleId } = req.body;

    // Find the article by ID
    const article = await articleModel.findOne({ _id: articleId });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.topics) {
      // Use findById to directly query by ObjectId
      const existingTopic = await topicModel.findOne({ _id: article.topics });

      // If topic found, return the topic
      if (existingTopic) {
        return res
          .status(200)
          .json({ message: "Success", topic: existingTopic });
      }
    }
    // Generate topics using OpenAI (or use placeholders for now)
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo", // or any other model
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "You are an AI that generates relevant topics based on an article's content.",
    //     },
    //     {
    //       role: "user",
    //       content: `Based on the following article, generate 3 relevant topics:
    //       ${article.value}`, // Assuming the article value is the text content of the article
    //     },
    //   ],
    //   max_tokens: 200, // Adjust token limit to ensure response is concise
    //   temperature: 0.7, // Moderate creativity for topic generation
    // });

    // // Extract topics from the OpenAI response (if available)
    // const generatedTopics = response.choices[0].message.content.trim().split("\n");

    // // If no topics are generated, fall back to placeholder topics
    // const topicsToSave = generatedTopics.length > 0 ? generatedTopics : ["Topic 1", "Topic 2", "Topic 3"];

    // Create a new Topic document with the list of generated topics
    const newTopic = await topicModel.create({
      topics: [
        { value: "Topic 1", updateRequested: false, verifyRequested: false },
        { value: "Topic 2", updateRequested: false, verifyRequested: false },
        { value: "Topic 3", updateRequested: false, verifyRequested: false },
      ], // Placeholder topics for now
    });

    // Update the article with the newly created Topic document's _id
    article.topics = newTopic._id; // Assuming the `topics` field in the article holds a single ObjectId
    await article.save();

    // Find the newly created topic from the topicModel
    const newTopicDetails = await topicModel.findById(newTopic._id);

    return res.status(200).json({ message: "Success", topic: newTopicDetails });
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
    const topic = await topicModel.findOne({ _id: topicId });

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
    console.log("topic",topicId,index)

    const topic = await topicModel.findOne({ "topics._id": topicId });
    console.log("topic",topic)
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
    const { topicId } = req.body; // Get topicId from the request body

    // Find the topic document by its ID
    const topic = await topicModel.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Topic document not found" });
    }

    // Set the `submitted` field to `true`
    topic.submitted = true;

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
