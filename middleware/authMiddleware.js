import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// export const verifyToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) {
//     return res.status(403).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];
//   if (!token) {
//     return res.status(403).json({ message: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized", error: error.message });
//   }
// };



export const verifyToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({
        message: "Authentication required",
        code: "MISSING_TOKENS",
        action: "login"
      });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.userId)
        .populate("topics profileImage")
        .lean();
      
      if (!user) {
        throw new Error("User not found");
      }

      req.user = user;
      req.userId = decoded.userId
      return next();
    } catch (accessTokenError) {
      if (accessTokenError.name === 'TokenExpiredError' && refreshToken) {
        try {
          const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
          const user = await userModel.findById(refreshDecoded.userId)
            .populate("topics profileImage")
            .lean();

          if (!user) {
            throw new Error("User not found");
          }

          // Generate new access token
          const newAccessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
          );

          // Set new access token cookie
          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
          });

          await userModel.updateOne(
            { _id: user._id },
            { $set: { accessToken: newAccessToken } }
          );

          req.user = user;
          req.userId = decoded.userId
          return next();
        } catch (refreshError) {
          // Clear both tokens if refresh fails
          clearAuthCookies(res);
          return handleTokenError(res, refreshError);
        }
      }
      throw accessTokenError;
    }
  } catch (error) {
    clearAuthCookies(res);
    return handleTokenError(res, error);
  }
};

const clearAuthCookies = (res) =>  {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
}

const handleTokenError = (res, error) => {
  switch (error.name) {
    case 'TokenExpiredError':
      return res.status(401).json({
        message: "Session expired. Please login again.",
        code: "SESSION_EXPIRED",
        action: "login"
      });
    case 'JsonWebTokenError':
      return res.status(403).json({
        message: "Invalid token",
        code: "INVALID_TOKEN",
        action: "login"
      });
    default:
      return res.status(500).json({
        message: "Authentication error",
        code: "AUTH_ERROR",
        error: error.message
      });
  }
}

