const express = require('express');
const multer = require('multer');
const path = require('path');
const ytdl = require('ytdl-core');
const fs = require('fs');
const body_parser = require('body-parser');
const { spawn } = require('child_process');
const { Server } = require('socket.io');
const http = require('http');
const admin = require('firebase-admin'); // Import Firebase Admin SDK

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('/etc/secrets/culturacast.json'); // Replace with the path to your service account key

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "culturacast-12b35.appspot.com" // Replace with your Firebase storage bucket name
});

const bucket = admin.storage().bucket();

const upload = multer({ dest: 'temp_uploads/' });

app.use(body_parser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

app.post('/upload', upload.single('video'), async (req, res) => {
    const youtubeUrl = req.body.youtubeUrl;
    const language = req.body.languages;
    const socketId = req.body.socketId;

    if (youtubeUrl) {
        try {
            const videoInfo = await ytdl.getInfo(youtubeUrl);
            const videoTitle = sanitizeFilename(videoInfo.videoDetails.title);
            const tempFilePath = `temp_uploads/${videoTitle}.mp4`;

            const videoStream = ytdl(youtubeUrl);
            const writeStream = fs.createWriteStream(tempFilePath);

            videoStream.pipe(writeStream);

            writeStream.on('finish', async () => {
                await uploadToFirebase(tempFilePath, videoTitle, 'video'); // Upload to 'video' folder in Firebase Storage
                handleVideoProcessing(videoTitle, language, socketId);
                res.sendStatus(200);
            });

            writeStream.on('error', (err) => {
                console.error('Error downloading video:', err);
                res.status(500).send('Error downloading video');
            });

        } catch (err) {
            console.error('Error retrieving video information:', err);
            res.status(500).send('Error retrieving video information');
        }
    } else {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const tempFilePath = req.file.path;
        const fileName = sanitizeFilename(req.file.originalname);

        await uploadToFirebase(tempFilePath, fileName, 'video'); // Upload to 'video' folder in Firebase Storage
        handleVideoProcessing(fileName, language, socketId);
        res.sendStatus(200);
    }
});

async function uploadToFirebase(filePath, fileName, folder) {
    const destination = `${folder}/${fileName}`;
    await bucket.upload(filePath, {
        destination: destination,
    });
    console.log(`Uploaded ${fileName} to Firebase Storage.`);
}

function handleVideoProcessing(fileName, language, socketId) {
    const firebaseUrl = `gs://culturacast-12b35.appspot.com/video/${fileName}`;

    const pythonProcess = spawn('python', ['./master.py', firebaseUrl, language, socketId]);

    pythonProcess.stdout.on('data', (data) => {
        const message = data.toString();
        console.log(`stdout: ${message}`);
        io.to(socketId).emit('progress', { message: message });
    });

    pythonProcess.on('close', (code) => {
        const completionMessage = `Child process exited with code ${code}`;
        console.log(completionMessage);
        io.to(socketId).emit('progress', { message: completionMessage });
        io.to(socketId).emit('completed');
    });
}

app.get('/translated-video', async (req, res) => {
    const videoPath = 'opvideo/output_video.mp4'; // Firebase Storage path for output video
    const file = bucket.file(videoPath);

    file.getSignedUrl({
        action: 'read',
        expires: '03-01-2025'
    }).then((signedUrls) => {
        res.redirect(signedUrls[0]);
    }).catch((err) => {
        console.error('Error getting signed URL:', err);
        res.status(500).send('Error getting video');
    });
});

app.get('/translated-text', (req, res) => {
    const textPath = path.join(__dirname, 'texttranslate', 'output_translated_text.txt');

    fs.readFile(textPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }
        res.send(data);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
