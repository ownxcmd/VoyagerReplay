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

const lastObjIndex = obj => {
    return Object.keys(obj).reverse()[0]; 
};

const poseq = (pos1, pos2) => {
    if (!pos1 || !pos2) return false;

    return pos1[0] === pos2[0] && pos1[1] === pos2[1] && pos1[2] === pos2[2];
}

// partdata: 0 = position, 1 = rotation, 2 = size
const ConvertToFileFormat = (captures) => {
    const SaveData = {};
    SaveData.MovingInfo = {};
    SaveData.FrameCount = captures.length;
    //SaveData.FramePartMap = Array(captures.length).fill([]);

    for (let i = 0; i<captures.length; i++) {
        const capture = captures[i];

        if (capture.MapInfo) {
            SaveData.MapInfo = capture.MapInfo;
        }
        if (!SaveData.CameraInfo && capture.CameraInfo) {
            SaveData.CameraInfo = capture.CameraInfo;
        }

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
            const PartEntry = SaveData.MovingInfo[PartId];
            //console.log(i, PartInfo.Position, PartEntry.Positions[nonNullIndex(PartEntry.Positions)]);
            if (PartInfo.Shape == 'Ball') {
                console.log(poseq(PartEntry.Positions[lastObjIndex(PartEntry.Positions)], PartInfo.Position), lastObjIndex(PartEntry.Positions), PartInfo.Position, PartEntry.Positions[lastObjIndex(PartEntry.Positions)], PartEntry.Positions[lastObjIndex(PartEntry.Positions)-1]);
            }

            if (i == 0 || !poseq(PartEntry.Positions[lastObjIndex(PartEntry.Positions)], PartInfo.Position)) {
                PartEntry.Positions[i] = PartInfo.Position;
            }
            if (i == 0 || !poseq(PartEntry.Rotations[lastObjIndex(PartEntry.Rotations)], PartInfo.Rotation)) {
                PartEntry.Rotations[i] = PartInfo.Rotation;
            }
            if (i == 0 || !poseq(PartEntry.Sizes[lastObjIndex(PartEntry.Sizes)], PartInfo.Size)) {
                PartEntry.Sizes[i] = PartInfo.Size;
            }

            const LastIndex = captures.findLastIndex((element) => element.MovingInfo[PartId]);
            if (i == LastIndex) {
                PartEntry.Positions[i+1] = null;
                PartEntry.Rotations[i+1] = null;
                PartEntry.Sizes[i+1] = null;
                continue;
            }
        }

        // add null deletion for last frame
        // for (const [PartId, PartInfo] of Object.entries(SaveData.MovingInfo)) {
        //     if (lastObjIndex(PartInfo.Positions) != SaveData.FrameCount - 1) {
        //         // this shit is EVIL!
        //         PartInfo.Positions[+lastObjIndex(PartInfo.Positions) + 1] = null;
        //     }
                
        //     if (lastObjIndex(PartInfo.Rotations) != SaveData.FrameCount - 1) {
        //         PartInfo.Rotations[+lastObjIndex(PartInfo.Rotations) + 1] = null;
        //     }

        //     if (lastObjIndex(PartInfo.Sizes) != SaveData.FrameCount - 1) {
        //         PartInfo.Sizes[+lastObjIndex(PartInfo.Sizes) + 1] = null;
        //     }
        // }
        
    }

    console.log('Converted!')

    return SaveData;
}

server.on('connection', (ws) => {
    console.log('Client connected');
})

const streamCache = {};

router.get('/', async (req, res) => {
    res.redirect('/watch');
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

    let JSONData, BSONData;
    try {
        const FileData = ConvertToFileFormat(replayData.captures);
        BSONData = BSON.serialize(FileData);
        JSONData = JSON.stringify(FileData, null, 4);
    } catch (e) {
        console.log(e);
        res.status(500).send({
            message: `Failed to serialize replay data: ${e}`
        });
        return;
    }
    const capturesFolder = path.join(__dirname, '/../captures');
    const fileName = `${replayData.placeId}-${req.body.PlaceVersion}-${req.params.streamid}`;

    fs.writeFileSync(path.join(capturesFolder, fileName + '.json'), JSONData);
    fs.writeFileSync(path.join(capturesFolder, fileName + '.bson'), BSONData);

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