const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post.js");
const User = require("../models/User"); 
// We need the comment models

module.exports = {
  getProfile: async (req, res) => {
    try {
      let users;
      if (req.user && req.user.college) {
        users = await User.find().sort().lean();
      } else {
        users = await User.find().lean();
      }

      res.render("profile.ejs", { users: users });
    } catch (err) {
      console.error("Error fetching profiles:", err);
      res.status(500).send("Error fetching profiles.");
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
      console.log("File received:", req.file); 
  

      const result = await cloudinary.uploader.upload(req.file.path);
      console.log("Cloudinary Upload Result:", result);
  
      if (!result || !result.secure_url) {
          console.error("Cloudinary upload failed or returned no URL.");
          return res.status(500).send("Cloudinary upload failed. No secure URL received.");
      }
  
    
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          profileImage: result.secure_url,
          profileCloudinaryId: result.public_id,
        },
        { new: true } 
      );
  
      console.log("Database update attempted.");
      console.log("Updated User from DB (after findByIdAndUpdate):", updatedUser);
  
      if (!updatedUser) {
        console.error("User not found or not updated in database for ID:", req.user.id);
        return res.status(404).send("User not found for updating profile picture.");
      }
  
      console.log("Profile picture updated successfully in DB!");
      res.redirect("/personalUser");
    } catch (err) {
      console.error("Error in uploadProfilePicture:", err); 
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
          res.status(400).send("Invalid user ID format.");
      } else {
          res.status(500).send("Error uploading profile picture: " + err.message); 
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

  // Delete account

  deleteAccount: async (req, res) => {
    try {
      const userToDelete = await User.findById(req.user.id);

      if (!userToDelete) {
        console.log("Attempted to delete non-existent user:", req.user.id);
        req.flash("error", "Account not found."); 
        return res.redirect("/profile");
      }

      if (userToDelete.profileCloudinaryId) {
        await cloudinary.uploader.destroy(userToDelete.profileCloudinaryId);
        console.log("Profile picture deleted from Cloudinary for user:", req.user.id);
      }

      const userPosts = await Post.find({ user: req.user.id });
      for (const post of userPosts) {
        if (post.cloudinaryId) { 
          await cloudinary.uploader.destroy(post.cloudinaryId);
        }
      }
      await Post.deleteMany({ user: req.user.id });
      console.log(`Deleted ${userPosts.length} posts for user:`, req.user.id);


      await User.deleteOne({ _id: req.user.id }); 
      console.log("User account deleted successfully for user:", req.user.id);

   
      req.logout((err) => {
        if (err) {
          console.error("Error logging out after account deletion:", err);
          req.flash("error", "Account deleted but error logging out.");

          return res.redirect("/login");
        }
        req.flash("success", "Your account has been deleted.");
        res.redirect("/login"); 
      });

    } catch (err) {
      console.error("Error deleting account:", err);
      req.flash("error", "Failed to delete account: " + err.message);

      res.redirect('/profile');
    }
  }
};
;
