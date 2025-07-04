import articleModel from "../models/articleModels.js";
import openAi from "../helpers/openAi.js";
import topicModel from "../models/topicModel.js";
import userModel from "../models/userModel.js";
import { articleStatus, determineBestOutlets } from "../helpers/utils.js";
import io from "../server.js";
import { sendNotification } from "../server.js";
import MessageModel from "../models/messageModal.js";
import mongoose from "mongoose";
import teamModel from "../models/teamModel.js";

// Function to handle questionnaire and generate articles
export const handleQuestionnaire = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if articles exist for the user
    const articlesList = await articleModel.find({ userId });

    if (articlesList.length > 0) {
      return res.status(200).json({
        message: "Articles found for this user",
        articles: articlesList,
      });
    } else {
      // If no articles exist, create new ones
      await handleCreateArticles(req.body); // Pass entire req.body
    }

    // Query the articles again after creation
    const newArticlesList = await articleModel.find({ userId });

    return res.status(200).json({
      message: "Articles generated successfully",
      articles: newArticlesList,
    });
  } catch (error) {
    console.error("Error in handleQuestionnaire:", error);
    res.status(500).json({
      message: "Error submitting questionnaire",
      error: error.message,
    });
  }
};
export const handleGetApprovedTopics = async (req, res) => {
  const { userId } = req.body;

  try {
    // Fetch topics with status "submitted" and non-null finalTopic
    const approvedTopics = await topicModel.find({
      userId,
      status: "submitted",
      finalTopic: { $ne: null }, // Ensure finalTopic is not null
    });

    return res.status(200).json({ approvedTopics });
  } catch (error) {
    console.error("Error fetching approved topics:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleCreateArticles = async (req, res) => {
  const { _id: topicId, userId } = req.body;

  const saveArticles = await articleModel
    .findOne({ topicId })
    .populate("profileImage topicId");

  try {
    const user = await userModel
      .findById(userId)
      .select({
        "questionnaire.basicInformation": 1,
        "questionnaire.expertiseAndSkills": 1,
        "questionnaire.challengesAndGaps": 1,
        "questionnaire.impactAndAchievements": 1,
        "questionnaire.industryContextAndInsights": 1,
      })
      .populate("topics");

    if (saveArticles && saveArticles?.value != "") {
      return res.status(200).json(saveArticles);
    } else {
      const article = await topicModel.findOne({ _id: topicId });

      // Retrieve the questionnaire answers from the user
      const questions = [
        user.questionnaire.basicInformation[1].answer,
        user.questionnaire.basicInformation[2].answer,
        user.questionnaire.basicInformation[3].answer,

        user.questionnaire.expertiseAndSkills[1]?.answer,
        user.questionnaire.expertiseAndSkills[2]?.answer,
        user.questionnaire.expertiseAndSkills[3]?.answer,
        user.questionnaire.expertiseAndSkills[4]?.answer,

        user.questionnaire.challengesAndGaps[1]?.answer,
        user.questionnaire.challengesAndGaps[2]?.answer,
        user.questionnaire.challengesAndGaps[3]?.answer,

        user.questionnaire.impactAndAchievements[1]?.answer,
        user.questionnaire.impactAndAchievements[2]?.answer,
        user.questionnaire.impactAndAchievements[3]?.answer,
        user.questionnaire.impactAndAchievements[4]?.answer,
        user.questionnaire.impactAndAchievements[5]?.answer,
        user.questionnaire.impactAndAchievements[6]?.answer,

        user.questionnaire.industryContextAndInsights[1]?.answer,
        user.questionnaire.industryContextAndInsights[2]?.answer,
        user.questionnaire.industryContextAndInsights[3]?.answer,
      ].filter((answer) => answer.length > 4);
      const promptContent = `You are an AI article writer. Please generate a well-structured and insightful article for the user based on the following questionnaire answers. The article should be professional, informative, and engaging, reflecting the user's expertise and practical experience in the topic of: "${article.finalTopic
        }".

      Here are the user's answers to the questionnaire:
      
      ${questions
          .map((answer, index) => `- **Question-${index + 1}:** ${answer}`)
          .join("\n")}
      
      The article should include:
      1. **A well-organized structure**: Divide the content into logical sections such as an introduction, core insights, challenges, solutions, and a conclusion. Ensure each section flows naturally into the next for better readability.
      2. **Relevant details and examples**: Integrate the key insights and examples provided by the user to demonstrate their expertise. Ensure that these details are practical, real-world, and tailored to the topic at hand.
      3. **Clarity and coherence**: Avoid jargon and complex phrases that could confuse the reader. Use simple, concise sentences and clear transitions between ideas to maintain a smooth narrative.
      4. **No HTML tags**: Keep the content free of HTML tags, focusing purely on textual content that’s easily readable.
      5. **Professional and knowledgeable tone**: Write in a manner that reflects the user’s expertise and thought leadership in the field. The tone should be authoritative yet accessible.
      6. **Highlight user expertise**: Throughout the article, emphasize the insights, knowledge, and experience shared by the user. This should reflect the user’s in-depth understanding of the subject.
      7. **Core aspects of the topic**: Ensure the article addresses the main points of the topic, diving into key trends, challenges, or solutions related to **${article.finalTopic
        }**.
      8. **Actionable takeaways and conclusion**: End the article with a concise summary of key insights. Provide actionable takeaways or recommendations that will add value for the reader, enabling them to apply the knowledge gained.
      
      The article should be informative, engaging, and provide valuable insights for the audience, ensuring that the user's perspective shines through as an expert on the topic.`;

      // Generate the article content using OpenAI
      const response = await openAi.writer.chat.completions.create({
        model: openAi.model,
        messages: [
          {
            role: "system",
            content: promptContent,
          },
          {
            role: "user",
            content: `Generate a detailed article based on the following questionnaire answers. The article should align with the topic: "${article.finalTopic}" and reflect the user's professional insights: "${user.fullName}"`,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      // Extract the generated content
      const generatedContent = response.choices[0].message.content.trim();

      // Create a new article with the generated content
      const newArticle = {
        value: generatedContent,
        topicId: topicId,
        userId,
      };

      // Save the new article in the database
      await articleModel.create(newArticle);

      const newObj = await articleModel
        .findOne({ topicId })
        .populate("profileImage topicId");
      article.articleId = newObj._id;
      await article.save();

      return res.status(200).json(newObj);
    }
  } catch (error) {
    console.error("Error generating articles:", error);
    return res.status(500).json({
      message: "An error occurred while generating the article",
      error: error.message,
    });
  }
};

export const handleArticleUpdateRequested = async (req, res) => {
  const { articleId, content } = req.body; // Destructure request body

  // Validate the input data
  if (!articleId || !content) {
    return res
      .status(400)
      .json({ message: "articleId and content are required" });
  }

  try {
    // Attempt to update the article directly
    const article = await articleModel.findByIdAndUpdate(
      articleId,
      { updateRequested: true, updatedContent: content },
      { new: true } // Returns the updated document
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Return the updated article document
    return res.status(200).json({
      message: "Article updateRequested status toggled successfully",
      article,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return res.status(500).json({
      message: "Error toggling updateRequested",
      error: error.message,
    });
  }
};

// content update

export const handleArticleContentUpdate = async (req, res) => {
  const { articleId, content } = req.body;

  if (!articleId || !content) {
    return res
      .status(400)
      .json({ message: "articleId and content are required" });
  }

  try {
    const currentArticle = await articleModel.findById(articleId);
    
    if (!currentArticle) {
      return res.status(404).json({ message: "Article not found" });
    }
    const updatedArticle = await articleModel.findByIdAndUpdate(
      articleId,
      { 
        updateRequested: false,
        prevContent: currentArticle.value,
        value: content
      },
      { new: true }
    );


    const newMessage = await MessageModel.create({
      userId: currentArticle?.userId,
      messageType: "article_update",
      articleId,
      content: "Article is updated successfully",
    });

    sendNotification({
      userId: currentArticle?.userId,
      message: "Article Updated succesfully",
    });

    return res.status(200).json({
      message: "Article content updated successfully",
      article: updatedArticle,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return res.status(500).json({
      message: "Error updating article content",
      error: error.message,
    });
  }
};

export const handleArticleFileNameUpdate = async (req, res) => {
  const { articleId, fileName } = req.body;

  if (!articleId || !fileName) {
    return res
      .status(400)
      .json({ message: "articleId and FileName are required" });
  }

  try {
    const article = await articleModel.findByIdAndUpdate(
      articleId,
      { fileName: fileName },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    sendNotification({
      userId: article?.userId,
      message: "Article FileName Updated succesfully",
    });

    return res.status(200).json({
      message: "Article filename updated successfully",
      article,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return res.status(500).json({
      message: "Error updating article filename",
      error: error.message,
    });
  }
};

// submit

export const handleSubmitArticle = async (req, res) => {
  try {
    const { articleId, termsAndCondition, companyName, authorName } = req.body;

    // Fetch the article, topic, and user in parallel
    const [article, topic] = await Promise.all([
      articleModel.findOne({ _id: articleId }),
      topicModel.findOne({ articleId }),
    ]);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Update the article and topic
    article.status = "review";
    article.updateRequested = false;
    article.metaData = {
      ...article.metaData,
      termsAndCondition,
      companyName,
      authorName,
    };
    topic.articleStatus = "review";

    // Fetch the user and update their review count
    const user = await userModel.findById(article.userId);
    if (user) {
      user.numberOfReviews += 1;
      // Save the article, topic, and user in parallel
      await Promise.all([article.save(), topic.save(), user.save()]);
    } else {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Article submitted for review",
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

export const handleArticleMarkCompleted = async (req, res) => {
  try {
    const { articleId } = req.body; // Get articleId from the request parameters

    // Find the article document by its ID
    const article = await articleModel.findOne({ _id: articleId });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Set the submitted field to true and updateRequested to false
    article.status = "completed";
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

export const handleGetArticles = async (req, res) => {
  try {
    // Assuming userId is sent as a query parameter
    const { userId } = req.query; // Or req.body.userId depending on how the request is made

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Find all articles associated with the userId
    const articles = await articleModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .populate("profileImage");

    if (!articles.length) {
      return res
        .status(404)
        .json({ message: "No articles found for this user" });
    }

    // Return the found articles
    return res.status(200).json({ message: "Success", articles });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const handleGetArticlesById = async (req, res) => {
  try {
    // Assuming userId is sent as a query parameter
    const { articleId } = req.body; // Or req.body.userId depending on how the request is made

    if (!articleId) {
      return res.status(400).json({ message: "articleId is required" });
    }

    // Find all articles associated with the userId
    const article = await articleModel
      .findById(articleId)
      .populate("profileImage") 
      .populate({
        path: "userId",
        select: "email fullName",
      });

    if (!article) {
      return res
        .status(404)
        .json({ message: "No articles found for this user" });
    }

    // Return the found articles
    return res.status(200).json({ message: "Success", article });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const handleArticleDelete = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!articleId) {
      return res.status(400).json({ message: "articleId is required" });
    }

    // Find all articles associated with the userId
    const article = await articleModel.findById(articleId);

    if (!article) {
      return res
        .status(404)
        .json({ message: "No articles found for this user" });
    }

    await articleModel.deleteOne({ _id: articleId });

    return res.status(200).json({ message: "article deleted successfully" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const determineBestOutletsForArticle = async (req, res) => {
  const { articleId } = req.body;

  if (!articleId) {
    return res.status(400).json({ message: "Article ID is required" });
  }

  try {
    let article = await articleModel.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

  if (article.metaData?.outlets && article.metaData.outlets.length > 0) {
      return res.status(200).json({
        message: "Best outlets already determined",
        articleId: article._id,
        bestOutlets: article.metaData.outlets,
      });
    }


    const bestOutlets = await determineBestOutlets(article.value);

    article = await articleModel.findByIdAndUpdate(
      articleId,
      { $set: { "metaData.outlets": bestOutlets } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Best outlets determined successfully",
      articleId: article._id,
      bestOutlets,
    });
  } catch (error) {
    console.error("Error determining best outlets:", error);
    return res.status(500).json({
      message: "An error occurred while determining the best outlets",
      error: error.message,
    });
  }
};

export const handleGenerateArticle = async (req, res) => {
  const { userId, topic } = req.body;
    const existingArticles = await articleModel.find({
      userId,
      status: { $ne: 'publish' } 
    });

    if (existingArticles.length > 0) {
      return res.status(400).json({
        message: "Cannot generate new article. You already have an active (unpublished) article.",
        existingArticleId: existingArticles[0]._id
      });
    }


  try {
    const user = await userModel.findById(userId).select({
      "questionnaire.basicInformation": 1,
      "questionnaire.expertiseAndSkills": 1,
      "questionnaire.challengesAndGaps": 1,
      "questionnaire.impactAndAchievements": 1,
      "questionnaire.industryContextAndInsights": 1,
      fullName: 1,
    });

    // Retrieve the questionnaire answers from the user
    const questions = [
      {
        question: user.questionnaire.basicInformation[1].question,
        answer: user.questionnaire.basicInformation[1].answer,
      },
      {
        question: user.questionnaire.basicInformation[2].question,
        answer: user.questionnaire.basicInformation[2].answer,
      },
      {
        question: user.questionnaire.basicInformation[3].question,
        answer: user.questionnaire.basicInformation[3].answer,
      },
      {
        question: user.questionnaire.expertiseAndSkills[1]?.question,
        answer: user.questionnaire.expertiseAndSkills[1]?.answer,
      },
      {
        question: user.questionnaire.expertiseAndSkills[2]?.question,
        answer: user.questionnaire.expertiseAndSkills[2]?.answer,
      },
      {
        question: user.questionnaire.expertiseAndSkills[3]?.question,
        answer: user.questionnaire.expertiseAndSkills[3]?.answer,
      },
      {
        question: user.questionnaire.expertiseAndSkills[4]?.question,
        answer: user.questionnaire.expertiseAndSkills[4]?.answer,
      },
      {
        question: user.questionnaire.challengesAndGaps[1]?.question,
        answer: user.questionnaire.challengesAndGaps[1]?.answer,
      },
      {
        question: user.questionnaire.challengesAndGaps[2]?.question,
        answer: user.questionnaire.challengesAndGaps[2]?.answer,
      },
      {
        question: user.questionnaire.challengesAndGaps[3]?.question,
        answer: user.questionnaire.challengesAndGaps[3]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[1]?.question,
        answer: user.questionnaire.impactAndAchievements[1]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[2]?.question,
        answer: user.questionnaire.impactAndAchievements[2]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[3]?.question,
        answer: user.questionnaire.impactAndAchievements[3]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[4]?.question,
        answer: user.questionnaire.impactAndAchievements[4]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[5]?.question,
        answer: user.questionnaire.impactAndAchievements[5]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[6]?.question,
        answer: user.questionnaire.impactAndAchievements[6]?.answer,
      },
      {
        question: user.questionnaire.industryContextAndInsights[1]?.question,
        answer: user.questionnaire.industryContextAndInsights[1]?.answer,
      },
      {
        question: user.questionnaire.industryContextAndInsights[2]?.question,
        answer: user.questionnaire.industryContextAndInsights[2]?.answer,
      },
      {
        question: user.questionnaire.industryContextAndInsights[3]?.question,
        answer: user.questionnaire.industryContextAndInsights[3]?.answer,
      },
    ].filter((entry) => entry.answer && entry.answer.length > 4);

    const userPlaceholder = user.fullName || "user";

    // Single API call to generate the article
    const promptContent = `
        **Objective:**  
        Write a professional, engaging, and insightful article about the topic: **${topic}**.  
        The article must strictly include the user's answers and refer to them naturally throughout the content.  
        Maintain a balance of **60% topic focus and 40% user focus**.  
        Write in the **third person**, referring to the user by their name (${userPlaceholder}). Do not use "I" or "me."

          **Instructions:**  
        1. Start with a compelling introduction to the topic and its significance in the industry.  
        2. Introduce ${userPlaceholder} naturally, mentioning their role and background.  
        3. Use the user's answers to highlight their expertise, challenges, and contributions.  
        4. Refer to ${userPlaceholder} by name throughout the article. Do not use "I" or "me."  
        5. Provide knowledgeable insights about the topic while integrating the user's answers.  
        6. Conclude with actionable takeaways for professionals in the field.  

        **User Information:**  
        - Name: ${userPlaceholder}  
        - Role: ${user.questionnaire.basicInformation[2].answer}  
        - Company/Organization: ${user.questionnaire.basicInformation[3].answer
      }  

        **User Responses:**  
        ${questions
        .map(
          (item, index) =>
            `- **Question-${index + 1}:** ${item.question}\n  **Answer:** ${item.answer
            }`
        )
        .join("\n\n")}
      `;

    const response = await openAi.writer.chat.completions.create({
      model: openAi.model,
      messages: [
        {
          role: "system",
          content: promptContent,
        },
        {
          role: "user",
          content: promptContent,
        },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const finalArticle = response.choices[0].message.content.trim();

    const newArticle = {
      value: finalArticle,
      userId,
      selectedTopic: topic,
      fileName: topic,
    };

    const createdArticle = await articleModel.create(newArticle);

    const responseJson = {
      ...newArticle,
      _id: createdArticle?._id,
    };

    return res.status(200).json(responseJson);
  } catch (error) {
    console.error("Error generating articles:", error);
    return res.status(500).json({
      message: "An error occurred while generating the article",
      error: error.message,
    });
  }
};

export const handleCreateArticlesSecond = async (req, res) => {
  const { topicId, userId } = req.body;

  try {
    // const topicDoc = await topicModel.findOne({ "topics._id": topicId });
    const topicDoc = await topicModel.findById(topicId);

    if (!topicDoc) {
      return res.status(404).json({ message: "Topic document not found" });
    }

    // Step 2: Find the actual topic object inside the array
    // const matchedTopic = topicDoc.topics.find(
    //   (topic) => topic._id.toString() === topicId
    // );

    // if (!matchedTopic) {
    //   return res
    //     .status(400)
    //     .json({ message: "No matching topic found in array" });
    // }

    if (!topicDoc.finalTopic) {
      return res
        .status(400)
        .json({ message: "Please get your topics verified" });
    }

    // // Step 3: Set finalTopic = matchedTopic.value
    // topicDoc.finalTopic = matchedTopic.value;
    // topicDoc.status = articleStatus.completed;
    // await topicDoc.save();

    // Step 4: Check if article already exists
    const existingArticle = await articleModel
      .findOne({ topicId: topicDoc._id.toString() })
      .populate("profileImage topicId");

    if (existingArticle && existingArticle?.value !== "") {
      return res.status(200).json(existingArticle);
    }

    // Step 5: Get user details
    const user = await userModel
      .findById(userId)
      .select({
        "questionnaire.basicInformation": 1,
        "questionnaire.expertiseAndSkills": 1,
        "questionnaire.challengesAndGaps": 1,
        "questionnaire.impactAndAchievements": 1,
        "questionnaire.industryContextAndInsights": 1,
        fullName: 1,
      })
      .populate("topics");

    // Step 6: Map questions from user profile
    const questions = [
      {
        question: user.questionnaire.basicInformation[1].question,
        answer: user.questionnaire.basicInformation[1].answer,
      },
      {
        question: user.questionnaire.basicInformation[2].question,
        answer: user.questionnaire.basicInformation[2].answer,
      },
      {
        question: user.questionnaire.basicInformation[3].question,
        answer: user.questionnaire.basicInformation[3].answer,
      },
      {
        question: user.questionnaire.expertiseAndSkills[1]?.question,
        answer: user.questionnaire.expertiseAndSkills[1]?.answer,
      },
      {
        question: user.questionnaire.expertiseAndSkills[2]?.question,
        answer: user.questionnaire.expertiseAndSkills[2]?.answer,
      },
      {
        question: user.questionnaire.expertiseAndSkills[3]?.question,
        answer: user.questionnaire.expertiseAndSkills[3]?.answer,
      },
      {
        question: user.questionnaire.expertiseAndSkills[4]?.question,
        answer: user.questionnaire.expertiseAndSkills[4]?.answer,
      },
      {
        question: user.questionnaire.challengesAndGaps[1]?.question,
        answer: user.questionnaire.challengesAndGaps[1]?.answer,
      },
      {
        question: user.questionnaire.challengesAndGaps[2]?.question,
        answer: user.questionnaire.challengesAndGaps[2]?.answer,
      },
      {
        question: user.questionnaire.challengesAndGaps[3]?.question,
        answer: user.questionnaire.challengesAndGaps[3]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[1]?.question,
        answer: user.questionnaire.impactAndAchievements[1]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[2]?.question,
        answer: user.questionnaire.impactAndAchievements[2]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[3]?.question,
        answer: user.questionnaire.impactAndAchievements[3]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[4]?.question,
        answer: user.questionnaire.impactAndAchievements[4]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[5]?.question,
        answer: user.questionnaire.impactAndAchievements[5]?.answer,
      },
      {
        question: user.questionnaire.impactAndAchievements[6]?.question,
        answer: user.questionnaire.impactAndAchievements[6]?.answer,
      },
      {
        question: user.questionnaire.industryContextAndInsights[1]?.question,
        answer: user.questionnaire.industryContextAndInsights[1]?.answer,
      },
      {
        question: user.questionnaire.industryContextAndInsights[2]?.question,
        answer: user.questionnaire.industryContextAndInsights[2]?.answer,
      },
      {
        question: user.questionnaire.industryContextAndInsights[3]?.question,
        answer: user.questionnaire.industryContextAndInsights[3]?.answer,
      },
    ].filter((entry) => entry.answer && entry.answer.length > 4);

    const userPlaceholder = user.fullName || "user";

    // Step 7: Generate prompt content
    const promptContent = `
**Objective:**  
Write a professional, engaging, and insightful article about the topic: **${topicDoc.finalTopic
      }** and do not include the article title at the start of the article.  
The article must strictly include the user's answers and refer to them naturally throughout the content.  
Maintain a balance of **60% topic focus and 40% user focus**.  
Write in the **third person**, referring to the user by their name (${userPlaceholder}). Do not use "I" or "me."

**Instructions:**  
1. Start with a compelling introduction to the topic and its significance in the industry.  
2. Introduce ${userPlaceholder} naturally, mentioning their role and background.  
3. Use the user's answers to highlight their expertise, challenges, and contributions.  
4. Refer to ${userPlaceholder} by name throughout the article. Do not use "I" or "me."  
5. Provide knowledgeable insights about the topic while integrating the user's answers.  
6. Conclude with actionable takeaways for professionals in the field.  

**User Information:**  
- Name: ${userPlaceholder}  
- Role: ${user.questionnaire.basicInformation[2].answer}  
- Company/Organization: ${user.questionnaire.basicInformation[3].answer}  

**User Responses:**  
${questions
        .map(
          (item, index) =>
            `- **Question-${index + 1}:** ${item.question}\n  **Answer:** ${item.answer
            }`
        )
        .join("\n\n")}
`;

    // Step 8: Call OpenAI to generate article
    const response = await openAi.writer.chat.completions.create({
      model: openAi.model,
      messages: [
        {
          role: "system",
          content: promptContent,
        },
        {
          role: "user",
          content: promptContent,
        },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const finalArticle = response.choices[0].message.content.trim();

    // Step 9: Save article
    const newArticle = await articleModel.create({
      value: finalArticle,
      topicId: topicDoc._id,
      userId,
      selectedTopic: topicDoc.finalTopic,
      fileName: topicDoc.finalTopic,
    });

    // Step 10: Link articleId back to topicDoc
    topicDoc.articleId = newArticle._id;
    await topicDoc.save();

    const populatedArticle = await articleModel
      .findById(newArticle._id)
      .populate("profileImage topicId");

    return res.status(200).json(populatedArticle);
  } catch (error) {
    console.error("Error generating articles:", error);
    return res.status(500).json({
      message: "An error occurred while generating the article",
      error: error.message,
    });
  }
};

export const handleArticleStatusUpdate = async (req, res) => {
  const { articleId , status } = req.body;
  if (!articleId) {
    return res.status(400).json({ message: "articleId are required" });
  }
  try {
    const article = await articleModel.findByIdAndUpdate(
      articleId,
      { status: status },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    sendNotification({
      userId: article?.userId,
      message: "Article submitted succesfully",
    });

    return res.status(200).json({
      message: "Article submitted successfully",
      article,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return res.status(500).json({
      message: "Error updating article content",
      error: error.message,
    });
  }
};

export const handleArticleRegenerate = async (req, res) => {
  try {
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ message: "articleId is required" });
    }

    // Find the existing article
    const existingArticle = await articleModel.findById(articleId);

    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Create the regeneration prompt
    const regenerationPrompt = `
Please rewrite and improve the following professional article while maintaining all key information and tone
Imporntant: Don't include the article title at the start of the article.Just give the content.
Focus on:
1. Enhancing clarity and flow
2. Improving readability while keeping the professional tone
3. Maintaining all key points and technical accuracy
4. Ensuring smooth transitions between sections

Here is the current article content:
${existingArticle.value}
`;

    // Call OpenAI to regenerate article
    const response = await openAi.writer.chat.completions.create({
      model: openAi.model,
      messages: [
        {
          role: "system",
          content:
            "You are a professional editor that improves articles while preserving their core content.",
        },
        {
          role: "user",
          content: regenerationPrompt,
        },
      ],
      max_tokens: 1500, // Slightly higher to allow for improvements
      temperature: 0.5, // Lower temperature for more conservative rewrites
    });

    const regeneratedArticle = response.choices[0].message.content.trim();

    existingArticle.value = regeneratedArticle;
    await existingArticle.save();

    return res.status(200).json(existingArticle);
  } catch (error) {
    console.error("Error regenerating article:", error);
    return res.status(500).json({
      message: "An error occurred while regenerating the article",
      error: error.message,
    });
  }
};

export const handleGetActiveArticles = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const user = await userModel.findById(userId);
    const articleAllowance = user?.articleCount || 0;

    const activeArticles = await articleModel.countDocuments({ 
      status: { $ne: "publish" }, 
      userId: userId 
    });

    const totalArticlesCreated = await articleModel.countDocuments({ 
      userId: userId 
    });


    const remainingArticles = Math.max(0, articleAllowance - totalArticlesCreated);

    return res.status(200).json({ 
      message: "Success", 
      activeArticles,
      articleAllowance,
      remainingArticles 
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ 
      message: "An error occurred", 
      error: error.message 
    });
  }
};


export const getUserArticleStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get daily published article counts
    const dailyData = await articleModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: 'publish',
          createdAt: {
            $gte: new Date(new Date().setDate(1)), // First day of current month
            $lt: new Date(new Date().setMonth(new Date().getMonth() + 1)) // First day of next month
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Create a map of days with article counts
    const dayCountMap = {};
    dailyData.forEach(item => {
      const day = new Date(item._id).getDate();
      dayCountMap[day] = item.count;
    });

    // Generate complete month data with zeros for missing days
    const daysInMonth = 30; // Assuming we want to show 30 days
    const completeLineData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day: day.toString(),
        articles: dayCountMap[day] || 0
      };
    });

    // Get article status counts
    const statusCounts = await articleModel.aggregate([
      {
        $match: {
          userId: userObjectId
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
          _id: 0
        }
      }
    ]);

    // Default pie data if no articles exist
    const defaultPieData = [
      { name: "Publish", value: 0 },
      { name: "Under Review", value: 0 },
      { name: "Unpublish", value: 0 }
    ];

    res.status(200).json({
      lineData: completeLineData,
      pieData: statusCounts.length ? statusCounts : defaultPieData,
      totalArticles: statusCounts.reduce((sum, item) => sum + item.value, 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching article stats", error });
  }
};

export const getArticleStatusGraphData = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await teamModel.findById(teamId).select('role');
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(teamId);


    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29); // Include today

    // Base match conditions
    const matchConditions = {
      status: { $in: ["publish", "unpublish"] },
      createdAt: { $gte: new Date(thirtyDaysAgo.setHours(0, 0, 0, 0)) },
    };

    if (team.role === 'team') {
      matchConditions.assignee = userObjectId;
    }

    // Start by grouping articles by date and status
    const result = await articleModel.aggregate([
      {
        $match: matchConditions,
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);


    // Init empty map with all dates for both statuses
    const chartDataMap = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      chartDataMap[key] = { date: key, publish: 0, unpublish: 0 };
    }

    // Fill counts from aggregation
    result.forEach((item) => {
      const date = item._id.date;
      const status = item._id.status;
      if (chartDataMap[date]) {
        chartDataMap[date][status] = item.count;
      }
    });

    // Return array sorted by date ascending
    const finalData = Object.values(chartDataMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return res.status(200).json({
      success: true,
      data: finalData,
    });
  } catch (error) {
    console.error("Line chart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating graph data.",
    });
  }
};