import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // This should be at the very top

import OpenAI from "openai";

const writer = new OpenAI({
  apiKey: process.env.API,
});

const model = "ft:gpt-3.5-turbo-0613:cache-labs-llc:yt-tutorial:8hHNplz0";
const topicModel = "gpt-3.5-turbo";

const openAi = {
  writer,
  model,
  topicModel,
};

export default openAi;
