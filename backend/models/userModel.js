import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    default:
      "https://www.freepik.com/free-vector/blue-circle-with-white-user_145857007.htm#fromView=keyword&page=1&position=0&uuid=9a6a0165-6293-4856-bdf6-708b4baea970&query=Profile+user",
  },

  address: {
    type: Object,
    default: { line1: "", line2: "" },
  },
  gender: { type: String },
  dob: { type: Date },
  phone: { type: String, default: "0000000000" },
  isVerified: {
    type: Boolean,
    default: true,
  },
});
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
