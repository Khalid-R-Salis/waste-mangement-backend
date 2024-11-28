const { model, Schema } = require("mongoose");

const rejectSchema = new Schema({
  driverID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderID: {
    type: Schema.Types.ObjectId,
    ref: 'PickUpRequest',
    required: true
  },
  collectionID: {
    type: String,
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  driverPhoneNumber: {
    type: String,
    required: true
  },
  rejectReason: {
    type: String,
    required: true
  }
}, { timestamps: true });

const RejectPickupModel = model('rejectedPickups', rejectSchema);
module.exports = RejectPickupModel;