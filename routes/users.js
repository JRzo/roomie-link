const express = require("express");
const router = express.Router();
const usersController = require("../controllers/posts"); 
const { ensureAuth } = require("../middleware/auth");

router.delete('/deleteAccount', ensureAuth, usersController.deleteAccount);

module.exports = router;