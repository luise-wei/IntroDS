// from here: https://medium.com/@stephenfluin/adding-a-node-typescript-backend-to-your-angular-app-29b0e9925ff

var express = require('express');
const app = express();// Allow any method from any host and log requests
var data = require('./routes/sqliteAPI');

app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
        if('OPTIONS' === req.method) {
            res.sendStatus(200);
        } else {
            console.log(`${req.ip} ${req.method} ${req.url}`);
            next();
        }
    })

// Handle POST requests that come in formatted as JSON
app.use(express.json()),

// A default hello word route
app.get('/', (req, res) => {
    res.send({hello: 'world'});
});

app.use('/data', data);

// start our server on port 3000
app.listen(3000, function() {
    console.log("Server now listening on 3000");
});


