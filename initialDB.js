
const fs = require('fs')
try {
    fs.unlinkSync('./database_multipad.db')
} catch (e) {}


const sqlite = require('sqlite3').verbose()
const db = new sqlite.Database('./database_multipad.db')

function init(){
    db.serialize(function() {
        const initSql = fs.readFileSync('./initial-schema.sql').toString()
        const dataSql = fs.readFileSync('./initial-data.sql').toString()
        db.exec( initSql )
        db.exec( dataSql )
    })
}
init()
