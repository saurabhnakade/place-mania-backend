const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
    let users;

    try {
        users = await User.find({}, "-password");
    } catch (err) {
        return next(new HttpError("Fetching of users failed", 500));
    }

    res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};

// const getUserById = async (req, res, next) => {
//     const uid = req.params.uid;

//     let user;
//     try {
//         user = await User.findById(uid);
//     } catch (err) {
//         return next(
//             new HttpError("Something went wrong , couldnot find a user", 500)
//         );
//     }

//     if (!user) {
//         return next(
//             new HttpError("Could not find user for given user id", 404)
//         );
//         // instead of next(error) we can also
//         // throw error;
//         // but this works only in synchronous code
//         // for async code we need to use next(error)
//     }

//     res.json({ user: user.toObject({ getters: true }) });
// };

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

    let hashedPass;
    try {
        hashedPass = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError("Could not create user , please try again"));
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPass,
        image: req.file.path,
        places: [],
    });

    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError("Creating a User failed", 500));
    }
    // createdUser.id is a getter provided by mongoose on every createdUser object

    // jwt token creation
    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            "secret_key",
            { expiresIn: "1h" }
        );
    } catch (err) {
        return next(
            new HttpError("SignUp done , signing in failed , try to login", 500)
        );
    }

    res.status(201).json({
        userId: createdUser.id,
        email: createdUser.email,
        token: token,
    });
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

    if (!hasUser) {
        return next(new HttpError("Invalid credentials", 401));
    }


    let isValidPass = false;
    try {
        isValidPass = await bcrypt.compare(password, hasUser.password);
    } catch (err) {
        return next(
            new HttpError("Could not log you in , please try again", 401)
        );
    }

    if (!isValidPass) return next(new HttpError("Invalid credentials", 401));

    // jwt token creation
    let token;
    try {
        token = jwt.sign(
            { userId: hasUser.id, email: hasUser.email },
            "secret_key",
            { expiresIn: "1h" }
        );
    } catch (err) {
        return next(new HttpError("Logging In failed", 500));
    }

    res.json({
        userId: hasUser.id,
        email: hasUser.email,
        token: token,
        name: hasUser.name,
    });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
// exports.getUserById=getUserById
