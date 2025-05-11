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
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

// Get the prefenr
router.get('/preferences', postsController.getPreferences)

router.get("/signup", authController.getSignup); 


// Application file
router.get('/application', ensureAuth, postsController.getApplication)

module.exports = router;