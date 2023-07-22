const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '45.143.81.5',
    user: 'u1548240_athatsaqif',
    password: 'htmlcssjsphp',
    database: 'u1548240_chatapp',
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Terhubung ke database MySQL!');
});

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Mengatur EJS sebagai templating engine
app.set('view engine', 'ejs');

// Mengatur folder statis untuk file CSS dan JS
app.use(express.static(__dirname + '/public'));

// Halaman utama dengan daftar pesan
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM messages';
    connection.query(sql, (err, result) => {
        if (err) throw err;
        res.render('index', { messages: result });
    });
});

// Menjalankan server pada port tertentu
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server berjalan pada http://localhost:${port}`);
});

// Socket.io setup
io.on('connection', (socket) => {
    console.log('User terhubung');

    // Menerima pesan dari client
    socket.on('message', (data) => {
        const { username, message } = data;
        console.log(`Pesan diterima dari ${username}: ${message}`);

        // Simpan pesan ke database
        const sql = 'INSERT INTO messages (username, message) VALUES (?, ?)';
        connection.query(sql, [username, message], (err, result) => {
            if (err) throw err;

            // Mengirim pesan kembali ke semua klien yang terhubung
            io.emit('message', { username, message });
        });
    });

    // Ketika koneksi socket terputus
    socket.on('disconnect', () => {
        console.log('User terputus');
    });
});
