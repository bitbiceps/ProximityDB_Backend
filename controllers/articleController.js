import articleModel from "../models/articleModels.js";
import openAi from "../helpers/openAi.js";
import topicModel from "../models/topicModel.js";
import userModel from "../models/userModel.js";

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

  const saveArticles = await articleModel.findOne({ topicId });

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
      const promptContent = `You are an AI article writer. Please generate a well-structured and insightful article for the user based on the following questionnaire answers. The article should be professional, informative, and engaging, reflecting the user's expertise and practical experience in the topic of: "${
        article.finalTopic
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
      7. **Core aspects of the topic**: Ensure the article addresses the main points of the topic, diving into key trends, challenges, or solutions related to **${
        article.finalTopic
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

      const newObj = await articleModel.findOne({ topicId });
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
  try {
    const { articleId } = req.body; // Get articleId from the request parameters
    // Find the article document by its ID
    const article = await articleModel.findOne({ _id: articleId });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Toggle the updateRequested field
    article.updateRequested = !article.updateRequested;

    // Save the updated article
    await article.save();

    return res.status(200).json({
      message: "Article updateRequested status toggled successfully",
      article, // Return the updated article document
    });
  } catch (error) {
    console.error("Error toggling updateRequested:", error);
    return res.status(500).json({
      message: "Error toggling updateRequested",
      error: error.message,
    });
  }
};

// submit

export const handleSubmitArticle = async (req, res) => {
  try {
    const { articleId, termsAndCondition, companyName, authorName } = req.body; // Get articleId from the request parameters
    // Find the article document by its ID
    const article = await articleModel.findOne({ _id: articleId });
    const topic = await topicModel.findOne({ articleId });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Set the submitted field to true and updateRequested to false
    article.status = "review";
    article.updateRequested = false;
    article.termsAndCondition = termsAndCondition;
    article.companyName = companyName;
    article.authorName = authorName;
    topic.articleStatus = "review";
    // Save the updated article
    await article.save();
    await topic.save();
    return res.status(200).json({
      message: "Article submitted for review",
      updatedArticle: article, // Return the updated article document
    });
  } catch (error) {
    console.error("Error submitting article:", error);
    return res
      .status(500)
      .json({ message: "Error submitting article", error: error.message });
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
    const articles = await articleModel.find({ userId });

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
      .populate("profileImage");

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
