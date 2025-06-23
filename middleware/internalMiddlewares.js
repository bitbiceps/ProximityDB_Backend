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

export default requireSudo;
