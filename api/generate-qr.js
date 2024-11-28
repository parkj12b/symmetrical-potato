import QRCode from 'qrcode';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed');
    }
    url = '/scan-qr';
    QRCode.toDataURL(url, (err, url) => {
        if (err) {
            return res.status(500).send('Error generating QR code');
        }
        res.send({ qrCodeUrl: url });
    });
}