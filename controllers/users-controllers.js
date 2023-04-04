const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const DUMMY_USERS = [
    {
        id: "u1",
        name: "Max Schwarz",
        email: "test@test.com",
        password: "testers",
    },
];

const getUsers = async (req, res, next) => {
    let users;

    try {
        users = await User.find({}, "-password");
    } catch (err) {
        return next(new HttpError("Fetching of users failed", 500));
    }

    res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed", 422));
    }

    const { name, email, password } = req.body;

    let hasUser;
    try {
        hasUser = await User.findOne({ email: email });
    } catch (err) {
        return next(
            new HttpError("Signing up failed, please try again later", 500)
        );
    }

    if (hasUser) {
        return next(new HttpError("User already exists , please login", 422));
    }

    const createdUser = new User({
        name,
        email,
        password,
        image: "abcde",
        places:[]
    });

    try {
        await createdUser.save();
    } catch (err) {
        console.log(err.message);
        return next(new HttpError("Creating a User failed", 500));
    }

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let hasUser;
    try {
        hasUser = await User.findOne({ email: email });
    } catch (err) {
        return next(
            new HttpError("Logging in failed, please try again later", 500)
        );
    }

    if (!hasUser || hasUser.password !== password) {
        return next(new HttpError("Invalid credentials", 401));
    }

    res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
