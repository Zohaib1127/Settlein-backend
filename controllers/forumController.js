import ForumPost from "../models/ForumPost.js";
import Notification from "../models/Notification.js";

/* ============================
    GET ALL POSTS (Already Correct)
============================ */
export const getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate("user", "name profilePic")
      .populate("comments.user", "name profilePic") 
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
    ADD COMMENT (FIXED)
============================ */
export const addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      user: req.user.id,
      text: req.body.text
    });

    await post.save();

    const updatedPost = await ForumPost.findById(req.params.id)
      .populate("user", "name profilePic")
      .populate("comments.user", "name profilePic");

    // 🔔 Notification Logic 
    if (post.user.toString() !== req.user.id.toString()) {
      try {
        const notif = await Notification.create({
          userId: post.user, 
          title: "New Comment 📝",
          message: `Someone replied to your post: "${post.title.substring(0, 20)}..."`,
          type: "reminder",
          link: "/dashboard/forum"
        });
        if (global.io) global.io.to(post.user.toString()).emit("newNotification", notif);
      } catch (notifErr) {
        console.error("Comment Notification Error:", notifErr.message);
      }
    }

    res.json(updatedPost); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
    LIKE POST 
============================ */
export const likePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Like/Unlike Logic
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      
      // 🔔 Notification Logic
      if (post.user.toString() !== req.user.id.toString()) {
        try {
          const notif = await Notification.create({
            userId: post.user, 
            title: "New Like! ❤️",
            message: `Your post "${post.title.substring(0, 20)}..." got a new like.`,
            type: "success",
            link: "/dashboard/forum"
          });
          if (global.io) global.io.to(post.user.toString()).emit("newNotification", notif);
        } catch (notifErr) { console.error(notifErr.message); }
      }
    } else {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
    }

    await post.save();

    
    const updatedPost = await ForumPost.findById(req.params.id)
      .populate("user", "name profilePic")
      .populate("comments.user", "name profilePic");

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
    CREATE POST (FIXED)
============================ */
export const createPost = async (req, res) => {
  try {
    const post = new ForumPost({
      user: req.user.id,
      title: req.body.title || "Forum Post",
      content: req.body.content
    });

    await post.save();
    const savedPost = await ForumPost.findById(post._id).populate("user", "name profilePic");

    try {
      const notif = await Notification.create({
        userId: req.user.id, 
        title: "New Forum Topic 💬",
        message: `You started a new discussion: "${post.content.substring(0, 30)}..."`,
        type: "reminder",
        link: "/dashboard/forum"
      });
      if (global.io) global.io.to(req.user.id.toString()).emit("newNotification", notif);
    } catch (e) { console.error(e.message); }

    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
    DELETE POST
============================ */
export const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};