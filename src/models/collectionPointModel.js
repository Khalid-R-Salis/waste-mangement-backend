const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const generateUniqueSearchId = () => {
  return uuidv4().slice(0, 6).toUpperCase();
};

const collectionPointSchema = new mongoose.Schema(
  {
    driverWorkID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickupOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickUpRequest',
      required: true
    },
    driverName: {
      type: String,
      default: null,
      required: true,
    },
    collectionID: {
      type: String,
      unique: true,
      default: generateUniqueSearchId
    },
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
      default: Date.now(),
      required: true,
    },
    category: {
      type: String,
      enum: ["Organic", "Recyclable", "Hazardous"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    userPhoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CollectionPoint = mongoose.model(
  "CollectionPoint",
  collectionPointSchema
);
module.exports = CollectionPoint;
