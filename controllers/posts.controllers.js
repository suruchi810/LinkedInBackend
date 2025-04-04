import User from '../models/user.model.js';
import Post from '../models/posts.model.js';
import Comment from '../models/comments.model.js';

export const activeCheck = async (req, res) => {
    return res.status(200).json({message:"RUNNING"})
}

export const createPost = async (req, res) => {
    const {token} = req.body;
    try {
        const user = await User.findOne({token: token});
        if(!user){
            return res.status(401).json({ message: "User not found" });
        }
        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file ? req.file.filename : "",
            filetype : req.file ? req.file.mimetype.split("/")[1] : "",  
        });

        await post.save();
        return res.status(200).json({msg: "post created successfully now"});

    } catch (error) {
        return res.status(500).json({msg:"some error", error: error});
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'name username email profilePicture');
        return res.json({ posts});
    } catch (error) {
        return res.status(500).json({msg:"some error", error: error});
    }
}

export const deletePost = async (req, res) => {
    const {token, post_id} = req.body;
    try {
        const user = await User.findOne({token: token}).select("id");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const post = await Post.findOne({_id: post_id});
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (String(post.userId)!== String(user._id)) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }
        await post.deleteOne({_id: post_id});
        return res.status(200).json({msg: "Post deleted successfully"});
    }catch (error) {
        return res.status(404).send({message: error.message});
    }
}

export const commentPost = async (req, res) => {
    const {token, post_id, commentBody} = req.body;
    try {
        const user = await User.findOne({token: token}).select("_id");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const post = await Post.findOne({_id: post_id});
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const comment = new Comment({
            userId: user._id,
            postId: post._id,
            body: commentBody,
        });
        await comment.save();
        return res.status(200).json({ message: "Comment saved" });
    } catch (error) {
        return res.status(404).send({message: error.message});
    }
}

export const get_comments_by_posts = async (req, res) => {
    const { post_id } = req.query;

    try {
        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comments = await Comment.find({ postId: post_id }).populate("userId", "username name");

        return res.json({ comments }); 

    } catch (err) {
        return res.status(500).json({ message: err.message }); 
    }
};


export const commentDelete = async (req, res) => {
    const {token, comment_id} = req.body;
    try {
        const user = await User.findOne({token: token}).select("_id");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const comment = await Comment.findOne({"_id": comment._id});
        
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (String(comment.userId)!== String(user._id)) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }
        comment.deleteOne();
        return res.status(200).json({ message: "Comment deleted" });
    } catch (err) {
        return res.status(404).send({message: err.message});
    }
}

export const incLikes = async (req, res) => {
    const { post_id } = req.body.data;

    try {
        // Assuming Post is your Mongoose model
        const post = await Post.findOne({ "_id": post_id });
    

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.likes = post.likes + 1; // Increment likes
        await post.save(); // Await the save operation

        return res.status(200).json({ message: "Likes incremented successfully", likes: post.likes });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};



