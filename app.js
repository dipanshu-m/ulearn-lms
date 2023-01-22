require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const cookieParser = require('cookie-parser');

// app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cookieParser()); // Note the `()`
app.use(express.static('./views'));
app.use(express.static('./uploads/'));
const port = process.env.PORT || 5000;
app.set('path', port);

// connect to database
username = process.env.DB_UNAME;
password = process.env.DB_PASS;
const dbURI = `mongodb+srv://admin:qwerty1234567890@cluster0.wnudgdi.mongodb.net/?retryWrites=true&w=majority`;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  dbName: 'Users',
};
mongoose.set('strictQuery', true);
mongoose.connect(dbURI, options).then(() => {
  console.log('connected to db');
  app.listen(app.get('path'), () => {
    console.log(`Listening on http://localhost:${port}/`);
  });
});
//routes
app.get('*', checkUser);
app.get('/', (req, res) => {
  console.log('homepage');
  res.sendFile(path.resolve(__dirname, './views/index.html'));
});
app.use(authRoutes);
app.set('view engine', 'ejs');
app.use('/task', taskRoutes);

app.get('/dashboard', requireAuth, (req, res) => {
  // console.log("id="+res.locals.user._id);
  res.render('./tasks/dashboard.ejs', {
    image: res.locals.user.image,
    fullname: res.locals.user.fullname,
    username: res.locals.user.username,
    email: res.locals.user.image,
    password: res.locals.user.image,
  });
});

// app.get('userinfo', requireAuth, (req, res)=> {
//     res.json()
// })
app.get('/tasks', requireAuth, (req, res) => {
  res.render('./tasks/tasks');
});
