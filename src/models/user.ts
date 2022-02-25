import {Document,Schema,model} from "mongoose";
import { UserDto } from "../dto/user.dto";

const userSchema:Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    DOB: {
        type: Date,
        required: false,
    },
    gender: {
        type: String,
        required: false,
    },
    followingList: {
        type: [String],
        required: false,
    },
    createdAt: {
        type: Date,
        required: false,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        required: false,
    },
});

module.exports = model<UserDto>("User", userSchema);
