import express from "express";
import {UserDto} from "../dto/user.dto";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");
import { ObjectId } from "mongoose";
import { ApiResponseDto } from "../dto/response.dto";
const authentication = require("./middleware/authentication");

//Get all users
router.get("/", async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    try {
        const users:UserDto[] = await User.find();
        response.json(users);
    } catch (error:any) {
        response.status(500).json({ message: error.message });
    }
});

//Create user
router.post("/signup", async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    try {
        const existingUser:UserDto = await User.findOne({ email: req.body.email });
        if (existingUser != null)
            return response.status(400).json({ message: "User already exists" });
        const hash:string = await bcrypt.hash(req.body.password, 10);
        
        const user:UserDto = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            DOB: req.body.DOB,
            gender: req.body.gender,
        });
        const newUser:UserDto = await user.save();
        response.json(newUser);
    } catch (error:any) {
        response.status(400).json({ message: error.message });
    }
});

//Get User
router.post("/login", async (req:express.Request, res:express.Response) => {
    try {
        console.log("INSIDE LOGIN CONTROLLER ");
        const user:UserDto = await User.findOne({ email: req.body.email });
        
        if (user == null)
            return res.status(401).json({ message: "Invalid credentials" });
        const result:boolean = await bcrypt.compare(req.body.password, user.password);
        if (!result)
            return res.status(401).json({ message: "Invalid credentials" });
        const loggedInUser:UserDto = await user.save();
        
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
    const response=res as ApiResponseDto;
    response.json(response.user);
});

//Delete User
router.get("/delete/:id", authentication, getUser, async (req:express.Request, res:express.Response) => {
    const response= res as ApiResponseDto;
    try {

        await response.user!.remove();
        response.json({ message: "User deleted" });
    } catch (error:any) {
        response.status(500).json({ message: error.message });
    }
});

//Update User
router.post("/update/:id", authentication, getUser, async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    if (req.body.name != null) {
        response.user!.name = req.body.name;
    }
    if (req.body.email != null) {
        response.user!.email = req.body.email;
    }
    response.user!.updatedAt = Date.now();
    try {
        const updatedUser:UserDto = await response.user!.save();
        response.json(updatedUser);
    } catch (error:any) {
        response.status(400).json({ message: error.message });
    }
});

//Follow User
router.post("/follow", authentication, async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    try {
        const user:UserDto = await User.findById(req.body.userID);
        if (user === null)
            return response.status(404).json({ message: "Cannot find user" });
        if (
            user.followingList.length &&
            user.followingList.includes(req.body.followerID)
        )
            return response.status(400).json({ message: "Already a follower" });
        user.followingList.push(req.body.followerID);
        response.json(await user.save());
    } catch (error:any) {
        return res.status(500).json({ message: error.message });
    }
});

//Unfollow User
router.post("/unfollow", authentication, async (req:express.Request, res:express.Response) => {
    const response=res as ApiResponseDto;
    try {
        const user:UserDto = await User.findById(req.body.userID);
        if (user === null)
            return response.status(404).json({ message: "Cannot find user" });
        const followingList = user.followingList.filter(
            (id: ObjectId) => id !== req.body.followerID
        );
        user.followingList = followingList;
        response.json(await user.save());
    } catch (error:any) {
        return res.status(500).json({ message: error.message });
    }
});

//Middleware to get the user from ID
async function getUser(req:express.Request, res:ApiResponseDto, next:express.NextFunction) {
    let user: UserDto;
    const response=res as ApiResponseDto;
    try {
        user = await User.findById(req.params.id);
        if (user === null)
            return response.status(404).json({ message: "Cannot find user" });
    } catch (error: any){
        // function isError(something:any): something is Error{
        //     return something.message!==null;
        // }
        // if(isError)
        // {
            return response.status(500).json({ message: error.message });
        //}
    }
    
    response.user = user;
    next();
}

function getToken(email: string, id: string) {
    const token = jwt.sign({ email, id }, "socialSecretKey", {
        expiresIn: "2d",
    });
    return token;
}

module.exports = router;
