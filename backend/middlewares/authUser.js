import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized. Please login again.",
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // NEW: confirm the account this token belongs to still actually
    // exists. JWTs are stateless — deleting a user's DB record does NOT
    // invalidate a token they already have. Without this check, a deleted
    // user's browser silently keeps "working" for every authenticated
    // request until it crashes deep inside a specific operation (like
    // bookAppointment failing mongoose validation on missing userData).
    // This check makes deletion take effect on their very next request,
    // anywhere in the app — which is the actual "sign them out
    // everywhere" mechanism, since there's no server-side session to
    // revoke directly.
    const userExists = await userModel.exists({ _id: token_decode.id });
    if (!userExists) {
      return res.json({
        success: false,
        message: "Your session has expired. Please sign in again.",
        sessionExpired: true,
      });
    }

    req.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
