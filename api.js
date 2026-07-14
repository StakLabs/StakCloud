// KUMO EXTERNAL LIBRARY DEVELOPED BY STAKLABS
// WARNING PLUS PRECAUTIONS: ADD AT START OF FILE AND CHECK FOR REPEATING DECLARATIONS

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const mysql = require('mysql2');

const kumo = {
    db: null,
    name: '',
    host: '',
    port: '',
    user: '',
    password: '',

    define: function (name, host, port, user, password) {
        this.name = name;
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
    },
    connect: function () {
        this.db = mysql.createConnection({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.name
        });

        this.db.connect((error) => {
            if (error) {
                console.error("Kumo connection failed:", error.message);
                return;
            }

            console.log("Kumo connected to MySQL database");
        });
    },

    update: function (table, set, what, where, whatWhere, callback, customQuery) {
        const query = customQuery || `UPDATE ${table} SET ${set} = ? WHERE ${where} = ?`;

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
    },

    insert: function (table, columns, values, callback) {
        const placeholders = values.map(() => '?').join(', ');
        const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        this.db.query(query, values, (err, results) => {
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
    },

    select: function (table, columns, whereWhat, whereValues, callback) {
        const query = `SELECT ${columns.join(', ')} FROM ${table} WHERE ${whereWhat}`;
        this.db.query(query, whereValues, (err, results) => {
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
    },

    delete: function (table, whereWhat, whereValues, callback) {
        const query = `DELETE FROM ${table} WHERE ${whereWhat}`;
        this.db.query(query, whereValues, (err, results) => {
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

const port = process.env.PORT || 3000;

kumo.define('sql12832223', 'sql12.freesqldatabase.com', 3306, 'sql12832223', 'wARtFkTpXe');
kumo.connect();

app.get('/', (req, res) => {
    res.send('API is working');
});

app.post('/Users/login', (req, res) => {
    const { name, password } = req.body;
    kumo.select('Users', ['*'], 'name = ? AND password = ?', [name, password], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results && results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.get('/Files/user/:user', (req, res) => {
    const user = req.params.user;
    kumo.select('Files', ['*'], 'name = ?', [user], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/Files/code/:code', (req, res) => {
    const code = req.params.code;
    kumo.select('Files', ['*'], 'code = ?', [code], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/Files/', (req, res) => {
    const fileInfo = req.body;
    kumo.insert('Files', ['name', 'type', 'path', 'uploaded_At', 'fileName', 'storage', 'code', 'project'], [fileInfo.name, fileInfo.type, fileInfo.path, fileInfo.uploadedAt, fileInfo.fileName, fileInfo.storage, fileInfo.code, fileInfo.project || null], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/Files/delete', (req, res) => {
    const { name, code } = req.body;
    kumo.delete('Files', 'name = ? AND code = ?', [name, code], (err, results) => {
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

    kumo.update('Files', 'project', newProject, 'code', code, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

app.post('/Users/', (req, res) => {
    const userInfo = req.body;
    kumo.insert('Users', ['name', 'email', 'password'], [userInfo.name, userInfo.email, userInfo.password], (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/Users/:name', (req, res) => {
    const name = req.params.name;
    kumo.select('Users', ['*'], 'name = ?', [name], (err, results) => {
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
    kumo.update('Users', 'shared_files', code, 'name', name, (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    }), `UPDATE Users 
SET shared_files = CONCAT(IFNULL(shared_files, ""), ?, ",")
WHERE name = ?`
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
