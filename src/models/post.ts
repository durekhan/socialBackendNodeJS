import {Document,Schema,model} from "mongoose";
import { PostDto } from "../dto/post.dto";

const postSchema:Schema = new Schema<PostDto>({
    userID: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        required: true,
    },
    image: {
        data: Buffer,
        contentType: String,
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

module.exports = model<PostDto>("Post", postSchema);
