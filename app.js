require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const cookieParser = require('cookie-parser');

// app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cookieParser()); // Note the `()`
app.use(express.static('./view'));
app.use(express.static('./uploads/'));

// connect to database
username = process.env.DB_UNAME;
password = process.env.DB_PASS;
const dbURI = `mongodb+srv://${username}:${password}@cluster0.obtv8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connected to db");
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Listening on http://localhost:${port}/`);
        });
    })
    .catch((err) => {
        console.log(err);
    })
//routes
app.get('*', checkUser);
app.get('/', (req, res) => {
    console.log("homepage");
    res.sendFile(path.resolve(__dirname, './view/index.html'))

});
app.use(authRoutes);

app.get('/dashboard', requireAuth, (req, res) => {
    console.log(res.locals.user.fullname);
    // res.json({
    //     image: res.locals.user.image,
    //     fullname: res.locals.user.fullname,
    //     username: res.locals.user.username,
    //     email: res.locals.user.image,
    //     password: res.locals.user.image
    // })
    res.sendFile(path.resolve(__dirname, './view/tasks/dashboard.html'))
})
app.get('/tasks', requireAuth, (req, res) => {
    res.sendFile(path.resolve(__dirname, './view/tasks/tasks.html'))
});


// app.get('/tasks:step',
// });
// app.get('/tasks', requireAuth, (req, res) => {
//     res.redirect('/tasks')
// });
