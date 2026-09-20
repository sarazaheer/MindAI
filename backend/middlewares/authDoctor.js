import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";

//Doctor AUTHENTICATION MIDDLEWARE
const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) {
      return res.json({
        success: false,
        message: "Not Authorized. Please login again.",
      });
    }
    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);

    // NEW: same fix applied to authUser.js — confirm the doctor account
    // this token belongs to still actually exists. A deleted doctor's
    // token stays "valid" (JWTs are stateless), which previously meant
    // their dashboard/profile would silently return null data instead of
    // properly logging them out.
    const doctorExists = await doctorModel.exists({ _id: token_decode.id });
    if (!doctorExists) {
      return res.json({
        success: false,
        message: "Your session has expired. Please sign in again.",
        sessionExpired: true,
      });
    }

    req.docId = token_decode.id;

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
