const sqlite3 = require('sqlite3').verbose();

var router = require('express').Router();

var db = new sqlite3.Database('C:/Users/Luise/sqlite3/test.db');

console.log(db);

// db.serialize(function() {  
//     db.run("CREATE TABLE IF NOT EXISTS NodeTest (Number INTEGER)");  

//     var stmt = db.prepare("INSERT INTO NodeTest VALUES (?)");
//     for (var i = 0; i < 10; i++) {
//         stmt.run("node " + i);
//     }
//     stmt.finalize();
// }); 

db.serialize(() => {
    var result = db.run('SELECT * FROM Weather;');
    console.log(result);
})


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