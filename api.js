// KUMO EXTERNAL LIBRARY DEVELOPED BY STAKLABS
// WARNING PLUS PRECAUTIONS: ADD AT START OF FILE AND CHECK FOR REPEATING DECLARATIONS

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const mysql = require('mysql2');

const kumo = {
    db: null,

    connect: function (name, host, port, user, password) {
        this.db = mysql.createConnection({
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
        this.db.connect(err => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log('Connected to MySQL database');
        });
    },

    update: function (table, set, what, where, whatWhere, callback) {
        const query = `UPDATE ${table} SET ${set} = ? WHERE ${where} = ?`;

        this.db.query(query, [what, whatWhere], (err, results) => {
            if (err) {
                console.error(err.message);

                if (callback) {
                    callback(err, null);
                }

                return;
            }

            if (callback) {
                callback(null, results);
            }
        });
    }
};
// Please do not remove branding
// © StakLabs. All rights reserved.

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

const port = process.env.PORT || 3000;

kumo.connect('sql12832223', 'sql12.freesqldatabase.com', 3306, 'sql12832223', 'wARtFkTpXe');

app.get('/', (req, res) => {
    res.send('API is working');
});

app.post('/Users/login', (req, res) => {
    const { name, password } = req.body;
    const query = 'SELECT * FROM Users WHERE name = ? AND password = ?';
    kumo.db.query(query, [name, password], (err, results) => {
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
    kumo.db.query(query, [user], (err, results) => {
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
    kumo.db.query(query, [code], (err, results) => {
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
    kumo.db.query(query, [fileInfo.name, fileInfo.type, fileInfo.path, fileInfo.uploadedAt, fileInfo.fileName, fileInfo.storage, fileInfo.code, fileInfo.project || null], (err, results) => {
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
    kumo.db.query(query, [name, code], (err, results) => {
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
    kumo.update('Files', 'project', newProject, 'code', code);
});

app.post('/Users/', (req, res) => {
    const userInfo = req.body;
    const query = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
    kumo.db.query(query, [userInfo.name, userInfo.email, userInfo.password], (err, results) => {
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
    kumo.db.query(query, [name], (err, results) => {
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
    kumo.db.query(query, [code, name], (err, results) => {
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
