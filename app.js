const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");
const usersRoutes=require("./routes/users-routes")
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

// routes configured in places-routes.js are configured as middleware in app.js
app.use("/api/places", placesRoutes);
app.use("/api/users",usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError("Could not find this route", 404);
    return next(error);
});

//if any middlewares above this yeild errors then this middleware will run
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }

    res.status(error.code || 500).json({
        message: error.message || "Unknown Error Occurred",
    });
});

app.listen(5000, () => {
    console.log("Server Running on Port 5000");
});
