const sqlite3 = require('sqlite3').verbose();

var router = require('express').Router();

var db = new sqlite3.Database('./test.db');

console.log(db);

db.serialize(()=>{
    db.run("CREATE TABLE IF NOT EXISTS Weather (Temperature FLOAT(4,2), Date DATE, Location varchar(255))");  
})

db.serialize(() => {  
    location = 'Helsinki';
    dates = ['2019-09-01', '2019-09-03','2019-09-05', '2019-09-07',
             '2019-09-09', '2019-09-11', '2019-09-13','2019-09-15',
             '2019-09-17', '2019-09-19']
    temps = [12.2, 12, 10, 10.7, 11.7, 9.5, 7.8, 8.5, 5.5, 4]

    var stmt = db.prepare("DELETE FROM Weather");
    stmt.run();
    stmt.finalize();

    var stmt = db.prepare("INSERT INTO Weather VALUES (?, ?, ?)");
    for( var i = 0; i < dates.length; i++) {
        stmt.run(temps[i], dates[i], location);
    }
    stmt.finalize();
 
    stmt = db.prepare("SELECT * FROM Weather");
    stmt.each((err, row) => {
        console.log(row);
    }, function(err, count) {
        stmt.finalize();
    });
}); 

router.get('/', (req, res) => {

    let sql = `SELECT  * FROM Weather ORDER BY Date`;

    var entries = [];
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            console.log(row);
            entries.push(row)
        });

        console.log(entries)
        res.send({ entries });
    });
});


// db.close((err) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     console.log('Close the database connection.');
//   });


module.exports = router;