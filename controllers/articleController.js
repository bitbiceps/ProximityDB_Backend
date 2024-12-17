import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "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", // Replace with your OpenAI API key
});

export const handleQuestionnaire = async (req, res) => {
  const model = "ft:gpt-3.5-turbo-0613:cache-labs-llc:yt-tutorial:8hHNplz0"; // Custom fine-tuned model

  try {
    // Destructure input from request body
    const {
      question1,
      question2,
      question3,
      question4,
      question5,
      question6,
      question7,
      question8,
      numberOfArticles, // Number of articles to generate
    } = req.body;

    // Array to hold generated articles
    const generatedArticles = [];

    // Loop to generate multiple articles
    for (let i = 0; i < numberOfArticles; i++) {
      // Generate article content for each article
      const response = await openai.chat.completions.create({
        model: model,
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
        max_tokens: 800, // Allow enough tokens for detailed content
        temperature: 0.7, // Medium creativity and coherence
      });

      // Extract the generated article content (assuming the first choice)
      const generatedArticle = response.choices[0].message.content.trim();

      // Check if the article was generated successfully
      if (generatedArticle) {
        // Push the generated article into the array
        generatedArticles.push(generatedArticle);
      } else {
        // If the article content wasn't generated, create an error message
        generatedArticles.push("Failed to generate article content.");
      }
    }

    // Respond with the generated articles
    return res.status(200).json({
      message: "Articles generated successfully",
      articles: generatedArticles,
    });
  } catch (error) {
    // Catch and handle any errors
    console.error(error);
    res.status(500).json({
      message: "Error submitting questionnaire",
      error: error.message,
    });
  }
};
