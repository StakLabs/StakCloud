const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const mysql = require('mysql2');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

const databaseName = 'sql12832223';
const db = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    port: 3306,
    user: 'sql12832223',
    password: 'wARtFkTpXe',
    database: databaseName
});

db.connect(err => {
if (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
}    console.log('Connected to MySQL database');
});
app.get('/', (req, res) => {
    res.send('API is working');
});

app.get('/Files/:user', (req, res) => {
    const user = req.params.user;
    const query = 'SELECT * FROM Files WHERE user = ?';
    db.query(query, [user], (err, results) => {
if (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
}        res.json(results);
    });
    
});

app.get('/ping', (req, res) => {
    console.log('/ping');
    res.send('Pong');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
