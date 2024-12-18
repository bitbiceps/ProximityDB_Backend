import OpenAI from "openai";
import articleModel from "../models/articleModels.js";

// Initialize OpenAI (commented out for now)
// const openai = new OpenAI({
//   apiKey:
//     process.env.OPENAI_API_KEY ||
//     "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",
//   // "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",
// });

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
const handleCreateArticles = async (body) => {
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
  } = body;

  // Custom fine-tuned model (commented out, as OpenAI API call is now disabled)
  // const model = "ft:gpt-3.5-turbo-0613:cache-labs-llc:yt-tutorial:8hHNplz0";

  try {
    // Generate articles based on the questionnaire (using dummy data)
    for (let i = 0; i < numberOfArticles; i++) {
      // Comment out the OpenAI API call for now
      /*
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Default model
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
              Question 1: ${question1}
              Question 2: ${question2}
              Question 3: ${question3}
              Question 4: ${question4}
              Question 5: ${question5}
              Question 6: ${question6}
              Question 7: ${question7}
              Question 8: ${question8}

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
      */

      // Use dummy content for now
      const generatedContent = `OpenAI is an artificial intelligence research organization that aims to develop advanced AI technologies that benefit humanity. Founded by notable figures like Elon Musk and Sam Altman, OpenAI is focused on creating AI systems that are safe, transparent, and aligned with human values. One of its most well-known creations is GPT-3, a language model capable of understanding and generating human-like text. OpenAI is dedicated to ensuring that AI technologies are used responsibly and are accessible to everyone, helping solve complex global challenges and enhancing various industries through the power of artificial intelligence.`;

      // Create a new article with the dummy content
      const newArticle = {
        value: generatedContent,
        userId: userId, // Associate the article with the user
      };

      // Save the new article in the database
      await articleModel.create(newArticle);
    }
  } catch (error) {
    console.error("Error generating articles:", error);
    throw new Error("Error generating articles with OpenAI");
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

    // Toggle the `updateRequested` field
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

    // Set the `submitted` field to true and `updateRequested` to false
    article.submitted = true;
    article.updateRequested = false;

    // Save the updated article
    await article.save();

    return res.status(200).json({
      message: "Article submitted successfully",
      updatedArticle: article, // Return the updated article document
    });
  } catch (error) {
    console.error("Error submitting article:", error);
    return res
      .status(500)
      .json({ message: "Error submitting article", error: error.message });
  }
};
