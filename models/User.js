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

    college: {
        type: String,
        default: ''
    },
    year: {
        type: Number,
        default: new Date().getFullYear()
    },
    major: {
        type: String,
        default: ''
    },
    sex: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    enableComments: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['Technology', 'Travel', 'Food', 'Other'], // <--- **UPDATED LINE**
    },
    hobbies: {
        type: String,
        default: ''
    },
    social: {
        type: String,
        default: ''
    },
    matchRequestsSent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    matchRequestsReceived: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    matchedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
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