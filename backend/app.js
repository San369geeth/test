const express = require('express');
const multer = require('multer');
const path = require('path');
const ytdl = require('ytdl-core');
const fs = require('fs');
const body_parser = require('body-parser');
const { spawn } = require('child_process');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

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
            const filePath = `uploads/${videoTitle}.mp4`;

            const videoStream = ytdl(youtubeUrl);
            const writeStream = fs.createWriteStream(filePath);

            videoStream.pipe(writeStream);

            writeStream.on('finish', () => {
                handleVideoProcessing(filePath, language, socketId);
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
        const filePath = req.file.path;
        handleVideoProcessing(filePath, language, socketId);
        res.sendStatus(200);
    }
});


function handleVideoProcessing(filePath, language, socketId) {
    const pythonProcess = spawn('python', ['C:/Users/skfog/OneDrive/Desktop/project/backend/master.py', filePath, language, socketId]);

    pythonProcess.stdout.on('data', (data) => {
        const message = data.toString();
        console.log(`stdout: ${message}`);
        io.to(socketId).emit('progress', { message: message });
    });

    // pythonProcess.stderr.on('data', () => {
    //     // const error = `Error: ${data.toString()}`;
    //     console.error(`stderr: ${error}`);
    //     // io.to(socketId).emit('progress', { message: error });
    // });

    pythonProcess.on('close', (code) => {
        const completionMessage = `Child process exited with code ${code}`;
        console.log(completionMessage);
        io.to(socketId).emit('progress', { message: completionMessage });
        io.to(socketId).emit('completed');
    });
}

app.get('/translated-video', (req, res) => {
    const videoPath = 'C:/Users/skfog/OneDrive/Desktop/project/site/output/output_video.mp4';
    res.sendFile(videoPath);
});

app.get('/translated-text', (req, res) => {
    const textPath = path.join(__dirname, 'output', 'output_translated_text.txt');

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
