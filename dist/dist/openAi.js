import dotenv from "dotenv";
dotenv.config({
  path: ".env.local"
}); // This should be at the very top

import OpenAI from "openai";
var writer = new OpenAI({
  apiKey: process.env.API
});
var model = "ft:gpt-3.5-turbo-0613:cache-labs-llc:yt-tutorial:8hHNplz0";
var topicModel = "gpt-3.5-turbo";
var openAi = {
  writer: writer,
  model: model,
  topicModel: topicModel
};
export default openAi;