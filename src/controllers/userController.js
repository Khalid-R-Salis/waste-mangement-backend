const User = require("../models/userModel");
const PickUpRequest = require("../models/pickUprequest");
const bcryptjs = require("bcryptjs");

//MAKING REQUEST FOR PICKUPS
exports.requestPickUp = async (req, res) => {
  try {
    const { userId } = req.params;
    const { capacity, location, time, category } = req.body;

    if (!capacity || !location || !time || !category) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Fetch the user by userId
    let user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Create a new pickup request entry
    let pickup = new PickUpRequest({
      capacity,
      location,
      time,
      category,
      user_name: user.name,
      phone: user.phone,
      userId: user._id,
    });

    await pickup.save();

    res.status(201).json({
      message: "Pick up created successfully",
      pickup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

//GETTING ALL COMPLETED PICKUP
exports.completedPickups = async (req, res) => {
  try {
    const { userId } = req.params;

    const completedPickups = await PickUpRequest.find({
      userId,
      status: "Completed",
    });

    if (completedPickups.length === 0) {
      return res.status(404).json({ message: "No completed pickups found." });
    }

    res.status(200).json({
      message: "Completed pickups retrieved successfully.",
      completedPickups,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
//GETTING ALL PENDING PICK UP
exports.pendingPickups = async (req, res) => {
  try {
    const { userId } = req.params;

    const pendingPickups = await PickUpRequest.find({
      userId,
      status: "Pending",
    });

    if (pendingPickups.length === 0) {
      return res.status(404).json({ message: "No pending pickups found." });
    }

    res.status(200).json({
      message: "Pending pickups retrieved successfully.",
      pendingPickups,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
//GETTING ALL THE PICKUP ASSOCIATED WITH A USER(PENDING AND COMPLETED)
exports.allUserPickups = async (req, res) => {
  try {
    const { userId } = req.params;

    const allPickups = await PickUpRequest.find({ userId });

    const user = await User.findOne({ _id: userId });

    if (allPickups.length === 0) {
      return res.status(404).json({ message: "No pickups found." });
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString);

      // Format options
      const options = { day: "numeric", month: "long", year: "numeric" };

      return date.toLocaleDateString("en-GB", options);
    };

    const pickupData = allPickups.map(order => ({
      ...order._doc,
      time: formatDate(order.time)
    }))

    return res.status(200).json({
      message: "All pickups retrieved successfully.",
      pickupData,
      name: user.name,
      email: user.email,
      username: user.username,
      phoneNumber: user.phone
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// UPDATING USER PROFILE
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, username } = req.body;

    let user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only the fields that were provided
    if (name) user.name = name;
    if (email) {
      // Validate email before updating
      const emailRegex =
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!email.match(emailRegex)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      user.email = email;
    }
    if (phone) {
      // Validate phone number before updating
      const phoneRegex = /^(\+234|0)[789]\d{9}$/;
      if (!phone.match(phoneRegex)) {
        return res.status(400).json({
          message:
            "Invalid phone number format (e.g., +2347012345678 or 07012345678)",
        });
      }
      user.phone = phone;
    }

    if (username) user.username = username;

    await user.save();

    res.status(200).json({
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// CONTROLLER FOR UPDATING PASSWORD
exports.updateUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide both current and new passwords." });
    }

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 8);

    user.password = hashedNewPassword;

    await user.save();

    // Respond with success
    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

//SEARCH FOR PICK UP CONTROLLER
exports.searchPickUp = async (req, res) => {
  try {
    const { searchId } = req.body;

    const pickUpRequest = await PickUpRequest.findOne({ searchId });

    if (!pickUpRequest) {
      return res.status(404).json({
        message: "Pick-up request not found",
      });
    }

    return res.status(200).json({
      data: pickUpRequest,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while searching for the pick-up request",
      error: error.message,
    });
  }
};