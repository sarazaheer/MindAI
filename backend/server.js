import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRouter.js";
import chatRouter from "./routes/chatRoute.js";

// NOTE: authUser was imported here previously but never used in this file.
// Removed the unused import — make sure it's actually applied inside
// userRouter.js on any route that requires a logged-in user (e.g. booking,
// profile, my-appointments). If it's already there, this is just cleanup.

//APP CONFIGURATION
const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 4000;
connectDB();
connectCloudinary();

const corsOptions = {
  origin: true,
  credentials: true,
};
// Basic security headers (clickjacking, MIME sniffing, etc.)
app.use(helmet());

//MIDDLEWARES
app.use(express.json({ limit: "1mb" })); // cap request body size
app.use(cors(corsOptions));

// General rate limit across the whole API — tune as needed.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(generalLimiter);

// Stricter limit for auth-sensitive endpoints (login/register).
// Apply this specifically inside userRouter.js / adminRouter.js on the
// login and register routes, e.g.:
//   import rateLimit from "express-rate-limit";
//   const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
//   userRouter.post("/login", authLimiter, loginUser);

app.get("/", (req, res) => {
  res.send("MindAI backend Working");
});

//API ENDPOINTS

//API ENDPOINT FOR ADMIN
app.use("/api/admin", adminRouter);

//API ENDPOINT FOR DOCTOR
app.use("/api/doctor", doctorRouter);

//API ENDPOINT FOR USER REGISTERation
app.use("/api/user", userRouter);

//API FOR CHATBOT
app.use("/api/chat", chatRouter);

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler — keeps stack traces out of API responses.
// Any route that calls next(err) or throws inside an async handler
// (if you're using a wrapper like express-async-errors) will land here.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : err.message,
  });
});

app.listen(PORT, () => {
  console.log("SERVER STARTED ON", PORT);
});
