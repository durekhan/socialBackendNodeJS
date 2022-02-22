const jwt = require("jsonwebtoken");
import express from "express";

module.exports = (req:express.Request, res:express.Response, next:express.NextFunction) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token)
            return res.status(401).json({ message: "Authentication Failed" });
        res.decodedData = jwt.verify(token, process.env.secretKey!);
        next();
    } catch (error:any) {
        return res.status(401).json({ message: "Authentication Failed" });
    }
};
