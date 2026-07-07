/* ka daw na bynta DOMAIN NAME SYSTEM */
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import quizRouter from "./routes/quizRoute.js";
import authorityRouter from "./routes/authorityRoutes.js";

const app = express();

app.use(cors({ 
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173", 
      "https://github.dev",
      "https://vercel.app",
      "https://vercel.app"
    ];

    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const port = process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());

/* API endpoint */
app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/authorities", authorityRouter);

app.listen(port, () =>
  console.log(`server started on http://localhost:${port}`),
);
