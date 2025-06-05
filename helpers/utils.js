import openAi from "./openAi.js";
export const articleStatus = {
  pending: "unpublish",
  inReview: "under review",
  completed: "published",
};

export const profileFile = "https://api.proximity.press/uploads/profile/";
export const articleFile = "https://api.proximity.press/uploads/article/";
// export const profileFile = "http://localhost:4000/uploads/profile/"
// export const articleFile = "http://localhost:4000/uploads/article/"

export const socketEvents = {
  TEST__BROADCAST: "TEST__BROADCAST",
};


const outletsData = [
  {
    "Outlets_Name": "Amar Ujala (English)",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "25.4 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "General News (India-focused)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
    "Reach_Duplicate": "25.4 M"
  },
  {
    "Outlets_Name": "Analytics Insight",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "2.1 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Datascience",
      "AI",
      "Analytics"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
    "Reach_Duplicate": "2.1 M"
  },
  {
    "Outlets_Name": "Benzinga",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "13.1 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Finance",
      "Business news"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
    "Reach_Duplicate": "13.1 M"
  },
  {
    "Outlets_Name": "CA club India",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "1.4 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Finance",
      "Taxation",
      "Accountancy"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Career India",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "384 K",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Education",
      "Jobs"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Chittorgarh",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "19 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Business",
      "Finance",
      "Trading"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Devto",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "12. 1M ",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Programming",
      "Software development"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "DNA",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "14.6 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "General news (Indian and global)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Financial Express",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "7.3 M",
    "Backdating": "Yes ( 1 year )",
    "Price_INR": "",
    "Genre_Beat": [
      "Business",
      "Finance",
      "Economy"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Free Press Journal",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "4.9 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "General News (India-focused)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Hans India",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "794.1 K",
    "Backdating": "Yes ( 1 year )",
    "Price_INR": "",
    "Genre_Beat": [
      "General News (India-focused)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "IB times India",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "2.6 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Business",
      "Economy(Global and India)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "IB times SG",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "804.6 K",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Business",
      "Economy(Global and Singapore)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "India CSR",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "26.6 K",
    "Backdating": "Yes",
    "Price_INR": "",
    "Genre_Beat": [
      "Corporate Social responsibility",
      "Sustainability"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "India Hood",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "78.9K",
    "Backdating": "Yes",
    "Price_INR": "",
    "Genre_Beat": [
      "General news",
      "Trends (India-focused)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "India.com",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "144.2 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "General news",
      "Lifestyle",
      "Entertainment"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Khaleej Times",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "11.9 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "General news",
      "Business (UAE focused)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Mid-Day",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "2.1 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "General news"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "MSN",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "2.5 Billion",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Global news",
      "Technology",
      "Entertainment"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "News 24",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "5.8 M",
    "Backdating": "Yes ( 1 year )",
    "Price_INR": "",
    "Genre_Beat": [
      "General news (India focused)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "News Break",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "31.7 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Local and global news"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "News Nation",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "1.6 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "General News (India-focused)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "One India",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "85.4 M ",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Regional news (India-focused)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Outlook",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "4.3 M",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Politics",
      "Business",
      "Lifestyle"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Programming insider",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "124.6 K",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Entertainment",
      "Media Industry"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Silicon India",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "208.1 K",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Technology",
      "Startups",
      "Business"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Startup opinions",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "221.7 K ",
    "Backdating": "Yes",
    "Price_INR": "",
    "Genre_Beat": [
      "Startups",
      "Entrepreneurship",
      "Business"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Tech Bullion",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "654.8 K",
    "Backdating": "Yes",
    "Price_INR": "",
    "Genre_Beat": [
      "Technology",
      "Business"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Tech Circle",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "53.4 K",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "Startups",
      "Tech Industry",
      "Venture capital"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Techlusive",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "542 K",
    "Backdating": "Yes ( 1 Year )",
    "Price_INR": "",
    "Genre_Beat": [
      "Technology",
      "Gadgets"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Zee news",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": "465 K",
    "Backdating": "No",
    "Price_INR": "",
    "Genre_Beat": [
      "General News (India-focused)"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
  {
    "Outlets_Name": "Startup Talky ",
    "Reporter_Byline": "",
    "Concerned_Agency": "",
    "Reach": " 327K",
    "Backdating": "Yes",
    "Price_INR": "",
    "Genre_Beat": [
      "Startups",
      "Business",
      "Entrepreneurship"
    ],
    "AI_Generated_Content": "",
    "Byline_Without_Author": "",
    "By_Desk": "",
    "Cost": "",
  },
]

export const determineBestOutlets = async (articleContent) => {
  const outlets = outletsData;

  const promptContent = `You are an AI content analyzer. Based on the following article content, determine the best three outlets from the provided list that would be most suitable for publishing this article. 
  The outlets should align based on:
  1. Genre relevance: The outlet's 'Genre_Beat' should match the topics discussed in the article.
  2. Reach: Higher reach is preferable when multiple outlets have relevant genres.

  Article Content:
  ${articleContent}

  List of Outlets with Genre and Reach:
  ${outlets.map(outlet => `Outlet: ${outlet.Outlets_Name}, Genres: ${outlet.Genre_Beat.join(", ")}, Reach: ${outlet.Reach}`).join("\n")}

  Please provide the names of the top three outlets that would be the best fit for this article. Only return the names of the outlets, separated by commas.`;

  const maxRetries = 2;
  let attempts = 0;

  while (attempts <= maxRetries) {
    try {
      const response = await openAi.writer.chat.completions.create({
        model: openAi.model,
        messages: [
          { role: "system", content: promptContent },
          { role: "user", content: "Determine the best three outlets for this article." },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      if (!response || !response.choices || !response.choices[0]?.message?.content) {
        throw new Error("Invalid response from OpenAI");
      }

      const generatedContent = response.choices[0].message.content.trim();
      const bestOutletNames = generatedContent.split(",").map((outlet) => outlet.trim());

      const validOutlets = outlets.filter((outlet) => bestOutletNames.includes(outlet.Outlets_Name));
      if (validOutlets.length === 3) {
        return validOutlets;
      }

    } catch (error) {
      console.log(`Attempt ${attempts + 1} failed:`, error);
    }

    attempts++;
  }

  throw new Error("Failed to determine the best outlets after multiple attempts.");
};
