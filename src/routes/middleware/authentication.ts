const jwt = require("jsonwebtoken");
import express, { response } from "express";
import {ApiResponseDto} from "../../dto/response.dto";
module.exports = (req:express.Request, res:express.Response, next:express.NextFunction) => {
    try {
        const response=res as ApiResponseDto;
        
        const token:string = req.headers.authorization!.split(" ")[1];
        if (!token)
            return response.status(401).json({ message: "Authentication Failed" });
        response.decodedData = <ApiResponseDto>jwt.verify(token, process.env.secretKey!);
        next();
    } catch (error:any) {
        return response.status(401).json({ message: "Authentication Failed" });
    }
};
