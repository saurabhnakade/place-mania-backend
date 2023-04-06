// we have our token in headers of request
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

// one more way is to send it via queries in url
module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    // Authorization : 'Bearer TOKEN'
    let token;
    try {
        token = req.headers.authorization.split(" ")[1];
        if (!token) {
            throw new Error("Auth Failed");
        }
        // .verify returns payload that we stored
        const decodedToken = jwt.verify(token, "secret_key");
        req.userData = { userId: decodedToken.userId };
        next();
    } catch (err) {
        const error = new HttpError("Authentication Failed", 401);
        return next(error);
    }
};
