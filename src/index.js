const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { WebSocket, WebSocketServer } = require('ws');

const server = new WebSocketServer({ port: 8080, clientTracking: true });

const router = express();
router.use(helmet());
router.use(bodyParser.json({ limit: '50mb' }));
router.use(cors());
router.use(morgan('combined'));
router.use(express.static('dist'));

server.on('connection', (ws) => {
    console.log('Client connected');
})

const streamCache = {};

router.param('watchid', (req, res, next, watchId) => {
    if (!streamCache[watchId]) {
        res.status(404).send({
            message: `Watch stream '${watchId}' not found`
        });
        return;
    }

    next();
});

router.get('/', async (req, res) => {
    res.redirect('/watch/studio');
});

router.get('/watch/:watchid?', async (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

router.get('/save/:watchid?', async (req, res) => {
    const replayData = streamCache[req.params.watchid];
    const data = JSON.stringify(replayData, null, 4);
    const fileName = `replay-${req.params.watchid}.json`;
    fs.writeFileSync(fileName, data);
    res.sendFile(path.join(__dirname, fileName));
})

// router.get('/capture', async (req, res) => {
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     fs.createReadStream('./captures.json').pipe(res);
// });

router.post('/capture', async (req, res) => {
    const body = req.body;
    const jobId = body.Id;

    if (!streamCache[jobId]) {
        streamCache[jobId] = {
            Captures: []
        }
    }

    streamCache[jobId].Captures.push(...body.Captures);

    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            const clientData = {
                captures: body.Captures,
                id: jobId,
            };

            client.send(JSON.stringify(clientData));
        }   
    });

    res.status(200).send({
        message: 'OK'
    });
});

router.listen(3000, '0.0.0.0', () => {
  console.log('listening on port 3000');
});