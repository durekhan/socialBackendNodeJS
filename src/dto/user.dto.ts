import { Document, ObjectId } from "mongoose";
export interface UserDto extends Document{
    followingList: Array<ObjectId>;
    id: string;
    name:string;
    email: string;
    password: string;
    DOB: Date;
    gender: string;
    createdAt:Date;
    updatedAt?: number;
}