const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  profileImage: {
    type: String,
  },
  profileCloudinaryId: {
    type: String,
  },
  // Add these new fields:
  college: {
    type: String,
    default: '' // Provide a default empty string
  },
  year: {
    type: Number,
    default: 25 // Or a suitable default for your range input
  },
  major: {
    type: String,
    default: ''
  },
  sex: {
    type: String,
    enum: ['Male', 'Female', 'Other'], // Restrict to these values
  },
  enableComments: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['Technology', 'Travel', 'Food', 'Other'], // Restrict to these values
  },
  hobbies: {
    type: String,
    default: '' // Store as a comma-separated string, or consider an array of strings
  },

  social: {
    type: String,
    default: ''
  }
});

// Password hash middleware.
UserSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

// Helper method for validating user's password.
UserSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

module.exports = mongoose.model("User", UserSchema);