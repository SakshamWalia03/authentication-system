import config from "../config/config.js";
import jwt from "jsonwebtoken";

export const validateUser = async (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Access token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid access token",
    });
  }
};
