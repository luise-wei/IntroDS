// from here: https://medium.com/@stephenfluin/adding-a-node-typescript-backend-to-your-angular-app-29b0e9925ff

var express = require('express');
var cors = require('cors');
const app = express();// Allow any method from any host and log requests
var dataAPI = require('./routes/sqliteAPI');

var originsWhitelist = [
    'http://localhost:4200',      //this is my front-end url for development
];
var corsOptions = {
    origin: function (origin, callback) {
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true
}

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        console.log(`${req.ip} ${req.method} ${req.url}`);
        next();
    }
})

// Handle POST requests that come in formatted as JSON
app.use(express.json());

// A default hello word route
app.get('/', (req, res) => {
    res.send({ hello: 'world' });
});

app.use('/data', dataAPI);

// start our server on port 3000
app.listen(3000, function () {
    console.log("Server now listening on 3000");
});


