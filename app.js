const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join('uploads','images')));

//CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept,Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
    next();
});

// routes configured in places-routes.js are configured as middleware in app.js
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError("Could not find this route", 404);
    return next(error);
});

//if any middlewares above this yeild errors then this middleware will run
app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }

    res.status(error.code || 500).json({
        message: error.message || "Unknown Error Occurred",
    });
});

// DB connection
mongoose
    .connect(
        "mongodb+srv://saurabhnakade:saurabh2309@cluster0.mata9my.mongodb.net/places?retryWrites=true&w=majority"
    )
    .then(() => {
        app.listen(5000, () => {
            console.log("Server Running on Port 5000");
        });
    })
    .catch((err) => {
        console.log(err);
    });
