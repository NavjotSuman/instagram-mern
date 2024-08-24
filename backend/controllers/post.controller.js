import sharp from "sharp";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

// ================================= Create New Post ============================================
export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    let image = req.file;
    const authorId = req.user._id;

    if (!image) return res.status(400).json({ message: "Image required" });

    // image upload
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    // buffer to data uri
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption: caption || "",
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      message: "New post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log(`Error at addNewPost Controller : ${error}`);
    res.status(500).json({
      message: `Internal Server error`,
      success: false,
    });
  }
};

// ================================= get All Post ============================================
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: `Internal Server error`,
      success: false,
    });
  }
};

// ================================= get User Post ============================================
export const getUserPost = async (req, res) => {
  try {
    const authorId = await req.user._id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: `Internal Server error`,
      success: false,
    });
  }
};

// ================================= like Dislike Post ============================================
export const likeDislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // dislike the Post
      await Post.updateOne({ _id: postId }, { $pull: { likes: req.user._id } });

      // implement socket io for real time notification
      return res.status(200).json({ message: "liked Disliked", success: true });
    } else {
      // like the post
      await Post.updateOne({ _id: postId }, { $push: { likes: req.user._id } });

      // implement socket io for real time notification
      return res.status(200).json({ message: "Post liked", success: true });
    }
  } catch (error) {
    res.status(500).json({
      message: `Internal Server error`,
      success: false,
    });
  }
};

// ================================= Comment on Post ============================================
export const addComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;
    const { text } = req.body;
    if (!text)
      return res
        .status(400)
        .json({ message: "text is required", success: false });

    let post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json(`Post Not Found`);
    }

    post.comments.push({ text: text, author: userId });
    await post.save();
    return res.status(201).json({
      message: "Comment Added",
      post: post.populate({
        path: "comments",
        sort: { authorId: -1 },
        populate: { path: "author", select: "username profilePicture" },
      }),
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: `Internal Server error`,
      success: false,
    });
  }
};

// ================================= get comments of a Post ============================================
export const getCommentsOfPost = async (req, res) => {
  try {
    const { postId } = req.params;
    let comments = await Post.findById(postId).populate({
      path: "comments",
      sort: { authorId: -1 },
      populate: {
        path: "author",
        select: "username profilePicture",
      },
    });

    if (!comments)
      return res
        .status(404)
        .json({ message: "No comments found for this post", success: false });

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({
      message: `Internal Server error`,
      success: false,
    });
  }
};

// ================================= delete post ==========================================================
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    // check if the logged-in user is the owner of the post
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    // delete post
    await Post.findByIdAndDelete(postId);

    // remove the post id from the user's post
    let user = await User.findById(req.user._id);
    user.posts = user.posts.filter((id) => id.toString() !== postId.toString());
    await user.updateOne({ $pull: { bookmarks: post._id } }); // removing post from bookmark
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.log(`error at delete post : ${error}`);
    res.status(500).json({
      message: `Internal Server error`,
      success: false,
    });
  }
};

// ================================= bookmark post ==========================================================
export const bookmarkPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const authorId = req.user._id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      // Remove from Bookmark of user
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res
        .status(200)
        .json({
          type: "unsaved",
          message: "Post removed from bookmark",
          success: true,
        });
    } else {
      // Add to Bookmark of the user
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res
        .status(200)
        .json({ type: "saved", message: "Post bookmarked", success: true });
    }
  } catch (error) {
    res.status(500).json({
      message: `Internal Server error`,
      success: false,
    });
  }
};
