import express from "express";
import { Socket } from "socket.io";
import { PostDto } from "../dto/post.dto";
import { ApiResponseDto } from "../dto/response.dto";
import { UserDto } from "../dto/user.dto";
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const authentication = require("./middleware/authentication");

//Get all posts
router.get("/", async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    try {
        const posts:PostDto = await Post.find();
        response.json(posts);
    } catch (error:any) {
        response.status(500).json({ message: error.message });
    }
});

//Get all posts for a user
router.get("/user", authentication, async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    try {
        const posts:PostDto = await Post.find({ userID: req.query.id });
        response.json(posts);
    } catch (error:any) {
        response.status(500).json({ message: error.message });
    }
});

//Get feed for a user
router.get("/feed", authentication, async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    const { page = 1 } = req.query;
    const limit = 3;
    try {
        const user:UserDto = await User.findById(req.query.id);
        if (user === null)
            return res.status(401).json({ message: "User not found" });
        let posts:PostDto[] = await Post.find({
            userID: { $in: user.followingList },
        })
            .skip((page as number - 1) * limit)
            .limit(limit);
        if (req.query.filter)
            posts = posts.filter((post:PostDto) =>
                post.caption.includes(req.query.filter as string)
            );
        response.json(posts);
    } catch (error:any) {
        response.status(500).json({ message: error.message });
    }
});

//Create post
router.post("/create", authentication, async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    const post:PostDto = new Post({
        userID: req.body.userID,
        caption: req.body.caption,
    });
    try {
        const user:UserDto = await User.findById(req.body.userID);
        if (user === null)
            return res.status(404).json({ message: "Cannot find user" });
        const newPost:PostDto = await post.save();
        const io:Socket = req.app.get("socketIO");
        io.emit("postAdded", newPost.toObject());
        response.json(newPost);
    } catch (error:any) {
        response.status(400).json({ message: error.message });
    }
});

//Get post
router.get("/:id", authentication, getPost, (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    res.json(response.post);
});

//Delete post
router.get("/delete/:id", authentication, getPost, async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    try {
        await response.post!.remove();
        response.json({ message: "Post deleted" });
    } catch (error:any) {
        response.status(500).json({ message: error.message });
    }
});

//Update Post
router.post("/update/:id", authentication, getPost, async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    if (req.body.caption != null) {
        response.post!.caption = req.body.caption;
    }
    response.post!.updatedAt = Date.now();
    try {
        const updatedPost:PostDto = await response.post!.save();
        response.json(updatedPost);
    } catch (error:any) {
        response.status(400).json({ message: error.message });
    }
});

//Middleware to get the post from ID
async function getPost(req:express.Request, res:express.Response, next:express.NextFunction) {
    let post:PostDto;
    const response=res as ApiResponseDto;
    try {
        post = await Post.findById(req.params.id);
        if (post === null) {
            return response.status(404).json({ message: "Cannot find post" });
        }
    } catch (error:any) {
        return response.status(500).json({ message: error.message });
    }
    response.post = post;
    next();
}

module.exports = router;
