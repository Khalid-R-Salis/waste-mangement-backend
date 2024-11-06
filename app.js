const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const router = require("./src/routes/index");
const cors = require("cors");

// LOAD ENVIRONMENT VARIABLES
dotenv.config();

// INITIALIZE EXPRESS
const app = express();
app.use(cors("*"));

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// DB CONNECTION
connectDB();
// ROUTE HANDLING
app.use("/api", router);

// START THE SERVER
const port = process.env.PORT || 5500;
app.listen(port, () => console.log(`Server running on port ${port}`));
