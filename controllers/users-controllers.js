const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const DUMMY_USERS = [
    {
        id: "u1",
        name: "Max Schwarz",
        email: "test@test.com",
        password: "testers",
    },
];

const getUsers = (req, res, next) => {
    res.status(200).json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError("Invalid inputs passed",422);
    }
    
    const { name, email, password } = req.body;

    const hasUserAlready = DUMMY_USERS.find((u) => u.email === email);
    if (hasUserAlready) {
        throw new HttpError("Email Already Exists", 401);
    }

    const createdUser = {
        id: uuidv4(),
        name,
        email,
        password,
    };

    DUMMY_USERS.push(createdUser);

    res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
    const { email, password } = req.body;

    const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError(
            "Could not identify user, credentials seem to be wrong.",
            401
        );
    }

    res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
