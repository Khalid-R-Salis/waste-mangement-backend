const mongoose = require("mongoose");

const collectionPointSchema = new mongoose.Schema(
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
      enum: ["organic", "recyclable", "hazardous"],
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
