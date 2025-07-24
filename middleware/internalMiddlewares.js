import articleModel from "../models/articleModels.js";
import teamModel from "../models/teamModel.js";

const requireSudo = async (req, res, next) => {
  const email = req.header("internal-user-email");
  if (!email)
    return res
      .status(401)
      .json({ message: "Missing internal-user-email header" });

  const user = await teamModel.findOne({ email });
  if (!user || user.role !== "sudo") {
    return res.status(403).json({ message: "Access denied: sudo only" });
  }

  req.user = user;
  next();
};

export const authorizeTeamForArticle = async (req, res, next) => {
  const { teamId, articleId } = req.body; 

  if (!teamId || !articleId) {
    return res.status(400).json({ message: "Missing teamId or articleId" });
  }

  try {
    const team = await teamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.role === "sudo") {
      req.team = team;
      return next();
    }

    const article = await articleModel.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (String(article.assignee) !== String(teamId)) {
      return res.status(403).json({ message: "Access denied: Not article assignee" });
    }

    req.team = team;
    req.article = article;
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export default requireSudo;
