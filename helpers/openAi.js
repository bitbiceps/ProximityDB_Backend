import "dotenv/config"
import OpenAI from "openai";

const writer = new OpenAI({
  apiKey: process.env.API,
});

// const model = "ft:gpt-3.5-turbo-0613:cache-labs-llc:yt-tutorial:8hHNplz0";
const model =
  "ft:gpt-4o-mini-2024-07-18:cache-labs-llc:proximity-article-writer:B2y6WGBB";

const topicModel = "gpt-3.5-turbo";

const openAi = {
  writer,
  model,
  topicModel,
};

export default openAi;
