const bcryptjs = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { v4: uuidv4 } = require("uuid");

// CONTROLLER FOR HANDLING USER REGISTRATION
exports.registerController = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");
    let username = `${firstName}_${lastName}`.toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with same email already exists!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    let user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      username,
    });
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
    console.log(`Error from register`, e);
  }
};

// CONTROLLER FOR HANDLING LOGIN OF USERS
exports.loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter both email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        username: user.username,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
    console.log("error from login", e);
  }
};

// @desc: resetting user password by using a default password and sending
// the user an email with the password with message to change password
// for enhanced security
exports.resetPasswordController = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const generateUniqueDriverId = uuidv4().slice(0, 4).toUpperCase();
    const defaultPassword = `trash-${generateUniqueDriverId}`;  

    const salt = await bcryptjs.genSalt(10);
    const hashedDefaultPassword = await bcryptjs.hash(defaultPassword, salt);
    console.log(defaultPassword);

    const emailSubject = `Password Reset Successful!!`;
    const emailText = `Your password has being reset to ${defaultPassword}. This is not a secure password, kindly login to your dashboard and change to a more secure password.
    Disclaimer: We are not liable for any security breach.
    
    Kind Regards,
    WMS Trashaway
    `;

    await sendEmail(user.email, emailSubject, emailText);

    const resetPassword = await User.findOneAndUpdate(
      { _id: user._id, email },
      { password: hashedDefaultPassword },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: 'Password reset successfully', resetPassword });
  } catch (error) {
    console.log("error from reset email", error);
    res.status(500).json({ error: "Server Error. Trya again Later", error });
  }
};
