const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config({ path: ".env" });
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");

const db = process.env.DB.replace("<db_password>", process.env.password);
console.log("dbbb", db);
mongoose
  .connect(db)
  .then(() => {
    console.log("Database connected successfully!!");
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });

const app = express();

app.use(cors({
  origin: "*"
}));

app.options("*", cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
