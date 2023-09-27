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
    if (!req.params.watchid) {
        res.redirect('/watch/studio');
        return;
    }

    res.sendFile(path.join(__dirname, '/index.html'));
});

router.get('/save/:watchid?', async (req, res) => {
    const captures = streamCache[req.params.watchid].Captures;
    const data = JSON.stringify(captures, null, 4);
    fs.writeFileSync(`captures-${req.params.watchid}.json`, data);
    res.status(200).send(data);
})

// router.get('/capture', async (req, res) => {
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     fs.createReadStream('./captures.json').pipe(res);
// });

router.post('/capture', async (req, res) => {
    const body = req.body;

    console.log(body);

    if (!streamCache[body.Id]) {
        streamCache[body.Id] = {
            Captures: []
        }
    }

    streamCache[body.Id].Captures.push(...body.Captures);

    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            console.log('sending to client');
            
            body.type = 'chunk';
            const data = JSON.stringify(body.Captures);

            client.send(data);
        }   
    });

    res.status(200).send({
        message: 'OK'
    });
});

router.listen(3000, '0.0.0.0', () => {
  console.log('listening on port 3000');
});