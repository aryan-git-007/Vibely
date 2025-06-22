import express from "express";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path"
import User from "./models/user.js";
import Post from "./models/post.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const port = 8000;

// Define __dirname first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Then use it in middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine" , "ejs");
app.use(cookieParser());

app.get("/create",(req,res)=>{
    res.render("index");
});

//creating user 
    app.post("/register", async (req,res)=>{
    let{email , password , username , name , age}=req.body;

    //checking user exist
     let user = await  User.findOne({email});
     if(user) return res.status(500).send("User is already exist");
    
    //bcrypt for password encryption
    bcrypt.genSalt(10 , (err, salt)=>{
        if(err) console.log(`Salt is not working ${err}`);    
        bcrypt.hash(password , salt , async (err , hash)=>{
        if(err) console.log(`hash is not working ${err}`); 
        let user = await User.create({
            username,
            name,
            email,
            age,
            password:hash
           });
           const token = jwt.sign({email: email, userid: user._id}, "secret");
           res.cookie("token", token);
           res.send('registered');
        })
    });
});

//login user 
app.post("/login",async (req, res) => {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(500).send("Something went wrong");

    bcrypt.compare(password, user.password, (err, result) => {
        if (err) return res.status(500).send("Error comparing passwords");
        const token = jwt.sign({email: email, userid: user._id}, "secret");
        res.cookie("token", token);
        if (result) res.status(200).redirect("/profile");
        else res.redirect("/login");  
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

//logout
app.get("/logout", (req, res) => {
    res.cookie("token" ,"")
    res.render("login");
});

//profile route with middleware
app.get('/profile', isloggedin ,async (req,res)=>{
    const user = await User.findOne({email :req.user.email}).populate("posts")
    // Pass loggedInUserId to check for likes and ownership
     res.render("profile" , {user, loggedInUserId: req.user.userid})
})

//post
app.post("/post", isloggedin, async (req,res)=>{
    let user = await User.findOne({email : req.user.email});
    let {content} =req.body;
   let post = await Post.create({
        user:user._id,
        content
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
})

//like feature
app.get("/like/:id",isloggedin ,async (req , res)=>{
    let post = await Post.findOne({_id:req.params.id}).populate("user")
    // console.log(req.user);
    post.like.push(req.user.userid)
    await post.save();
    res.redirect("/profile")
})

// Edit post route
app.post("/post/edit/:id", isloggedin, async (req, res) => {
    try {
        const { content } = req.body;
        // Find the post first
        const post = await Post.findOne({ _id: req.params.id });

        if (!post) {
            return res.status(404).send("Post not found.");
        }
        
        // Check if the logged-in user is the author of the post
        if (post.user.toString() !== req.user.userid.toString()) {
            return res.status(403).send("You do not have permission to edit this post.");
        }

        if (!content || content.trim() === '') {
            return res.status(400).send("Post content cannot be empty");
        }

        post.content = content.trim();
        await post.save();

        res.redirect("/profile");
    } catch (error) {
        console.error("Error editing post:", error);
        res.status(500).send("Error editing post");
    }
});

// Delete post route
app.get("/post/delete/:id", isloggedin, async (req, res) => {
    try {
        // Find the post first
        const post = await Post.findOne({ _id: req.params.id });

        if (!post) {
            return res.status(404).send("Post not found.");
        }
        
        // Check if the logged-in user is the author of the post
        if (post.user.toString() !== req.user.userid.toString()) {
            return res.status(403).send("You do not have permission to delete this post.");
        }

        // Remove post from user's posts array
        const user = await User.findOne({ email: req.user.email });
        user.posts = user.posts.filter(postId => postId.toString() !== req.params.id);
        await user.save();

        // Delete the post
        await Post.findByIdAndDelete(req.params.id);

        res.redirect("/profile");
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Error deleting post");
    }
});

//middleware
function isloggedin(req, res, next) {
   if(!req.cookies.token || req.cookies.token === "") {
       return res.redirect("/login");
   }
   try {
       const data = jwt.verify(req.cookies.token, "secret");
       req.user = data;
       next();
   } catch (error) {
       res.send("Invalid token");
   }
}

//server connection 
app.listen(port ,()=>{
  try {
    console.log(`Server is running on Port ${port}`);
  } catch (error) {
   console.log(`server is not running error: ${error}`);
  }
})

//database connection 
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/app1");
        console.log(`MongoDb connected successfully`);
    } catch (error) {
        console.log(`MongoDb connection error :${error}`);   
    }
};

connectDB();

//database connection 
try {
    mongoose.connect("mongodb://127.0.0.1:27017/app1");
    console.log(`MongoDb connected succesfully`);
} catch (error) {
    console.log(`MongoDb connection error :${error}`);   
}