const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.dbUri);
    console.log("MongoDB connected Successfully");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
