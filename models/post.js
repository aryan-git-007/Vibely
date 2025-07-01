import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
         ref:"User"
    },
    date:{
        type:Date,
        default:Date.now
    },
    content:{
        type:String
    },
    photo: {
        type: String
    },
    like:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]
});
export default mongoose.model("Post" , postSchema)