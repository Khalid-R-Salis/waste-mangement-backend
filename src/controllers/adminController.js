const User = require("../models/userModel");
const PickUpRequest = require("../models/pickUprequest");
const bcryptjs = require("bcryptjs");
const CollectionPoint = require("../models/collectionPointModel");
const DeleteModel = require("../models/deleteStaffModel");

const { v4: uuidv4 } = require("uuid");
const sendMail = require("../utils/sendEmail");

//CREATE A NEW STAFF CONTROLLER
exports.createNewStaff = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Set default password and hash it and also create a unqiue driverID
    const generateUniquePassword = uuidv4().slice(0, 4).toUpperCase();
    const defaultPassword = `trash-${generateUniquePassword}`;
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(defaultPassword, salt);

    // Temporary console log for debugging/testing
    // console.log(
    //   `Temporary Log: The default password for ${email} is ${defaultPassword}`
    // );

    const emailSubject = `Welcome to WMS Trashaway Pickup, Important Security Alert`;
    const emailText = `Dear ${name}

      We are thrilled to have you on board, WMS Trashaway offers services for million of users round the country and to achieve maximum user satisfaction, we cannot do with out extinguished staffs. For whom are the backbone of our operation
      To Log into your account, here is your default password: ${defaultPassword}. For maximum security, please do login into your dashboard and change your password to a more secured one.

      Kind Regards,
      WMS Trashaway
    `;

    await sendMail(email, emailSubject, emailText);

    const generateUniqueDriverId = uuidv4().slice(0, 5).toUpperCase();

    // Create the new staff user object
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "staff",
      driverID: generateUniqueDriverId,
    });

    // Save the user to the database
    await user.save();

    //  Return success response
    res.status(201).json({
      message: "Staff created successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error. Please try again later" });
  }
};

// UPDATE A PICK UP REQUEST CONTROLLER
exports.updatePickUpRequest = async (req, res) => {
  const { id } = req.params;
  const { driverName, capacity, location, category, userPhoneNumber } =
    req.body;

  const session = await PickUpRequest.startSession(); // @desc: setting up session to make the whole operation work concurrently or fail concurrently
  session.startTransaction();

  try {
    const driver = await User.findOne({
      name: driverName,
      role: "staff",
    }).session(session);

    if (!driver) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Driver not found" });
    }

    const pickupRequest = await PickUpRequest.findOne({ _id: id }).session(
      session
    );

    if (!pickupRequest) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Pick up request point not found" });
    }

    const updatedPickupRequest = await PickUpRequest.findByIdAndUpdate(
      {
        _id: pickupRequest._id,
      },
      { status: "Driver Allocated" },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    const newCollectionOrder = await CollectionPoint.create(
      [
        {
          driverWorkID: driver._id,
          pickupOrder: updatedPickupRequest._id,
          driverName,
          capacity,
          location,
          category,
          userPhoneNumber,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    await session.endSession();

    // Return the updated collection point
    res
      .status(200)
      .json({ success: "Allocation Successful", newCollectionOrder });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    console.error("Error updating pick up request point:", error);
    res.status(500).json({ error: "Server error. Please try again later" });
  }
};

//FETCH ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    // Find all users with role "user"
    const users = await User.find({ role: "user" });

    // If no users are found
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Return the list of users
    res.status(200).json({ users, totalUsers: users.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

//FETCH ALL STAFFS
exports.getAllStaff = async (req, res) => {
  try {
    // Find all users with role "staff"
    const staffs = await User.find({ role: "staff" });

    // If no staff are found
    if (staffs.length === 0) {
      return res
        .status(404)
        .json({ message: "No staff available at the moment." });
    }

    // Return the list of staffs
    res.status(200).json({ staffs, totalStaff: staffs.length });
  } catch (error) {
    console.error("Error fetching staffs:", error);
    res.status(500).json({ error: "Server error. Please try again later" });
  }
};

// FETCH ALL PICKUPS
exports.getAllPickUp = async (req, res) => {
  try {
    const pickUpRequests = await PickUpRequest.find().sort({ createdAt: -1 });
    const users = await User.find({});

    if (pickUpRequests.length === 0) {
      return res.status(404).json({ message: "No pick up requests found." });
    }

    const allOrganicOrders = pickUpRequests.filter(
      (item) => item.category === "Organic"
    ).length;
    const allRecycledOrders = pickUpRequests.filter(
      (item) => item.category === "Recyclable"
    ).length;
    const allHazardousOrders = pickUpRequests.filter(
      (item) => item.category === "Hazardous"
    ).length;

    const ordersCount = {
      allOrganicOrders,
      allRecycledOrders,
      allHazardousOrders,
    };

    // @desc: used in adminDasboard on the frontend
    const allUsers = users.filter((user) => user.role === "user").length;
    const allStaffs = users.filter((user) => user.role === "staff").length;

    // @desc: getting all the staffs ~ used in waste management on the frontend
    const getAllStaffs = users.filter((user) => user.role === "staff");

    const allRoles = {
      allUsers,
      allStaffs,
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);

      // Format options
      const options = { day: "numeric", month: "long", year: "numeric" };

      return date.toLocaleDateString("en-GB", options);
    };

    const updatedPickUpRequest = pickUpRequests.map((order) => ({
      ...order._doc,
      time: formatDate(order.time),
    }));

    res.status(200).json({
      message: "Pick up request retrieved successfully.",
      updatedPickUpRequest,
      ordersCount,
      allRoles,
      getAllStaffs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

//FETCHING COMPLETED PICKUP
exports.getCompletedPickUp = async (req, res) => {
  try {
    const completedPickups = await PickUpRequest.find({
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

//FETCHING PENDING PICKUP
exports.getPendingPickUp = async (req, res) => {
  try {
    const pendingPickups = await PickUpRequest.find({
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

// @desc: deleting staffs from the database
exports.deleteStaff = async (req, res) => {
  const { adminID, driverID } = req.params;
  const { reason } = req.body;

  try {
    const driver = await User.findOne({ _id: driverID, role: "staff" });
    const admin = await User.findOne({ _id: adminID, role: "admin" });

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const deleteStaff = await User.findOneAndDelete({
      _id: driverID,
      role: "staff",
    });

    // @desc: create a reason for deleting the staff
    const createDeleteHistory = await DeleteModel.create({
      reason,
      adminID,
      driverID,
    });

    res.status(200).json({
      sucess: "Staff deleted successfully",
      createDeleteHistory,
      deleteStaff,
    });
  } catch (error) {
    console.log("error from delete staff", error);
    return res.status(500).json({
      error: "Server Error. Try Again Later",
    });
  }
};
