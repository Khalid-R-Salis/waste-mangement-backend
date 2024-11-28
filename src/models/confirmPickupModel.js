const { model, Schema } = require("mongoose");

const confirmSchema = new Schema(
  {
    driverID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderID: {
      type: Schema.Types.ObjectId,
      ref: "PickUpRequest",
      required: true,
    },
    collectionID: {
      type: String,
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    driverPhoneNumber: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true,
    },
    items: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    timeArrived: {
      type: String,
      required: true,
    },
    timeLeft: {
      type: String,
      required: true,
    },
    pictureProof: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ConfirmPickupModel = model("confirmedPickups", confirmSchema);
module.exports = ConfirmPickupModel;
