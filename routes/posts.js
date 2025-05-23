// routes/posts.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts"); // This is key!
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/:id", ensureAuth, postsController.getPost);

router.post("/uploadProfilePicture", ensureAuth, upload.single("file"), postsController.uploadProfilePicture);

router.post("/updateUserDetails", ensureAuth, postsController.updateUserDetails);

router.post("/createPost", upload.single("file"), postsController.createPost);

router.post('/applyPreferenceFilter', postsController.applyPreferenceFilter);
router.get('/application', ensureAuth, postsController.getApplication);
router.post('/sendMatchRequest/:id', ensureAuth, postsController.sendMatchRequest);
router.post('/acceptMatchRequest/:id', ensureAuth, postsController.acceptMatchRequest);
router.post('/rejectMatchRequest/:id', ensureAuth, postsController.rejectMatchRequest);


module.exports = router;