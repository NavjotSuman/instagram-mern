import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        req: true
    },
    caption: {
        type: String,
        default: ''
    },
    image: {
        type: String,
    },
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    comments:[
        {
            text:{
                type: String,
                required: true
            },
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        }
    ]
},{timestamps:true})

const Post = mongoose.model("Post",postSchema)
export default Post