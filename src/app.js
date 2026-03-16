import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Server is up and running!");
});

app.use("/api/auth", authRoutes);

export default app;
