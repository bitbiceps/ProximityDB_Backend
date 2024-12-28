import articleModel from "../models/articleModels.js";
import openAi from "../openAi.js";
import topicModel from "../models/topicModel.js";
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

// Function to create articles (with OpenAI part commented and using dummy content)
// const handleCreateArticles = async (body) => {
//   const {
//     numberOfArticles,
//     userId,
//     question1,
//     question2,
//     question3,
//     question4,
//     question5,
//     question6,
//     question7,
//     question8,
//   } = body;

//   try {
//     // Generate articles based on the questionnaire (using dummy data)
//     for (let i = 0; i < numberOfArticles; i++) {
//       const response = await openAi.writer.chat.completions.create({
//         model: openAi.model, // Default model
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are an AI article writer. Please generate a well-structured article that answers the given questionnaire questions. The article should be informative and engaging, without HTML tags.",
//           },
//           {
//             role: "user",
//             content: `
//               Generate a detailed article based on the following questionnaire:
//               Question 1: ${question1}
//               Question 2: ${question2}
//               Question 3: ${question3}
//               Question 4: ${question4}
//               Question 5: ${question5}
//               Question 6: ${question6}
//               Question 7: ${question7}
//               Question 8: ${question8}

//               The article should include:
//               - A well-organized body content with relevant details.
//               - Avoid using HTML tags.
//               - Ensure readability and coherence.
//             `,
//           },
//         ],
//         max_tokens: 800, // Limit tokens to ensure content length
//         temperature: 0.7, // Medium creativity and coherence
//       });

//       // Extract the generated content
//       const generatedContent = response.choices[0].message.content.trim();

//       // Create a new article with the dummy content
//       const newArticle = {
//         value: generatedContent,
//         userId: userId, // Associate the article with the user
//       };

//       // Save the new article in the database
//       await articleModel.create(newArticle);
//     }
//   } catch (error) {
//     console.error("Error generating articles:", error);
//     throw new Error("Error generating articles with OpenAI");
//   }
// };
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
  const { topicId } = req.body;
  console.log(topicId, "fghj");

  try {
    // Generate articles based on the questionnaire (using dummy data)
    // for (let i = 0; i < numberOfArticles; i++) {
    const article = await topicModel.findOne({ _id: topicId });
    console.log("art", article);
    let t = "hello kaif is here";
    const response = await openAi.writer.chat.completions.create({
      model: openAi.model, // Default model
      messages: [
        {
          role: "system",
          content:
            "You are an AI article writer. Please generate a well-structured article that answers the given questionnaire questions. The article should be informative and engaging, without HTML tags.",
        },
        {
          role: "user",
          content: `
              Generate a detailed article based on the following questionnaire:
             Topic: ${article.finalTopic}

              The article should include:
              - A well-organized body content with relevant details.
              - Avoid using HTML tags.
              - Ensure readability and coherence.
            `,
        },
      ],
      max_tokens: 800, // Limit tokens to ensure content length
      temperature: 0.7, // Medium creativity and coherence
    });

    // Extract the generated content
    const generatedContent = response.choices[0].message.content.trim();

    // Create a new article with the dummy content
    const newArticle = {
      value: generatedContent,
      topicId: topicId, // Associate the article with the user
    };

    // Save the new article in the database
    await articleModel.create(newArticle);
    const newarticle = await articleModel
      .findOne({ _id: topicId })
      .select("_id status");
    console.log("newA", newArticle, newArticle._id, newArticle.status);
    return res.status(200).json(newarticle);
    // }
  } catch (error) {
    console.error("Error generating articles:", error);
    throw new Error("Error generating articles with OpenAI");
  }
};

export const handleArticleUpdateRequested = async (req, res) => {
  try {
    const { articleId } = req.body; // Get articleId from the request parameters
    console.log("uuuuuuu", articleId);
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

export const handleSubmitArticle = async (req, res) => {
  try {
    const { articleId } = req.body; // Get articleId from the request parameters

    // Find the article document by its ID
    const article = await articleModel.findOne({ _id: articleId });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Set the submitted field to true and updateRequested to false
    article.status = "review";
    article.updateRequested = false;

    // Save the updated article
    await article.save();

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
