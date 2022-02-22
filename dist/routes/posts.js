"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Post = require("../models/post");
const User = require("../models/user");
const authentication = require("./middleware/authentication");
//Get all posts
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post.find();
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
//Get all posts for a user
router.get("/user", authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post.find({ userID: req.query.id });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
//Get feed for a user
router.get("/feed", authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1 } = req.query;
    const limit = 3;
    try {
        const user = yield User.findById(req.query.id);
        if (user === null)
            return res.status(401).json({ message: "User not found" });
        let posts = yield Post.find({
            userID: { $in: user.followingList },
        })
            .skip((page - 1) * limit)
            .limit(limit);
        if (req.query.filter)
            posts = posts.filter((post) => post.caption.includes(req.query.filter));
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
//Create post
router.post("/create", authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const post = new Post({
        userID: req.body.userID,
        caption: req.body.caption,
    });
    try {
        const user = yield User.findById(req.body.userID);
        if (user === null)
            return res.status(404).json({ message: "Cannot find user" });
        const newPost = yield post.save();
        const io = req.app.get("socketIO");
        io.emit("postAdded", newPost.toObject());
        res.json(newPost);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
//Get post
router.get("/:id", authentication, getPost, (req, res) => {
    res.json(res.post);
});
//Delete post
router.get("/delete/:id", authentication, getPost, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield res.post.remove();
        res.json({ message: "Post deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
//Update Post
router.post("/update/:id", authentication, getPost, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.caption != null) {
        res.post.caption = req.body.caption;
    }
    res.post.updatedAt = Date.now();
    try {
        const updatedPost = yield res.post.save();
        res.json(updatedPost);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
//Middleware to get the post from ID
function getPost(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let post;
        try {
            post = yield Post.findById(req.params.id);
            if (post === null) {
                return res.status(404).json({ message: "Cannot find post" });
            }
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
        res.post = post;
        next();
    });
}
module.exports = router;
