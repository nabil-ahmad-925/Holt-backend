var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const port = 3000;
var authRoutes = require('./routes/auth');
const cors = require('cors');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', authRoutes);
 

app.listen(port, () => {
    console.log(`Superdaz is listening on port ${port}`)
  })
  

module.exports = app;
