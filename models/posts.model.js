import mongoose from "mongoose";

const postsSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    body:{
        type: String,
        default : ""
    },
    likes:{
        type: Number,
        default : 0,
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    media:{
        type: String,
        default : ""
    },
    active: {
        type: Boolean,
        default: true
    },
    filetype:{
        type: String,
        default : ""
    }
});

const Post = mongoose.model("Post", postsSchema);
export default Post;