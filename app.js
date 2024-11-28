const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let currentQR = 1;  // Track current QR value

// Function to get the next QR value (alternating between 1, 2, and 3)

function getNextQRValue() {
    currentQR = currentQR === 3 ? 1 : currentQR + 1;
    let qrurl = `./public/qr${currentQR}.png`;
    return qrurl;
}

// Serve the index page for the PC (this is where the QR code will be displayed)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Endpoint to generate QR code and send it to the client
app.get('/generate-qr', (req, res) => {
    // const qrValue = getNextQRValue();  // Get next QR value
    url = '/scan-qr';
    QRCode.toDataURL(url, (err, url) => {
        if (err) {
            return res.status(500).send('Error generating QR code');
        }
        res.send({ qrCodeUrl: url });
    });
});

app.get('/scan-qr', (req, res) => {
    console.log('QR code scanned, notifying PC');
    const newQRValue = getNextQRValue();
    QRCode.toDataURL(newQRValue.toString(), (err, url) => {
        if (err) {
            return console.error('Error generating new QR');
        }
        // Emit event to all connected clients to refresh the QR code
        io.emit('scan', {});
    });
    res.redirect('/');  // Redirect the user after the scan
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
