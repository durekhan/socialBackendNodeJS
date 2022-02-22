import express from "express";
import {UserDto} from "../dto/user.dto";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");
import { ObjectId } from "mongoose";
const authentication = require("./middleware/authentication");

//Get all users
router.get("/", async (req:express.Request, res:express.Response) => {
    try {
        const users:UserDto[] = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Create user
router.post("/signup", async (req:express.Request, res:express.Response) => {
    try {
        const existingUser:UserDto = await User.findOne({ email: req.body.email });
        if (existingUser != null)
            return res.status(400).json({ message: "User already exists" });
        const hash:string = await bcrypt.hash(req.body.password, 10);
        
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            DOB: req.body.DOB,
            gender: req.body.gender,
        });
        const newUser:UserDto = await user.save();
        res.json(newUser);
    } catch (error:any) {
        res.status(400).json({ message: error.message });
    }
});

//Get User
router.post("/login", async (req:express.Request, res:express.Response) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        console.log("FOUND ",user);
        if (user == null)
            return res.status(401).json({ message: "Invalid credentials" });
        const result:boolean = await bcrypt.compare(req.body.password, user.password);
        if (!result)
            return res.status(401).json({ message: "Invalid credentials" });
        const loggedInUser = await user.save();
        console.log("loggedInUser ",loggedInUser);
        res.json({
            ...loggedInUser.toObject(),
            token: getToken(user.email,user.id),
        });
    } catch (error:any) {
        res.status(400).json({ message: error.message });
    }
});

//Get User
router.get("/:id", authentication, getUser, (req:express.Request, res:express.Response) => {
    res.json(res.user);
});

//Delete User
router.get("/delete/:id", authentication, getUser, async (req:express.Request, res:express.Response) => {
    try {
        await res.user.remove();
        res.json({ message: "User deleted" });
    } catch (error:any) {
        res.status(500).json({ message: error.message });
    }
});

//Update User
router.post("/update/:id", authentication, getUser, async (req:express.Request, res:express.Response) => {
    if (req.body.name != null) {
        res.user.name = req.body.name;
    }
    if (req.body.email != null) {
        res.user.email = req.body.email;
    }
    res.user.updatedAt = Date.now();
    try {
        const updatedUser:UserDto = await res.user.save();
        res.json(updatedUser);
    } catch (error:any) {
        res.status(400).json({ message: error.message });
    }
});

//Follow User
router.post("/follow", authentication, async (req:express.Request, res:express.Response) => {
    try {
        const user = await User.findById(req.body.userID);
        if (user === null)
            return res.status(404).json({ message: "Cannot find user" });
        if (
            user.followingList.length &&
            user.followingList.includes(req.body.followerID)
        )
            return res.status(400).json({ message: "Already a follower" });
        user.followingList.push(req.body.followerID);
        res.json(await user.save());
    } catch (error:any) {
        return res.status(500).json({ message: error.message });
    }
});

//Unfollow User
router.post("/unfollow", authentication, async (req:express.Request, res:express.Response) => {
    try {
        const user = await User.findById(req.body.userID);
        if (user === null)
            return res.status(404).json({ message: "Cannot find user" });
        const followingList = user.followingList.filter(
            (id: ObjectId) => id !== req.body.followerID
        );
        user.followingList = followingList;
        res.json(await user.save());
    } catch (error:any) {
        return res.status(500).json({ message: error.message });
    }
});

//Middleware to get the user from ID
async function getUser(req:express.Request, res:express.Response, next:express.NextFunction) {
    let user: UserDto;
    try {
        user = await User.findById(req.params.id);
        if (user === null)
            return res.status(404).json({ message: "Cannot find user" });
    } catch (error:any) {
        return res.status(500).json({ message: error.message });
    }
    
    res.user = user;
    next();
}

function getToken(email: string, id: string) {
    const token = jwt.sign({ email, id }, "socialSecretKey", {
        expiresIn: "2d",
    });
    return token;
}

module.exports = router;
