const fs = require('fs');
const busboy = require('connect-busboy');
const mongo = require('mongodb').MongoClient;
const path = require('path');
const express = require('express');
const crypto = require('crypto');
const http = require('http');
const app = express();
require('dotenv').config();
const configDB = require('./config/database.js');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');

//Configuration
//Connect to mongoose
mongoose.connect(configDB.url);
//Uncomment next line when ready to deal w/ user authentication
require('./config/passport')(passport);

console.log('connected to mongoose...');

app.use(morgan('dev')); //log reqs to console
app.use(cookieParser()); // read cookies
app.use(bodyParser()); // get info from html forms
app.use(express.static('public')); //public folder for images
app.use(busboy()); //for parsing files

//Required for passport, leave until user authentication

app.use(session({secret: process.env.SESSION_SECRET}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req,res,next){
    res.setTimeout(480000, function(){
            console.log('Request has timed out');
                res.send(408);
        });
    
    next();
});

//route module
require('./app/routes.js')(app,passport);

//set the fuckin' view engine to ejs for Express
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.listen(process.env.PORT);
console.log('Listening for connections on ', process.env.PORT);
