import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import initRoutes from "./routes";
import connectDB from "./config/connectDB.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});