import mongoose from "mongoose";
import topicModel from "../models/topicModel.js"; // Assuming you have a topicModel
import openAi from "../openAi.js";
import { articleStatus } from "../utils.js";
import userModel from "../models/userModel.js";

export const handleTopicCreation = async (req, res) => {
  try {
    const { numberOfArticles, userId } = req.body;

    const user = await userModel
      .findById(userId)
      .select({
        "questionnaire.basicInformation": 1,
        "questionnaire.expertiseAndSkills": 1,
        "questionnaire.challengesAndGaps": 1,
        "questionnaire.impactAndAchievements": 1,
        "questionnaire.industryContextAndInsights": 1,
      })
      .populate("topics"); // Populating topics based on the virtual reference

    // Check if topics already exist for the user
    if (user.topics.length) {
      return res
        .status(200)
        .json({ message: "Topics found", data: user.topics });
    }

    const questions = [
      // Basic Information
      user.questionnaire.basicInformation[1].answer,
      user.questionnaire.basicInformation[2].answer,
      user.questionnaire.basicInformation[3].answer,

      //  Expertise And Skills
      user.questionnaire.expertiseAndSkills[1]?.answer,
      user.questionnaire.expertiseAndSkills[2]?.answer,
      user.questionnaire.expertiseAndSkills[3]?.answer,
      user.questionnaire.expertiseAndSkills[4]?.answer,
      user.questionnaire.expertiseAndSkills[5]?.answer,

      // Challenges And Gaps
      user.questionnaire.challengesAndGaps[1]?.answer,
      user.questionnaire.challengesAndGaps[2]?.answer,
      user.questionnaire.challengesAndGaps[3]?.answer,

      // Imapact And Achievements
      user.questionnaire.impactAndAchievements[1]?.answer,
      user.questionnaire.impactAndAchievements[2]?.answer,
      user.questionnaire.impactAndAchievements[3]?.answer,
      user.questionnaire.impactAndAchievements[4]?.answer,
      user.questionnaire.impactAndAchievements[5]?.answer,
      user.questionnaire.impactAndAchievements[6]?.answer,

      // Industry Context And Insights
      user.questionnaire.industryContextAndInsights[1]?.answer,
      user.questionnaire.industryContextAndInsights[2]?.answer,
      user.questionnaire.industryContextAndInsights[3]?.answer,
    ].filter((answer) => answer.length>4); // Filter out any empty answers

    const promptContent = `You are an AI that generates an array of 3 relevant article topics based on a question's content. Please avoid using numbers in the titles.
    Questions and answers:
    ${questions
      .map((answer, index) => `- Question-${index + 1}: ${answer}`)
      .join("\n")}`;

    // Generate topics for each article and save them
    for (let i = 0; i < numberOfArticles; i++) {
      // Generate topics for one article using OpenAI
      const response = await openAi.writer.chat.completions.create({
        model: "gpt-3.5-turbo", // Or "gpt-4" if you want to use GPT-4
        messages: [
          {
            role: "system",
            content: promptContent,
          },
          {
            role: "user",
            content: `Based on the above questions, generate 3 relevant topics. The output should be a list of strings like: ["topic", "topic", "topic"]`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      // Extract and clean the response
      let rawTopics = response.choices[0]?.message?.content?.trim();

      if (!rawTopics) {
        return res
          .status(400)
          .json({ message: "No topics generated by OpenAI" });
      }

      // Split by commas or newline and clean topics
      const cleanedTopics = rawTopics
        .replace(/[\[\]"]/g, "") // Remove square brackets and quotes
        .split(",") // Split by commas to get individual topics
        .map((line) => line.trim()) // Trim any extra spaces
        .filter((line) => line.length > 0); // Remove empty lines

      // If no valid topics are returned, use fallback topics
      const finalTopics = cleanedTopics.length
        ? cleanedTopics
        : [
            "Enhancing Memory Through Lifestyle Changes",
            "The Impact of Sleep on Memory Consolidation",
            "Cognitive Benefits of Physical and Mental Activities",
          ];

      // Prepare topics for saving (each topic will be an individual object)
      const topicData = finalTopics.map((topic) => ({
        value: topic,
        updateRequested: false,
        verifyRequested: false,
      }));

      // Save the topics for this specific article in the database
      await topicModel.create({
        userId,
        topics: topicData,
      });
    }

    const newTopic = await topicModel.find({ userId });

    return res
      .status(200)
      .json({ message: "Topics created successfully", topics: newTopic });
  } catch (error) {
    console.error("Error creating topics:", error.message);
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
    const topics = await topicModel.find({ userId });
    if (topics) {
      return res.status(200).json({ message: "Topics Found", data: topics });
    }
    throw new Error("No Topic Found For This User");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const handleTopicUpdate = async (req, res) => {
  try {
    const { topicId, index } = req.body;

    // Validate topicId (if you want to ensure it is a valid ObjectId format)
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ message: "Invalid topic ID" });
    }

    // Find the topic by ID
    const topic = await topicModel.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Extract the current topics
    const currentTopics = topic.topics;

    // Check if the index is valid
    if (index < 0 || index >= currentTopics.length) {
      return res.status(400).json({ message: "Invalid index" });
    }

    // Check if the topic is already marked for update
    if (currentTopics[index].updateRequested) {
      throw new Error("You can only update the topic once");
    }

    // Prepare the request for new suggested topics
    const response = await openAi.writer.chat.completions.create({
      model: "gpt-3.5-turbo", // Or "gpt-4" if you want to use GPT-4
      messages: [
        {
          role: "system",
          content: `You are an AI that generates a relevant topic based on the following content:
            Current Topic: ${currentTopics[index].value}`,
        },
        {
          role: "user",
          content:
            "Generate one new relevant 3 to 4 words topic to replace the current topic.  avoid using Topic:",
        },
      ],
      max_tokens: 50, // Increase token count for longer responses
      temperature: 0.7, // Adjust creativity level if necessary
    });

    // Clean up the response: remove unwanted characters and extract only the topic name
    const newTopic = response.choices[0].message.content.trim();

    // Remove the prefix "New Topic: " if it exists
    const cleanTopic = newTopic.replace(/^New Topic:\s*/, "");

    if (!cleanTopic) {
      return res
        .status(500)
        .json({ message: "Failed to generate a new topic" });
    }

    // Replace the old topic with the new one at the provided index
    currentTopics[index].value = cleanTopic;

    // Mark the topic as updated by setting `updateRequested` to true
    currentTopics[index].updateRequested = true;

    // Update the topic document in the database
    topic.topics = currentTopics;
    await topic.save();

    return res
      .status(200)
      .json({ message: "Topic updated successfully", data: topic });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
