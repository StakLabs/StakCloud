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
    console.error(err.message);
    return res.status(500).json({ error: 'Database error' });
}    console.log('Connected to MySQL database');
});
app.get('/', (req, res) => {
    res.send('API is working');
});

app.get('/Files/user/:user', (req, res) => {
    const user = req.params.user;
    const query = 'SELECT * FROM Files WHERE name = ?';
    db.query(query, [user], (err, results) => {
if (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Database error' });
}        res.json(results);
    });
    
});

app.get('/Files/code/:code', (req, res) => {
    const code = req.params.code;
    const query = 'SELECT * FROM Files WHERE code = ?';
    db.query(query, [code], (err, results) => {
if (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Database error' });
}        res.json(results);
    });
    
});

app.post('/Files/', (req, res) => {
    const fileInfo = req.body;
    const query = 'INSERT INTO Files (name, type, path, uploaded_At, fileName, storage, code) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [fileInfo.name, fileInfo.type, fileInfo.path, fileInfo.uploadedAt, fileInfo.fileName, fileInfo.storage, fileInfo.code], (err, results) => {
if (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Database error' });
}        res.json(results);
    });
    
});

app.post('/Files/delete', (req, res) => {
    const { name, path } = req.body;
    const query = 'DELETE FROM Files WHERE name = ? AND path = ?';
    db.query(query, [name, path], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/Users/', (req, res) => {
    const userInfo = req.body;
    const query = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [userInfo.name, userInfo.email, userInfo.password], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/Users/:name', (req, res) => {
    const name = req.params.name;
    const query = 'SELECT * FROM Users WHERE name = ?';
    db.query(query, [name], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.put('/Users/shared/:code/:name', (req, res) => {
    const code = req.params.code;
    const name = req.params.name;
    //assuming shared files is an array of file codes stored as a VARCHAR in the database
    const query = 'UPDATE Users SET shared_files = CONCAT(IFNULL(shared_files, ""), ?, ",") WHERE name = ?';
    db.query(query, [code, name], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/ping', (req, res) => {
    console.log('/ping');
    res.send('Pong');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const pinging = 'https://stakcloud.onrender.com/ping';
setInterval(() => {
  fetch(pinging).catch(() => {});
}, 10 * 60 * 1000);
