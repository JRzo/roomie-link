// routes/main.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/", homeController.getIndex);
router.get("/profile", ensureAuth, postsController.getProfile);
router.get('/personalUser',postsController.getPersonal);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup); // This is the line we are focusing on
router.post("/signup", authController.postSignup);


// This is the only line that should remain uncommented for now.
router.get("/signup", authController.getSignup); // Line 26 in your previous setup.

module.exports = router;