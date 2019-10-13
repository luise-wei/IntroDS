const sqlite3 = require('sqlite3').verbose();

var router = require('express').Router();
var url = require('url')

var db = new sqlite3.Database('./../Python-backend/db/ds_project.db');

var rawData = "rawData"
var predictionData = "data"

console.log(db);

// db.serialize(()=>{
//     db.run("CREATE TABLE IF NOT EXISTS Weather (Temperature FLOAT(4,2), Date DATE, Location varchar(255))");  
// })

// db.serialize(() => {  
//     location = 'Helsinki';
//     dates = ['2019-09-01', '2019-09-03','2019-09-05', '2019-09-07',
//              '2019-09-09', '2019-09-11', '2019-09-13','2019-09-15',
//              '2019-09-17', '2019-09-19']
//     temps = [12.2, 12, 10, 10.7, 11.7, 9.5, 7.8, 8.5, 5.5, 4]

//     var stmt = db.prepare("INSERT INTO Weather VALUES (?, ?, ?)");
//     for( var i = 0; i < dates.length; i++) {
//         stmt.run(temps[i], dates[i], location);
//     }
//     stmt.finalize();

//     stmt = db.prepare("SELECT * FROM Weather");
//     stmt.each((err, row) => {
//         console.log(row);
//     }, function(err, count) {
//         stmt.finalize();
//     });
// }); 

// gets all data which we trained our model
router.get('/', (req, res) => {
    // general query
    let sql = `SELECT * FROM ` + rawData + ` ORDER BY 'Inari Nellim_Year'`;

    var entries = [];
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            // console.log(row);
            entries.push(row)
        });

        // console.log(entries)
        res.send({ entries });
    });
})

// gets prediction for city
router.get('/city', (req, res) => {
    console.log("got city request")

    var query = url.parse(req.url, true).query;
    queryString = JSON.stringify(query)
    jsonQuery = JSON.parse(queryString);

    cityName = jsonQuery.city;

    if (cityName) {
        // sends the result also
        getStationWeatherPrediction(cityName, res)
    }
});


// gets data from specific year(rawData),
// if current year (2019/2020), then use predictionData
router.get('/year', (req, res) => {
    console.log("got year request")

    var query = url.parse(req.url, true).query;
    queryString = JSON.stringify(query)
    jsonQuery = JSON.parse(queryString);

    year = jsonQuery.year;
    if (year) {
        getFromYear(year, res)
        // console.log('returned Entries:', result)
        // res.send({ result });
        // return
    }
})


function getFromYear(year, res) {
    if (year < 2019) {

        var sql = `SELECT * FROM ` + rawData + ` WHERE "Inari Nellim_Year"=` + year
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            rows.forEach((row) => {
                entries.push(row)
            });
            console.log("found entries ", entries.length)
            res.send({ entries })
            // return entries
        })
    }
    else {
        var sql = `SELECT * FROM ` + predictionData
        var entries = [];
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            rows.forEach((row) => {
                // console.log(row);
                entries.push(row)
            });
            console.log("found entries ", entries.length)
            res.send({ entries })
            // return entries
        })
    }


}

// gets prediction for specified city
function getStationWeatherPrediction(city, res) {
    // console.log("city", city)
    var sql = "SELECT * FROM PRAGMA_TABLE_INFO('data')"
    var allCoumns = [];

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            allCoumns.push(row)
        });

        relevantColumns = []
        allCoumns.forEach(entry => {
            var colName = entry.name
            if (colName.includes(city)) {
                relevantColumns.push(colName)
            }
        })

        var getEntries = `SELECT `
        relevantColumns.forEach(column => {
            getEntries = getEntries + `"`+column+`",`
        })
        getEntries = getEntries + `"Month","Day","Time" FROM ` + predictionData
        // console.log(getEntries)

        var entries = [];
        db.all(getEntries, [], (err, rows) => {
            if (err) {
                throw err;
            }
            // console.log(rows)
            rows.forEach((row) => {
                entries.push(row)
            });
            console.log("entries: ", entries.length)
            res.send({ entries: entries })
        });
    });
}

// db.close((err) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     console.log('Close the database connection.');
//   });


module.exports = router;