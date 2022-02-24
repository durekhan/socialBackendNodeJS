import {JwtPayload} from "jsonwebtoken";
import { PostDto } from "./post.dto";
import { UserDto } from "./user.dto";
import {Response} from "express";
export interface ApiResponseDto extends Response{
    decodedData?:JwtPayload|string;
    post?:PostDto;
    user?:UserDto;
}