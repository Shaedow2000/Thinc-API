import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import crypto from "crypto";

import wrapper from "../middlewares/asyncWrapper.js";
import AccountModel from "../models/account.js";
import NoteModel from "../models/note.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetVerificationCode,
  sendPasswordChangedEmail,
  sendDeleteConfirmationEmail,
  sendDeletedAccountEmail,
} from "../config/mail.js";

const register = wrapper(async (req, res) => {
  const { username, email, password } = req.body;
  const salt = 10;

  if (password.length < 6)
    return res.status(400).json({
      status: 400,
      message:
        " password: Password should contain at least 6 characters or more",
    });

  const hashedPassword = await bcrypt.hash(password, salt);

  const code = crypto.randomInt(100000, 999999).toString();

  const verificationCode = code;
  const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const newAccount = new AccountModel({
    username,
    email,
    password: hashedPassword,
    verificationCode,
    verificationExpiry,
  });
  await newAccount.save();

  await sendVerificationEmail(username, email, code);

  return res.status(202).json({
    status: 202,
    message: `Verification code sent to ${email}. Please check you email.`,
  });
});

const verification = wrapper(async (req, res) => {
  const { email, code } = req.body;
  const user = await AccountModel.findOne({ email }, { __v: false });

  if (!user)
    return res.status(404).json({
      status: 404,
      message: "Account not found",
      account: null,
    });

  if (user.verificationCode !== code)
    return res.status(401).json({
      status: 401,
      message: "Invalid verification code",
    });

  if (user.verificationExpiry < new Date())
    return res.status(401).json({
      status: 401,
      message: "Verification code exipred",
    });

  await AccountModel.findOneAndUpdate(
    { email },
    { isVerified: true, verificationCode: null, verificationExpiry: null },
  );

  const newNotesData = new NoteModel({
    user: user.email,
    notes: [],
  });
  await newNotesData.save();

  await sendWelcomeEmail(user.username, user.email);

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1y",
  });

  return res.status(201).json({
    status: 201,
    message: "Account created successfully!",
    account: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
    token: token,
  });
});

const resend_code = wrapper(async (req, res) => {
  const { email } = req.body;

  const user = await AccountModel.findOne({ email });
  if (!user)
    return res.status(404).json({
      status: 404,
      message: "Account not found",
      account: null,
    });

  if (user.isVerified)
    return res.status(202).json({
      status: 202,
      message: "Account already verified",
    });

  const code = crypto.randomInt(100000, 999999).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await AccountModel.findOneAndUpdate(
    { email },
    { verificationCode: code, verificationExpiry: expiry },
  );

  await sendVerificationEmail(user.username, email, code);

  return res.status(202).json({
    status: 202,
    message: `New verification code sent to ${email}`,
  });
});

const reset_password_verification = wrapper(async (req, res) => {
  const { email } = req.body;
  const user = await AccountModel.findOne({ email });

  if (!user) {
    return res.status(404).json({
      status: 404,
      message: "Account not found",
      account: null,
    });
  }

  const code = crypto.randomInt(100000, 999999).toString();
  const expiry = new Date(Data.now(), 10 * 60 * 1000);

  await AccountModel.findOneAndUpdate(
    { email },
    {
      verificationCode: code,
      verificationExpiry: expiry,
      abilityToChangePassword: true,
    },
  );

  await sendPasswordResetVerificationCode(user.username, email, code);

  return res.status(202).json({
    status: 202,
    message: `New verification code sent to ${email}`,
  });
});

const reset_password = wrapper(async (req, res) => {
  const { email, password, code } = req.body;
  const user = await AccountModel.findOne({ email });

  if (!user) {
    return res.status(404).json({
      status: 404,
      message: "Account not found",
      account: null,
    });
  }

  if (user.verificationCode !== code)
    return res.status(401).json({
      status: 401,
      message: "Invalid verification code",
    });

  if (user.verificationExpiry < new Date())
    return res.status(401).json({
      status: 401,
      message: "Verification code exipred",
    });

  if (!user.abilityToChangePassword)
    return res.status(403).json({
      status: 403,
      message: "Account not found",
    });

  const salt = 10;
  const new_hashed_password = bcrypt.hash(password, salt);

  await AccountModel.findOneAndUpdate(
    { email },
    {
      password: new_hashed_password,
      verificationCode: null,
      verificationExpiry: null,
      abilityToChangePassword: false,
    },
  );

  await sendPasswordChangedEmail(user.username, email);

  return res.status(200).json({
    status: 200,
    message: "Updated password successfully",
  });
});

