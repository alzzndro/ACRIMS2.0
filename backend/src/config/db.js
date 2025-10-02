import mysql from 'mysql2/promise'

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'acrims_db',
    dateStrings: true
})

export { db };