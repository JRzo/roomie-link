const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post.js");
const User = require("../models/User");

module.exports = {
    getProfile: async (req, res) => {
        try {
            let users;
            if (req.user && req.user.college) {
                users = await User.find().sort().lean();
            } else {
                users = await User.find().lean();
            }

            res.render("profile.ejs", { users: users, college: req.user.college });
        } catch (err) {
            console.error("Error fetching profiles:", err);
            res.status(500).send("Error fetching profiles.");
        }
    },

    getApplication: async (req, res) => {
        console.log("getApplication route hit!");
        try {
            console.log("Logged in user ID:", req.user.id);
            const user = await User.findById(req.user.id)
                .populate('matchRequestsReceived')
                .populate('matchRequestsSent')
                .populate('matchedUsers')
                .lean();

            console.log("Fetched User Object:", user);

            res.render('applications.ejs', {
                matchRequestsReceived: user.matchRequestsReceived,
                matchRequestsSent: user.matchRequestsSent,
                matchedUsers: user.matchedUsers
            });
        } catch (err) {
            console.error("Error fetching applications:", err);
            res.status(500).send("Error fetching applications.");
        }
    },
sendMatchRequest: async (req, res) => {
    const recipientId = req.params.id;
    const senderId = req.user.id;

    try {
        const recipient = await User.findById(recipientId);
        const sender = await User.findById(senderId);

        if (!recipient || !sender) {
            return res.status(404).json({ message: "User not found." });
        }

        // Add the recipient's ID to the sender's sent requests
        if (!sender.matchRequestsSent.includes(recipientId)) {
            sender.matchRequestsSent.push(recipientId);
            await sender.save();
        }

        // Add the sender's ID to the recipient's received requests
        if (!recipient.matchRequestsReceived.includes(senderId)) {
            recipient.matchRequestsReceived.push(senderId);
            await recipient.save();
        }

        res.json({ success: true, message: "Match request sent." });
    } catch (err) {
        console.error("Error sending match request:", err);
        res.status(500).json({ success: false, message: "Failed to send match request. Please try again." });
    }
},
acceptMatchRequest: async (req, res) => {
    const requesterId = req.params.id; // The user who sent the request
    const accepterId = req.user.id;   // The user accepting the request

    try {
        const requester = await User.findById(requesterId);
        const accepter = await User.findById(accepterId);

        if (!requester || !accepter) {
            return res.status(404).json({ message: "User not found." });
        }

        // Add each other to their matchedUsers arrays
        if (!accepter.matchedUsers.includes(requesterId)) {
            accepter.matchedUsers.push(requesterId);
            await accepter.save();
        }
        if (!requester.matchedUsers.includes(accepterId)) {
            requester.matchedUsers.push(accepterId);
            await requester.save();
        }

        // Remove from received/sent requests
        accepter.matchRequestsReceived = accepter.matchRequestsReceived.filter(id => id.toString() !== requesterId);
        await accepter.save();
        requester.matchRequestsSent = requester.matchRequestsSent.filter(id => id.toString() !== accepterId);
        await requester.save();

        res.json({ success: true, message: "Match request accepted." });
    } catch (err) {
        console.error("Error accepting match request:", err);
        res.status(500).json({ success: false, message: "Failed to accept match request. Please try again." });
    }
},

    rejectMatchRequest: async (req, res) => {
        const requesterId = req.params.id; // The user who sent the request
        const rejecterId = req.user.id;   // The user rejecting the request

        try {
            const requester = await User.findById(requesterId);
            const rejecter = await User.findById(rejecterId);

            if (!requester || !rejecter) {
                return res.status(404).send("User not found.");
            }

            // Remove from received/sent requests
            rejecter.matchRequestsReceived = rejecter.matchRequestsReceived.filter(id => id.toString() !== requesterId);
            await rejecter.save();
            requester.matchRequestsSent = requester.matchRequestsSent.filter(id => id.toString() !== rejecterId);
            await requester.save();

            res.redirect('/application'); // Redirect to the applications page to see the update
        } catch (err) {
            console.error("Error rejecting match request:", err);
            req.flash('error', 'Failed to reject match request. Please try again.');
            res.redirect('/application');
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

        const updateData = {
            college: college,
            year: parseInt(year),
            major: major,
            enableComments: !!enableComments,
            hobbies: hobbies,
        };

        if (sex && sex !== '') updateData.sex = sex;
        if (category && category !== '') updateData.category = category;

        // Optional: Handle empty strings by setting to default
        // if (sex === '') updateData.sex = 'Other';
        // if (category === '') updateData.category = 'Other';

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        // ... rest of your update logic ...
    } catch (err) {
        // ... error handling ...
    }
},

    getPreferences: async (req, res) => {
        try {
            const users = await User.find().lean();

            const userCollege = req.user && req.user.college ? req.user.college : "";

            res.render('profile.ejs', { users: users, college: userCollege, filters: {} });
        } catch (err) {
            console.log(err);
        }
    },
    // Will change to be get each profile
    getPost: async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            console.log(post);
            res.render("personalUser.ejs", { post: post, user: req.user });
            console.log(post);
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
    },
    applyPreferenceFilter: async (req, res) => {
        try {
            const {
                college,
                year,
                major,
                sex,
                category,
                hobbies: hobbiesString,
                hasInstagram
            } = req.body;

            let filterCriteria = {};
            let templateFilters = { ...req.body };

            if (college && college.trim() !== '') {
                filterCriteria.college = new RegExp(college.trim(), 'i');
            }

            if (year && year !== '') {
                filterCriteria.year = parseInt(year);
            }

            if (major && major.trim() !== '') {
                filterCriteria.major = new RegExp(major.trim(), 'i');
            }

            if (sex && sex !== 'Any' && sex !== '') {
                filterCriteria.sex = sex;
            }

            if (category && category !== 'Any' && category !== '') {
                filterCriteria.category = category;
            }

            if (hobbiesString && hobbiesString.trim() !== '') {
                const hobbyArray = hobbiesString.split(',').map(h => h.trim()).filter(h => h !== '');
                if (hobbyArray.length > 0) {
                    filterCriteria.hobbies = { $in: hobbyArray.map(h => new RegExp(h, 'i')) };
                    templateFilters.hobbies = hobbyArray;
                } else {
                    templateFilters.hobbies = '';
                }
            } else {
                templateFilters.hobbies = '';
            }

            if (hasInstagram === 'on') {
                filterCriteria.social = { $exists: true, $ne: null, $ne: '' };
            }

            console.log('Applying Filter Criteria:', filterCriteria);

            const filteredUsers = await User.find(filterCriteria).lean();

            console.log(`Found ${filteredUsers.length} users matching the filter.`);

            const userCollege = req.user && req.user.college ? req.user.college : '';

            res.render('profile.ejs', {
                users: filteredUsers,
                college: userCollege,
                filters: templateFilters
            });

        } catch (err) {
            console.error("Error in applyPreferenceFilter:", err);
            req.flash('error', 'Failed to apply filter. Please try again.');
            res.redirect('/profile');
        }
    },
    // Search for Jobs
    searchJobs: async (req, res) => {
        try {
            res.render('jobSearcher.ejs');
        } catch (err) {
            console.log(err);
        }
    }
};