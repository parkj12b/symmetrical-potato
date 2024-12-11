const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

require('dotenv').config();

const domain = process.env.DOMAIN;
let formCounter = 0;  // Track current QR value

// Function to get the next QR value (alternating between 1, 2, and 3)
const forms = [
    process.env.FORM_ONE,
    process.env.FORM_TWO,
    process.env.FORM_THREE,
];

function getFormValue() {
    formCounter = formCounter === 2 ? 0 : formCounter + 1;
    return forms[formCounter];
}

// Serve the index page for the PC (this is where the QR code will be displayed)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Endpoint to generate QR code and send it to the client
app.get('/generate-qr', (req, res) => {
    // const qrValue = getNextQRValue();  // Get next QR value
    url = domain + '/scan-qr';
    QRCode.toDataURL(url, (err, url) => {
        if (err) {
            return res.status(500).send('Error generating QR code');
        }
        res.send({ qrCodeUrl: url });
    });
});

app.get('/scan-qr', (req, res) => {
    console.log('QR code scanned, notifying PC');
    // Emit event to all connected clients to refresh the QR code
    io.emit('scan', {});
    res.redirect(getFormValue());  // Redirect the user after the scan
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected');
    // Whenever a scan occurs on the phone, emit the 'refresh' event to all connected clients

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
