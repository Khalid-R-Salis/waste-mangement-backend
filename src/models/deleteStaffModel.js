const { model, Schema } = require("mongoose");

const deleteSchema = new Schema(
  {
    reason: {
      type: String,
    },
    adminID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const DeleteModel = model("deleteStaff", deleteSchema);
module.exports = DeleteModel;
