import { profile } from "console";
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
     username:{
        type:String,
        required:true
     },
     name:{
        type:String,
        required:true
     },
     age:{
        type:Number,
        required:true
     },
     email:{
        type:String,
        required:true
     },
     password:{
        type:String,
        required:true
     },
     profile:{
      type:String,
      default:"default.png"
     },
     posts:[
          {
           type:mongoose.Schema.Types.ObjectId,
           ref:"Post"
         }  
          ]
});
export default mongoose.model("User" , userSchema)