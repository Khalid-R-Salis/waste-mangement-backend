const express = require("express");
const router = express.Router();

// MIDDLEWARE IMPORT
const { authMiddleware } = require("../middlewares/authMiddlewares");
const { adminMiddleware } = require("../middlewares/adminMiddleware");
const { driverMiddleware } = require("../middlewares/driverMiddleware");

// IMPORTING AUTH CONTROLLERS
const {
  registerController,
  loginUserController,
  resetPasswordController,
} = require("../controllers/authController");

// IMPORTING ADMIN CONTROLLERS
const {
  createNewStaff,
  updatePickUpRequest,
  getAllUsers,
  getAllStaff,
  getAllPickUp,
  getCompletedPickUp,
  getPendingPickUp,
  deleteStaff,
} = require("../controllers/adminController");

//IMPORTING USER CONTROLLERS
const {
  requestPickUp,
  updateUserProfile,
  updateUserPassword,
  completedPickups,
  pendingPickups,
  allUserPickups,
  searchPickUp,
  submitContactController,
  deletePickupController
} = require("../controllers/userController");

// @desc: Importing all driver controllers
const {
  getAllDriverPickupOrder,
  completeOrderPickUp,
  searchOrder,
  rejectPickupOrder,
} = require("../controllers/driverController");

//AUTH ROUTES(PUBLIC ROUTES).
router.post("/register", registerController);
router.post("/login", loginUserController);
router.put("/reset-password", resetPasswordController);

// ADMIN PROTECTED ROUTES
router.post(
  "/admin/create-new-staff",
  authMiddleware,
  adminMiddleware,
  createNewStaff
);
router.patch(
  "/admin/update-pickup-request/:id",
  authMiddleware,
  adminMiddleware,
  updatePickUpRequest
);
router.get("/admin/all-users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/admin/all-staff", authMiddleware, adminMiddleware, getAllStaff);
router.get("/admin/all-pickup", authMiddleware, adminMiddleware, getAllPickUp);
router.get(
  "/admin/completed-pickup",
  authMiddleware,
  adminMiddleware,
  getCompletedPickUp
);
router.get(
  "/admin/pending-pickup",
  authMiddleware,
  adminMiddleware,
  getPendingPickUp
);
router.delete(
  "/admin/delete-staff/:adminID/:driverID",
  authMiddleware,
  adminMiddleware,
  deleteStaff
);

//USER ROUTES PROTECTED
router.post("/user/request-pickup/:userId", authMiddleware, requestPickUp);
router.post("/user/search-pickup", authMiddleware, searchPickUp);
router.delete('/user/delete-pickup/:userID/:orderID', authMiddleware, deletePickupController);
router.patch("/users/:userId", authMiddleware, updateUserProfile);
router.put("/users/:userId/password", authMiddleware, updateUserPassword);
router.get("/user/completed-pickup/:userId", authMiddleware, completedPickups);
router.get("/user/pending-pickup/:userId", authMiddleware, pendingPickups);
router.get("/user/all-user-pickups/:userId", authMiddleware, allUserPickups);
router.post("/user/get-in-touch", authMiddleware, submitContactController);

// @desc: Driver protected routes
router.get(
  "/staff/all-orders/:driverID",
  authMiddleware,
  driverMiddleware,
  getAllDriverPickupOrder
);
router.post(
  "/staff/complete-order/:orderID/:driverID",
  authMiddleware,
  driverMiddleware,
  completeOrderPickUp
);
router.post(
  "/staff/reject-order/:orderID/:driverID",
  authMiddleware,
  driverMiddleware,
  rejectPickupOrder
);
router.post(
  "/staff/search-order",
  authMiddleware,
  driverMiddleware,
  searchOrder
);
module.exports = router;
