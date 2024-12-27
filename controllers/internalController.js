import articleModel from "../models/articleModels.js";
import { articleStatus } from "../utils.js";

export const handleGetAllCount = async (req, res) => {
  try {
    // Aggregation to count documents by status
    const statusCounts = await articleModel.aggregate([
      {
        $group: {
          _id: "$status", // Group by 'status' field
          count: { $sum: 1 }, // Sum the count for each status
        },
      },
    ]);

    // Initialize the response object
    const count = {};

    // Default rise value
    const riseValue = 8.5;

    // Process the aggregation result and assign to the count object
    statusCounts.forEach((status) => {
      if (status._id === articleStatus.pending) {
        count.pending = { count: status.count, rise: riseValue };
      } else if (status._id === articleStatus.inReview) {
        count.review = { count: status.count, rise: riseValue };
      } else if (status._id === articleStatus.completed) {
        count.completed = { count: status.count, rise: riseValue };
      }
    });

    // Send back the result as a JSON response
    return res
      .status(200)
      .json({ message: "Success Fetching Article Stats", data: count });
  } catch (error) {
    // Log the error and respond with a failure message
    console.error("Error fetching article counts:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
