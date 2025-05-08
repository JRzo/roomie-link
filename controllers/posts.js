const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post.js");
const User = require("../models/User"); 
// We need the comment models

module.exports = {
  getProfile: async (req, res) => {
    try {
      res.render("profile.ejs", {user: req.user });
    } catch (err) {
      console.log(err);
    }
  },

  getPersonal: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).lean(); // Fetch fresh user data
      res.render("personalUser.ejs", { user: user });
    } catch (err) {
      console.log(err);
    }
  },

  uploadProfilePicture: async (req, res) => {
    try {
      console.log("Starting uploadProfilePicture function...");
      console.log("req.user.id:", req.user ? req.user.id : "User not found in req.user");
  
      if (!req.file) {
        console.log("No file received in req.file.");
        return res.status(400).send("Please upload a file");
      }
      console.log("File received:", req.file); // Log details about the uploaded file
  
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log("Cloudinary Upload Result:", result);
  
      if (!result || !result.secure_url) {
          console.error("Cloudinary upload failed or returned no URL.");
          return res.status(500).send("Cloudinary upload failed. No secure URL received.");
      }
  
      // Update the user's profile in the database
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          profileImage: result.secure_url,
          profileCloudinaryId: result.public_id,
        },
        { new: true } // { new: true } returns the updated document
      );
  
      console.log("Database update attempted.");
      console.log("Updated User from DB (after findByIdAndUpdate):", updatedUser);
  
      if (!updatedUser) {
        console.error("User not found or not updated in database for ID:", req.user.id);
        return res.status(404).send("User not found for updating profile picture.");
      }
  
      console.log("Profile picture updated successfully in DB!");
      res.redirect("/personalUser"); // Redirect back to the profile page
    } catch (err) {
      console.error("Error in uploadProfilePicture:", err); // Log the full error object
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
          res.status(400).send("Invalid user ID format.");
      } else {
          res.status(500).send("Error uploading profile picture: " + err.message); // Send a more specific error message
      }
    }
  },

  updateUserDetails: async (req, res) => {
    try {
      const { college, year, major, sex, enableComments, category, hobbies } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          college: college,
          year: parseInt(year),
          major: major,
          sex: sex,
          enableComments: !!enableComments,
          category: category,
          hobbies: hobbies,
        },
        { new: true, runValidators: true }
      );

      console.log("User details update attempted.");
      console.log("Updated User from DB (after updateUserDetails):", updatedUser);

      if (!updatedUser) {
        console.error("User not found or not updated in database for ID:", req.user.id);
        return res.status(404).send("User not found for updating details.");
      }

      console.log("User details updated successfully in DB!");
      req.flash("success", "Your profile details have been updated!");
      res.redirect("/personalUser");
    } catch (err) {
      console.error("Error in updateUserDetails:", err);
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        res.status(400).send(`Validation error: ${errors.join(', ')}`);
      } else {
        res.status(500).send("Error updating profile details: " + err.message);
      }
    }
  },
// Will change to be get each profile
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      console.log(post)
      res.render("personalUser.ejs", { post: post, user: req.user });
      console.log(post)
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        image: result.secure_url,
        cloudinaryId: result.public_id,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/personalUser");
    } catch (err) {
      console.log(err);
    }
  },
};
