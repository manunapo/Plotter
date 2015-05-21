var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var opsInstance = require( './backend/ops_handler/Operations.js' );
var arduino = require( './backend/serial_comm/Arduino.js' );

//on a new Socket.io connection send start serial listening
    
arduino.startListening();

var dbConfig = require('./db');
var mongoose = require('mongoose');
// Connect to DB
mongoose.connect(dbConfig.url);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
// TODO - Why Do we need this key ?
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

 // Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes_instance = require('./routes/index');
var routes = routes_instance.getPassport(passport);
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

var port = 80;
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

var total = 0;
io.sockets.on( 'connection', function ( socket) {

    total++;
    socket.emit('start-data', opsInstance.toString());
    
    socket.emit('users',routes_instance.getUserName());
    io.sockets.emit('cant-users', total);

    arduino.init( socket, opsInstance);

    var req = socket.request;
    console.log('client socket id: ', socket.id);

    socket.on('disconnect', function() {
        console.log('Got disconnect!');
        total--;
        io.sockets.emit('cant-users', total);
    });

    //waiting for arduino´s processed coords request from web browser
    //and send what it has already written.
    socket.on('start', function(){
        arduino.startSending();
    });

        

    //listen to socket.io for incomming data from web browser
    socket.on('coord', function (coord) {
        var aux = coord.split(";");
        var x = aux[0];
        var y = aux[1];
        opsInstance.add(x);
        opsInstance.add(y);
        console.log(x + "-" + y);
    });

    socket.on('penup', function(){
        opsInstance.add( 'A');
    });

    socket.on('pendown', function(){
        opsInstance.add( 'Z');
    });

});

module.exports = app;
