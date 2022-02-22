"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token)
            return res.status(401).json({ message: "Authentication Failed" });
        res.decodedData = jwt.verify(token, process.env.secretKey);
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Authentication Failed" });
    }
};
