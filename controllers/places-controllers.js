const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const Place = require("../models/place");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const fs = require("fs");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        return next(
            new HttpError("Something went wrong , couldnot find a place", 500)
        );
    }

    if (!place) {
        return next(
            new HttpError("Could not find places for given place id", 404)
        );
        // instead of next(error) we can also
        // throw error;
        // but this works only in synchronous code
        // for async code we need to use next(error)
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    // let places;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate("places");
        // places = await Place.find({ creator: userId });
    } catch (err) {
        return next(
            new HttpError("Something went wrong , couldnot find a place", 500)
        );
    }

    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(
            new HttpError("Could not find places for given user id", 404)
        );
    }

    res.json({
        places: userWithPlaces.places.map((p) => p.toObject({ getters: true })),
    });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed", 422));
    }

    const { title, description, address, creator } = req.body;
    let coordinates = {
        lat: 78.47848,
        lng: -72.5784,
    };
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator,
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        return next(new HttpError("Creating new place failed", 500));
    }

    if (!user) {
        return next(new HttpError("Could not find user for provided id", 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err.message);
        return next(new HttpError("Creating a Place failed", 500));
    }

    res.status(201).json(createdPlace);
};

const updatePlaceById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed", 422));
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        return next(
            new HttpError("Something went wrong , couldnot find a place", 500)
        );
    }

    if (place.creator.toString() !== req.userData.userId) {
        return next(
            new HttpError("You are not allowed to edit this place", 401)
        );
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        return next(
            new HttpError("Something went wrong , couldnot update a place", 500)
        );
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate("creator");
    } catch (err) {
        return next(
            new HttpError(
                "Something went wrong , couldnot delete place 333",
                500
            )
        );
    }

    if (!place) {
        return next(new HttpError("Could not find place for this id", 404));
    }

    if(place.creator.id!==req.userData.userId){
        return next(
            new HttpError("You are not allowed to delete this place", 401)
        );
    }

    const imagePath = place.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.deleteOne({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        return next(
            new HttpError("Something went wrong , couldnot delete place", 500)
        );
    }

    fs.unlink(imagePath, (err) => {
        console.log(err);
    });

    res.status(200).json({ message: `Place Deleted with id ${placeId}` });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
