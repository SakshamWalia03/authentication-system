import User from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateHTMLTemplate,
  generateRefreshToken,
  generateOTP,
  generateEmailTextTemplate,
} from "../utils/generate.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/sendEmail.js";

const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Check username or email already exist
  const alreadyExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (alreadyExist) {
    return res.status(409).json({
      message: "User with same username or email already exists",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashPassword,
  });

  const otp = generateOTP();
  const textTemplate = generateEmailTextTemplate(otp);
  const htmlTemplate = generateHTMLTemplate(otp);

  await otpModel.create({
    user: newUser._id,
    otpHash: await bcrypt.hash(otp, 10),
    email,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendEmail(email, "Verify your email", textTemplate,htmlTemplate);

  const userObj = newUser.toObject();
  delete userObj.password;

  return res.status(201).json({
    messgae: "User registered successfully",
    user: userObj,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const userExist = await User.findOne({ email }).select("+password");
  if (!userExist) {
    return res.status(404).json({
      message: "User with this email does not exist",
    });
  }

  if(!userExist.verified) {
    return res.status(403).json({
      message: "Email is not verified. Please verify your email to login",
    });
  }

  const isPasswordvalid = await bcrypt.compare(password, userExist.password);

  if (!isPasswordvalid) {
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  const accessToken = generateAccessToken(userExist._id, userExist.username);
  const refreshToken = generateRefreshToken(userExist._id, userExist.username);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await sessionModel.create({
    user: userExist._id,
    refreshTokenHash: await bcrypt.hash(refreshToken, 10),
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  return res.status(200).json({
    message: "User logged in successfully",
    accessToken,
  });
};

const getDetails = async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);

  return res.status(200).json({
    message: "User details fetched successfully",
    user,
  });
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token is missing",
    });
  }

  await sessionModel.findOneAndUpdate(
    { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
    { revoked: true },
  );

  res.clearCookie("refreshToken");

  return res.status(200).json({
    message: "User logged out successfully",
  });
};

const logoutAll = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token is missing",
    });
  }

  await sessionModel.findAllAndUpdate({ user: req.user.id }, { revoked: true });

  res.clearCookie("refreshToken");

  return res.status(200).json({
    message: "User logged out successfully",
  });
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token is missing",
    });
  }

  const session = await sessionModel.findOne({
    refreshTokenHash: await bcrypt.hash(refreshToken, 10),
  });

  if (!session || session.revoked) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    const accessToken = generateAccessToken(decoded.id, decoded.username);
    const newRefreshToken = generateRefreshToken(decoded.id, decoded.username);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    session.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await session.save();

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
};

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  const userExist = await User.findOne({ email });
  if (!userExist) {
    return res.status(404).json({
      message: "User with this email does not exist",
    });
  }

  if(userExist.verified) {
    return res.status(400).json({
      message: "Email is already verified. Please login to continue",
    });
  }

  const otpRecord = await otpModel
    .findOne({ email, user: userExist._id })
    .sort({ createdAt: -1 });

  if (!otpRecord) {
    return res.status(404).json({
      message: "OTP not found, please request a new one",
    });
  }

  const matchingOtp = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!matchingOtp) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  userExist.verified = true;
  await userExist.save();

  await otpModel.findByIdAndDelete(otpRecord._id);

  return res.status(200).json({
    message: "Email verified successfully",
  });
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "User with this email does not exist",
    });
  }

  if(user.verified) {
    return res.status(400).json({
      message: "Email is already verified",
    });
  }

  let existing = await otpModel
    .findOne({ email, user: user._id })
    .sort({ createdAt: -1 });

  if (existing && existing.resendAfter && existing.resendAfter > Date.now()) {
    return res.status(429).json({
      message: "Please wait before requesting OTP again",
    });
  }

  const newOtp = generateOTP();
  const otpHash = await bcrypt.hash(newOtp, 10);

  try {
    await sendEmail(email, "Verify your email", generateEmailTextTemplate(newOtp), generateHTMLTemplate(newOtp));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send OTP. Please try again.",
    });
  }

  if (existing) {
    existing.otpHash = otpHash;
    existing.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    existing.resendAfter = new Date(Date.now() + 30 * 1000);
    await existing.save();
  } else {
    await otpModel.create({
      user: user._id,
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      resendAfter: new Date(Date.now() + 30 * 1000),
    });
  }

  return res.status(200).json({
    message: "OTP resent successfully",
  });
};

export default {
  register,
  login,
  getDetails,
  refreshToken,
  logout,
  logoutAll,
  verifyEmail,
  resendOTP,
};
