const express = require("express");
const HttpError = require("../models/http-error");
const {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlaceById,
    deletePlaceById,
} = require("../controllers/places-controllers");
const { check } = require("express-validator");

const router = express.Router();

router.get("/:pid", getPlaceById);
router.get("/user/:uid", getPlacesByUserId);

router.post(
    "/",
    [
        check("title").not().isEmpty(),
        check("description").isLength({ min: 5 }),
        check("address").not().isEmpty(),
    ],
    createPlace
);

router.patch(
    "/:pid",
    [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
    updatePlaceById
);
router.delete("/:pid", deletePlaceById);

module.exports = router;
