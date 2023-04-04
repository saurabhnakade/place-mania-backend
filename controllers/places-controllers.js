const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

let DUMMY_PLACES = [
    {
        id: "p1",
        title: "Empire State Building",
        description: "One of the most famous sky scrapers in the world!",
        location: {
            lat: 40.7484474,
            lng: -73.9871516,
        },
        address: "20 W 34th St, New York, NY 10001",
        creator: "u1",
    },
    {
        id: "p2",
        title: "Empire State Building",
        description: "One of the most famous sky scrapers in the world!",
        location: {
            lat: 40.7484474,
            lng: -73.9871516,
        },
        address: "20 W 34th St, New York, NY 10001",
        creator: "u1",
    },
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find((p) => p.id === placeId);

    if (!place) {
        return next(
            new HttpError("Could not find places for given place id", 404)
        );
        // instead of next(error) we can also
        // throw error;
        // but this works only in synchronous code
        // for async code we need to use next(error)
    }

    res.json({ place: place });
};

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_PLACES.filter((p) => p.creator === userId);

    if (!places || places.length === 0) {
        return next(
            new HttpError("Could not find places for given user id", 404)
        );
    }

    res.json({ places: places });
};

const createPlace = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError("Invalid inputs passed", 422);
    }

    const { title, description, address, creator } = req.body;
    let coordinates = {
        lat: 78.47848,
        lng: -72.5784,
    };
    const createdPlace = {
        id: uuidv4(),
        title,
        description,
        location: coordinates,
        address,
        creator,
    };

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json(createdPlace);
};

const updatePlaceById = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError("Invalid inputs passed", 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
    updatedPlace.title = title;
    updatedPlace.description = description;

    const arrayIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
    DUMMY_PLACES[arrayIndex] = updatedPlace;

    res.status(200).json({ place: updatedPlace });
};

const deletePlaceById = (req, res, next) => {
    const placeId = req.params.pid;

    if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
        throw new HttpError("Not found a place with given id", 404);
    }

    DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id != placeId);

    res.status(200).json({ message: `Place Deleted with id ${placeId}` });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
