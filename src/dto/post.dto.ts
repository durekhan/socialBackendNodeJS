import { Document } from "mongoose";

export interface PostDto extends Document{
    userID: string;
    caption: string;
    image: string;
    createdAt:Date;
    updatedAt?: number;
}