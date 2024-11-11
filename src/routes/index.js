const express = require("express");
const router = express.Router();

// MIDDLEWARE IMPORT
const { authMiddleware } = require("../middlewares/authMiddlewares");
const { adminMiddleware } = require("../middlewares/adminMiddleware");

// IMPORTING AUTH CONTROLLERS
const {
  registerController,
  loginUserController,
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
} = require("../controllers/userController");

//AUTH ROUTES(PUBLIC ROUTES).
router.post("/register", registerController);
router.post("/login", loginUserController);

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

//USER ROUTES PROTECTED
router.post("/user/request-pickup/:userId", authMiddleware, requestPickUp);
router.post("/user/search-pickup", authMiddleware, searchPickUp);

router.patch("/users/:userId", authMiddleware, updateUserProfile);
router.put("/users/:userId/password", authMiddleware, updateUserPassword);
router.get("/user/completed-pickup/:userId", authMiddleware, completedPickups);
router.get("/user/pending-pickup/:userId", authMiddleware, pendingPickups);
router.get("/user/all-user-pickups/:userId", authMiddleware, allUserPickups);
router.post("/user/get-in-touch", authMiddleware, submitContactController);

module.exports = router;
