const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const generateUniqueSearchId = () => {
  return uuidv4().slice(0, 4).toUpperCase();
};

const pickUpRequestSchema = new mongoose.Schema(
  {
    capacity: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ["Organic", "Recyclable", "Hazardous"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", 'Driver Allocated', "Completed"],
      default: "Pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    searchId: {
      type: String,
      unique: true,
      default: generateUniqueSearchId,
    },
  },
  { timestamps: true }
);

const PickUpRequest = mongoose.model("PickUpRequest", pickUpRequestSchema);
module.exports = PickUpRequest;
