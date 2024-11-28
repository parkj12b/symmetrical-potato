import QRCode from 'qrcode';
import { io } from '../app';


export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed');
    }
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
}