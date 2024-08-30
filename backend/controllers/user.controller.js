import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import Post from "../models/post.model.js";
import getDataUri from "../lib/utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";

//  ====================== Register User: ===================================
export const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // check whether the email exists in databse or not
    const emailRegex = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: `invlid email syntax`,
        success: false,
      });
    }

    const isExistingEmail = await User.findOne({ email });
    if (isExistingEmail) {
      return res.status(400).json({
        message: `email already existing `,
        success: false,
      });
    }

    const isExistingUsername = await User.findOne({ username });
    if (isExistingUsername) {
      return res.status(400).json({
        message: `username alresy taken`,
        success: false,
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: `password must be atleast 8 character long`,
        success: false,
      });
    }

    // hasing the password with salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      fullName,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        message: {
          id: newUser._id,
          fullName: newUser.fullName,
          username: newUser.username,
          fullName: newUser.fullName,
          email: newUser.email,
          followers: newUser.followers,
          following: newUser.following,
          profilePicture: newUser.profilePicture,
        },
        success: true,
      });
    } else {
      return res.status(400).json({
        message: `Account Not Created`,
        success: false,
      });
    }
  } catch (error) {
    console.log(`Error at Register Controller : ${error}`);
    res.status(500).json({
      message: `Internal Server Error`,
      success: false,
    });
  }
};

//  ======================= LOGIN User: =====================================
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: `Fields Must be filled`,
        success: false,
      });
    }

    let user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        message: `Username doesn't Exists`,
        success: false,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password || ""
    );

    if (!isPasswordCorrect) {
      return res.status(404).json({
        message: `Incorrect Password`,
        success: false, 
      });
    }

    generateTokenAndSetCookie(user._id, res);

    // populate each post if in the posts array
    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    );
    user = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts,
    };

    res.status(200).json({
      message: `Welcome back ${user.username}`,
      success: true,
      user,
    });
  } catch (error) {
    console.log(`Error at Login Controller : ${error}`);
    res.status(500).json(`Internal Server Error`);
  }
};

//  ======================= LOGOUT User: =====================================
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out Successfully", success: true });
  } catch (error) {
    console.log(`Error at Logout Controller : ${error}`);
    res.status(500).json({
      message: `Internal Server Error`,
      success: false,
    });
  }
};

//  ======================= getProfile User: =====================================
export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select("-password")
      .populate({ path: "posts", createdAt: -1 })
      .populate("bookmarks");
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(`Error at getProfile Controller: ${error}`);
    res.status(500).json({
      message: `internal server error`,
      success: false,
    });
  }
};

//  ======================= editProfile User: =====================================
export const editProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bio, gender, fullName } = req.body;
    let profilePicture  = req.file;
    let cloudResponse;

    let user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: `User Not Found`,
        success: false,
      });
    }

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    user.bio = bio || user.bio;
    user.gender = gender || user.gender;
    user.fullName = fullName || user.fullName;
    user.profilePicture = cloudResponse?.secure_url || user.profilePicture;

    user = await user.save();

    if (user) {
      return res
        .status(200)
        .json({ message: `Profile Updated`, success: true, user: user });
    }
  } catch (error) {
    console.log(`Error at editProfile Controller : ${error}`);
    res.status(500).json({
      message: `Internal Server error`,
      success: false,
    });
  }
};

//  ======================= suggested User: =====================================
export const suggestedUser = async (req, res) => {
  try {
    const usersFollowedByMe = await User.findById(req.user._id).select(
      "following"
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: req.user._id },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUser = filteredUsers.slice(0, 4);

    return res.status(200).json({
      success: true,
      users: suggestedUser,
    });
  } catch (error) {
    console.log(`Error at suggestedUser Controller : ${error}`);
    res.status(500).json({ message: `Internal Server error`, success: false });
  }
};

//  ======================= followUnfollow User: =====================================

export const followUnfollowUser = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherUserId = req.params.id;

    if (myId.toString() === otherUserId.toString()) {
      return res.status(400).json({
        message: `You cannot follow userself`,
        success: false,
      });
    }

    const me = await User.findById(myId).select("-password");
    const targetUser = await User.findById(otherUserId).select("-password");

if (!me || !targetUser) {
  return res.status(400).json({
    message: `user not Found`,
    success: false,
  });
}

const isFollowing = me.following.includes(otherUserId)
if (isFollowing) {
  // process to Unfollow the user
await Promise.all([
  User.findByIdAndUpdate({_id:myId},{$pull:{following:otherUserId}}),
  User.findByIdAndUpdate({_id:otherUserId},{$pull:{followers:myId}}),
])
return res.status(200).json({
  message: `user unfollowed successfully`,
  success: true,
});
}
else{
  // process to Follow the User
  await Promise.all([
    User.findByIdAndUpdate({_id:myId},{$push:{following:otherUserId}}),
    User.findByIdAndUpdate({_id:otherUserId},{$push:{followers:myId}})
  ])
  return res.status(200).json({
    message: `user followed successfully`,
    success: true,
  });
}

  } catch (error) {
    console.log(`Error at followUnfollowUser : ${error}`);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
