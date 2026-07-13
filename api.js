// KUMO EXTERNAL LIBRARY DEVELOPED BY STAKLABS
// WARNING PLUS PRECAUTIONS: ADD AT START OF FILE AND CHECK FOR REPEATING DECLARATIONS

import express from 'express';
const app = express();
import cors from 'cors';
app.use(cors());
import { json } from 'body-parser';
app.use(json());
import { createConnection } from 'mysql2';

const kumo = {
    db: null,

    connect: function (name, host, port, user, password) {
        this.db = createConnection({
            host: host,
            port: port,
            user: user,
            password: password,
            database: name
        });

        this.db.connect((error) => {
            if (error) {
                console.error("Kumo connection failed:", error.message);
                return;
            }

            console.log("Kumo connected");
        });
    }
};

const port = process.env.PORT || 3000;

kumo.connect(databaseName, 'sql12.freesqldatabase.com', 3306, 'sql12832223', 'wARtFkTpXe');

db.connect(err => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/', (req, res) => {
    res.send('API is working');
});

app.post('/Users/login', (req, res) => {
    const { name, password } = req.body;
    const query = 'SELECT * FROM Users WHERE name = ? AND password = ?';
    db.query(query, [name, password], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.get('/Files/user/:user', (req, res) => {
    const user = req.params.user;
    const query = 'SELECT * FROM Files WHERE name = ?';
    db.query(query, [user], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/Files/code/:code', (req, res) => {
    const code = req.params.code;
    const query = 'SELECT * FROM Files WHERE code = ?';
    db.query(query, [code], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/Files/', (req, res) => {
    const fileInfo = req.body;
    const query = 'INSERT INTO Files (name, type, path, uploaded_At, fileName, storage, code, project) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [fileInfo.name, fileInfo.type, fileInfo.path, fileInfo.uploadedAt, fileInfo.fileName, fileInfo.storage, fileInfo.code, fileInfo.project || null], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/Files/delete', (req, res) => {
    const { name, code } = req.body;
    const query = 'DELETE FROM Files WHERE name = ? AND code = ?';
    db.query(query, [name, code], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.put('/Files/move/:code/:newProject', (req, res) => {
    const code = req.params.code;
    const newProject = req.params.newProject;
    const query = 'UPDATE Files SET project = ? WHERE code = ?';
    db.query(query, [newProject, code], (err, results) => {
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
