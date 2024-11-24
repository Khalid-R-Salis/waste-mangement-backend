const User = require("../models/userModel");
const CollectionPoint = require("../models/collectionPointModel");
const PickUpRequest = require("../models/pickUprequest");

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

// @desc: driver responding to customer pickup when order successfully completed
exports.completeOrderPickUp = async (req, res) => {
  const { orderID } = req.params;

  try {
    const driver = await User.find({ _id: driverID });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const completeOrder = await CollectionPoint.findOne({
      pickupOrder: orderID,
    });

    if (!completeOrder) {
      return res.status(404).json({ message: "Pickup not available" });
    }

    const updateUserPickupOrder = await PickUpRequest.findOneAndUpdate(
      { _id: orderID },
      { status: "Completed" },
      { new: true, runValidators: true }
    );

    completeOrder.status = "Completed";

    await completeOrder.save();

    if (!updateUserPickupOrder) {
      return res
        .status(404)
        .json({ message: "Something happened. Try Again Later" });
    }

    res.status(200).json({ success: "Order completed" });
  } catch (error) {
    console.log("error from driver complete order", error);
    res.status(500).json({ error: "Server error", errorMsg: error.message });
  }
};
