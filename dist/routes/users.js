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
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express_1.default.Router();
const User = require("../models/user");
const authentication = require("./middleware/authentication");
//Get all users
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User.find();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
//Create user
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield User.findOne({ email: req.body.email });
        if (existingUser != null)
            return res.status(400).json({ message: "User already exists" });
        const hash = yield bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            DOB: req.body.DOB,
            gender: req.body.gender,
        });
        const newUser = yield user.save();
        res.json(newUser);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
//Get User
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findOne({ email: req.body.email });
        console.log("FOUND ", user);
        if (user == null)
            return res.status(401).json({ message: "Invalid credentials" });
        const result = yield bcrypt.compare(req.body.password, user.password);
        if (!result)
            return res.status(401).json({ message: "Invalid credentials" });
        const loggedInUser = yield user.save();
        console.log("loggedInUser ", loggedInUser);
        res.json(Object.assign(Object.assign({}, loggedInUser.toObject()), { token: getToken(user.email, user.id) }));
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
//Get User
router.get("/:id", authentication, getUser, (req, res) => {
    res.json(res.user);
});
//Delete User
router.get("/delete/:id", authentication, getUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield res.user.remove();
        res.json({ message: "User deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
//Update User
router.post("/update/:id", authentication, getUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.name != null) {
        res.user.name = req.body.name;
    }
    if (req.body.email != null) {
        res.user.email = req.body.email;
    }
    res.user.updatedAt = Date.now();
    try {
        const updatedUser = yield res.user.save();
        res.json(updatedUser);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
//Follow User
router.post("/follow", authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.body.userID);
        if (user === null)
            return res.status(404).json({ message: "Cannot find user" });
        if (user.followingList.length &&
            user.followingList.includes(req.body.followerID))
            return res.status(400).json({ message: "Already a follower" });
        user.followingList.push(req.body.followerID);
        res.json(yield user.save());
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}));
//Unfollow User
router.post("/unfollow", authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.body.userID);
        if (user === null)
            return res.status(404).json({ message: "Cannot find user" });
        const followingList = user.followingList.filter((id) => id !== req.body.followerID);
        user.followingList = followingList;
        res.json(yield user.save());
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}));
//Middleware to get the user from ID
function getUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let user;
        try {
            user = yield User.findById(req.params.id);
            if (user === null)
                return res.status(404).json({ message: "Cannot find user" });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
        res.user = user;
        next();
    });
}
function getToken(email, id) {
    const token = jwt.sign({ email, id }, "socialSecretKey", {
        expiresIn: "2d",
    });
    return token;
}
module.exports = router;
