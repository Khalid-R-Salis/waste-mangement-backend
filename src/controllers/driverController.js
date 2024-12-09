const User = require("../models/userModel");
const CollectionPoint = require("../models/collectionPointModel");
const PickUpRequest = require("../models/pickUprequest");
const ConfirmPickupModel = require("../models/confirmPickupModel");
const RejectPickupModel = require("../models/rejectPickupModel");

// @desc: getting driver related pickups
exports.getAllDriverPickupOrder = async (req, res) => {
  const { driverID } = req.params;

  try {
    const driver = await User.findOne({ _id: driverID });

    if (!driver) {
      return res.status(404).json({ errorMessage: "Driver not found" });
    }

    const pickups = await CollectionPoint.find({
      driverWorkID: driver._id,
    });

    if (pickups.length === 0) {
      return res
        .status(404)
        .json({ errorMessage: "No pickups available at the moment" });
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString);

      // Format options
      const options = { day: "numeric", month: "long", year: "numeric" };

      return date.toLocaleDateString("en-GB", options);
    };

    const updatedPickups = pickups.map((items) => ({
      ...items._doc,
      time: formatDate(items.time),
    }));

    res.status(200).json({ updatedPickups, nbHits: updatedPickups.length });
  } catch (error) {
    console.log("Error from get driver pickup", error);
    res.status(500).json({ error: "Server error", errorMsgs: error.message });
  }
};

// @desc: driver accepting and completing user pickup
exports.completeOrderPickUp = async (req, res) => {
  const { orderID, driverID } = req.params;
  const { location, items, category, timeArrived, timeLeft, pictureProof } =
    req.body;

  const session = await User.startSession();

  try {
    session.startTransaction();

    const driver = await User.findOne({ _id: driverID }).session(session);

    if (!driver) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Driver not found" });
    }

    const completeOrder = await CollectionPoint.findOne({
      _id: orderID,
      driverWorkID: driver._id,
      driverName: driver.name,
    }).session(session);

    if (!completeOrder) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "No pickups available at the moment" });
    }

    const updateUserPickupOrder = await PickUpRequest.findOneAndUpdate(
      { _id: completeOrder.pickupOrder },
      { status: "Completed" },
      { new: true, runValidators: true, session }
    );

    if (!updateUserPickupOrder) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Something happened. Try Again Later" });
    }

    completeOrder.status = "Completed";
    await completeOrder.save({ session });

    const completedPickup = await ConfirmPickupModel.create(
      [
        {
          driverID: driverID,
          orderID: completeOrder.pickupOrder,
          collectionID: completeOrder.collectionID,
          driverName: completeOrder.driverName,
          driverPhoneNumber: driver.phone,
          location,
          items,
          category,
          timeArrived,
          timeLeft,
          pictureProof,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: "Order completed", completedPickup });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log("error from driver complete order", error);
    res.status(500).json({
      error: "Server error. Please try again later",
      errorMsg: error.message,
    });
  }
};

// @desc: driver rejecting pickup request
exports.rejectPickupOrder = async (req, res) => {
  const { orderID, driverID } = req.params;
  const { rejectOrderReason } = req.body;

  const session = await User.startSession();

  try {
    session.startTransaction();

    const driver = await User.findOne({ _id: driverID }).session(session);

    if (!driver) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Driver not found" });
    }

    const order = await CollectionPoint.findOne({
      _id: orderID,
      driverWorkID: driver._id,
      driverName: driver.name,
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "No pickups available at the moment" });
    }

    const updateUserPickupOrder = await PickUpRequest.findOneAndUpdate(
      { _id: order.pickupOrder },
      {
        status: "Pending",
      },
      { new: true, runValidators: true, session }
    );

    if (!updateUserPickupOrder) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Pickup Request not availavble. Try Again Later" });
    }

    const deletePickupAllocatedToDriver =
      await CollectionPoint.findByIdAndDelete(
        {
          _id: orderID,
          driverID: driver._id,
          pickupOrder: order.pickupOrder,
        },
        { session }
      );

    if (!deletePickupAllocatedToDriver) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Order not available. Try Again Later" });
    }

    const rejectedPickup = await RejectPickupModel.create(
      [
        {
          driverID,
          orderID,
          collectionID: order.collectionID,
          driverName: driver._id,
          driverPhoneNumber: driver.phone,
          rejectReason: rejectOrderReason,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: "Order Rejected", rejectedPickup });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log("error from reject order", error);
    res.status(500).json({ error: "Server error", errorMsg: error.message });
  }
};

// @desc: driver searching pickup orders based on pickup collectionID
exports.searchOrder = async (req, res) => {
  try {
    const { searchID } = req.body;

    const pickUpRequest = await CollectionPoint.findOne({
      collectionID: searchID,
    });

    if (!pickUpRequest) {
      return res.status(404).json({
        message: "Pick-up request not found",
      });
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString);

      // Format options
      const options = { day: "numeric", month: "long", year: "numeric" };

      return date.toLocaleDateString("en-GB", options);
    };

    const formatPickUpData = pickUpRequest.time;
    const pickupData = {
      ...pickUpRequest.toObject(),
      time: formatDate(formatPickUpData),
    };

    return res.status(200).json({
      data: pickupData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while searching for the pick-up request",
    });
  }
};