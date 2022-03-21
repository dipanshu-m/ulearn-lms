const User = require('../models/User');
require('dotenv').config();
const path = require('path');
const JWT = require('jsonwebtoken');



const errHandle = (err) => {
    // console.log(err.code);
    let errors = { username: '', email: '', password: '' };
    //validation errors
    if (err.message.includes('user validation failed')) {
        (Object.values(err.errors)).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }

    // DUPLICATES
    if (err.code === 11000) {
        if (Object.keys(err.keyValue)[0] === "email") //duplicate mail
            errors.email = 'Email is already registered'
        else //Duplicate mail
            errors.username = 'Username is already registered'
    }
    return errors;
}

const errHandleLoggedIn = (err) => {
    // console.log(err.code);
    let errors = { email: '', password: '' };
    //validation errors
    if (err.message.includes('user validation failed')) {
        (Object.values(err.errors)).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    //INCORRECT EMAIL
    if (err.message === 'Incorrect email') {
        errors.email = 'Email not yet registered';
    }
    console.log(err);
    //INCORRECT PASSWORD
    if (err.message === 'Incorrect password') {
        errors.password = 'Incorrect password.';
    }

    return errors;
}


//create a token
const maxAge = 60 * 60 * 24 * 3;
const createToken = (id) => {
    // console.log("hi");
    return JWT.sign({ id }, process.env.HASHING_SECRET_CODE, {
        expiresIn: maxAge
    });
};

module.exports.signup_get = (req, res) => {
    res.sendFile(path.resolve(__dirname, '../view/signup.html'))
}

module.exports.signup_post = async (req, res) => {
    const { username, email, password } = req.body;
    // console.log(username);

    try {
        const user = await User.create({
            username, email, password,
            image: 'https://firebasestorage.googleapis.com/v0/b/ulearn-lms-fe316.appspot.com/o/default-profile.png?alt=media&token=61d777be-9b4b-4262-8228-6aafdf0f5c39',
            completed: [false, false, false],
            fullname: ""
        });
        const token = createToken(user._id);
        res.cookie('auth', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json(user);
    }
    catch (err) {
        const errors = errHandle(err);
        console.log(errors);
        res.status(400).send({ errors });
    }
}


module.exports.login_get = (req, res) => {
    res.sendFile(path.resolve(__dirname, '../view/login.html'))
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('auth', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = errHandleLoggedIn(err);
        res.status(400).send({ errors });
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('auth', '', { maxAge: 1 });
    res.redirect('/');
}


module.exports.img_get = (req, res) => {
    res.sendFile(path.resolve(__dirname, '../view/getimg.html'))
}

module.exports.img_post = (req, res) => {
    const image = req.body.image;
    // console.log(url);

    const token = req.cookies.auth;
    if (token) {
        JWT.verify(token, process.env.HASHING_SECRET_CODE, (err, decodedToken) => {
            if (err) {
                // console.log(err.message);
                res.send(err)
                // res.redirect('/login');
            }
            else {
                const idname = decodedToken.id;
                User.find()
                    .then((result) => {
                        result.forEach((user) => {
                            console.log(idname);
                            User.findByIdAndUpdate(
                                idname,
                                { image: image },
                                (err, docs) => {
                                    if (err)
                                        console.log(err);
                                })
                        });
                    })
                    .then(() => {
                        res.redirect('/tasks');
                    })
            }
        })
    }
    else {
        res.send('Bad request. Error');
    }
}