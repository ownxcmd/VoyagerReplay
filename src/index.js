const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { BSON } = require('bson');
const { WebSocket, WebSocketServer } = require('ws');

const server = new WebSocketServer({ port: 8080, clientTracking: true });

const router = express();
router.use(helmet());
router.use(bodyParser.json({ limit: '50mb' }));
router.use(cors());
router.use(morgan('combined'));
router.use(express.static('src/dist'));

function sendToAllClients(data) {
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

const ConvertToFileFormat = (captures) => {
    const SaveData = {};
    SaveData.MovingInfo = {};

    for (let i = 0; i<captures.length; i++) {
        if (!SaveData.MapInfo && captures[i].MapInfo) {
            SaveData.MapInfo = captures[i].MapInfo;
        }
        if (!SaveData.CameraInfo && captures[i].CameraInfo) {
            SaveData.CameraInfo = captures[i].CameraInfo;
        }

        const capture = captures[i];
        for (const [PartId, PartInfo] of Object.entries(capture.MovingInfo)) {
            if (!SaveData.MovingInfo[PartId]) {
                const NewPartInfo = {
                    Positions: {},
                    Rotations: {},
                    Sizes: {},
                    Shape: PartInfo.Shape,
                    Color: PartInfo.Color,
                    Transparency: PartInfo.Transparency,
                    Tags: PartInfo.Tags,
                }
                SaveData.MovingInfo[PartId] = NewPartInfo;
            }
            SaveData.MovingInfo[PartId].Positions[i] = PartInfo.Position;
            SaveData.MovingInfo[PartId].Rotations[i] = PartInfo.Rotation;
            SaveData.MovingInfo[PartId].Sizes[i] = PartInfo.Size;
        }
    }

    return SaveData;
}

server.on('connection', (ws) => {
    console.log('Client connected');
})

const streamCache = {};

router.get('/', async (req, res) => {
    res.redirect('/live');
});

router.get('/watch', async (req, res) => {
    res.set('Content-Security-Policy', "script-src 'self' blob: https://unpkg.com 'unsafe-inline' 'unsafe-eval';");
    res.sendFile(path.join(__dirname, '/watch.html'));
});

router.get('/live', async (req, res) => {
    res.set('Content-Security-Policy', "script-src 'self' blob: https://unpkg.com 'unsafe-inline' 'unsafe-eval';");
    res.sendFile(path.join(__dirname, '/live.html'));
});

router.get('/replay/:replayid', async (req, res) => {
    const filePath = path.join(__dirname, `/../captures/${req.params.replayid}.bson`);
    res.sendFile(filePath);
});

router.get('/live/streams', async (req, res) => {
    const streamIds = Object.keys(streamCache);
    res.status(200).send(streamIds);
});

router.post('/live/save/:streamid', async (req, res) => {
    const replayData = streamCache[req.params.streamid];
    if (!replayData) {
        res.status(404).send({
            message: `No stream found with id ${req.params.streamid}`
        });
        return;
    }
    
    //console.log('Replay size ', BSON.calculateObjectSize(replayData));

    let data;
    try {
        data = BSON.serialize(ConvertToFileFormat(replayData.captures));
    } catch (e) {
        console.log(e);
        res.status(500).send({
            message: `Failed to serialize replay data: ${e}`
        });
        return;
    }
    const capturesFolder = path.join(__dirname, '/../captures');
    const fileName = `${replayData.placeId}-${req.body.PlaceVersion}-${req.params.streamid}.bson`;
    fs.writeFileSync(path.join(capturesFolder, fileName), data);
    res.status(200).send({message: `Saved replay data to ${fileName}`});
    //res.sendFile(path.join(__dirname, fileName));
})

// router.get('/capture', async (req, res) => {
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     fs.createReadStream('./captures.json').pipe(res);
// });

router.post('/live/capture/:streamid', async (req, res) => {
    const body = req.body;
    const streamId = req.params.streamid;

    if (!streamCache[streamId]) {
        streamCache[streamId] = {
            captures: [],
            placeId: req.headers['roblox-id'],
            lastUpdate: Date.now()/1000,
        }
    }

    streamCache[streamId].lastUpdate = Date.now()/1000;
    streamCache[streamId].captures.push(...body.captures);

    const clientData = {
        type: 'chunk',
        captures: body.captures,
        id: streamId,
    };

    sendToAllClients(clientData);
    res.status(202).send({
        message: 'OK'
    });
});

(async () => {
    while (true) {
        const streamIds = Object.keys(streamCache);
        const now = Date.now()/1000;
        for (const streamId of streamIds) {
            const stream = streamCache[streamId];
            console.log(now - stream.lastUpdate);
            if (now - stream.lastUpdate > 10) {
                const clientData = {
                    type: 'end',
                    id: streamId,
                };
                sendToAllClients(clientData);
                delete streamCache[streamId];
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
})();

// const certificateFolder = path.join(__dirname, '/../certs');
// https
//     .createServer({
//         key: fs.readFileSync(path.join(certificateFolder, 'key.pem')),
//         cert: fs.readFileSync(path.join(certificateFolder, 'cert.pem')),
//     }, router)
//     .listen(3000, () => {
//         console.log('listening on port 3000');
//     });

router.listen(3000, '0.0.0.0', () => {
    console.log('listening on port 3000');
});