const abortChangingPassword = wrapper(async (req, res) => {
  const id = req.params.id;
  const user = await AccountModel.findById(id);

  if (!user)
    return res.status(404).json({
      status: 404,
      message: "Account not found",
      account: null,
    });

  if (!user.abilityToChangePassword)
    return res.status(400).json({
      status: 400,
      message: "Bad request. Operation already satisfied",
    });

  await AccountModel.findOneAndUpdate(
    { _id: id },
    { abilityToChangePassword: false },
  );

  return res.status(202).json({
    status: 202,
    message: "Abort changing password",
  });
});

const login = wrapper(async (req, res) => {
  const { email, password } = req.body;

  const user = await AccountModel.findOne({ email }, { __v: false });

  if (user) {
    const isUser = await bcrypt.compare(password, user.password);
    if (isUser) {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1y",
      });

      return res.status(200).json({
        status: 200,
        message: "Loged in successfuly!",
        account: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        token: token,
      });
    } else {
      return res.status(401).json({
        status: 401,
        message: "Account not found",
        account: null,
      });
    }
  } else {
    return res.status(404).json({
      status: 404,
      message: "Account not found",
      account: null,
    });
  }
});

const deleteAccountRequest = wrapper(async (req, res) => {
  const { email, password } = req.body;

  const user = await AccountModel.findOne({ email }, { __v: false });

  if (user) {
    const isUser = await bcrypt.compare(password, user.password);
    if (isUser) {
      const code = crypto.randomInt(100000, 999999).toString();
      const expiry = new Date(Date.now(), 10 * 60 * 1000);

      await AccountModel.findOneAndUpdate(
        { email },
        { confirmationCode: code, confirmationExpiry: expiry },
      );

      await sendDeleteConfirmationEmail(user.username, user.email, code);

      return res.status(202).json({
        status: 202,
        message: `New confirmation code sent to ${email}`,
      });
    } else {
      return res.status(401).json({
        status: 401,
        message: "Account not found",
        account: null,
      });
    }
  } else {
    return res.status(404).json({
      status: 404,
      message: "Account not found",
      account: null,
    });
  }
});

const deleteAccountConfirmation = wrapper(async (req, res) => {
  const { email, code } = req.body;
  const user = await AccountModel.findOne({ email }, { __v: false });

  if (!user)
    return res.status(404).json({
      status: 404,
      message: "Account not found",
      account: null,
    });

  if (code !== user.confirmationCode)
    return res.status(401).json({
      status: 401,
      message: "Invalid confirmation code",
    });

  if (user.confimationExpiry < new Date())
    return res.status(401).json({
      status: 401,
      message: "Confirmation code expired",
    });

  await AccountModel.deleteOne({ email });
  await NoteModel.deleteOne({ user: email });

  await sendDeletedAccountEmail(user.username, user.email);

  return res.status(202).json({
    status: 202,
    message: "Account deleted successfully",
    account: null,
  });
});

const tokenAuth = wrapper(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const user = await AccountModel.findOne({ email: decodedToken.email });

  if (!user)
    return res.status(401).json({
      status: 401,
      message: "Invalid JWT token",
    });

  const notes = await NoteModel.findOne({ user: user.email });

  return res.status(200).json({
    status: 200,
    message: "Valid JWT token",
    account: {
      username: user.username,
      email: user.email,
    },
    notes: notes,
  });
});

export {
  register,
  verification,
  resend_code,
  reset_password_verification,
  reset_password,
  abortChangingPassword,
  login,
  deleteAccountRequest,
  deleteAccountConfirmation,
  tokenAuth,
};
