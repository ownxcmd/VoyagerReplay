const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const streamRouter = require('./routes/stream.route.js');

const app = express();
app.use(helmet());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());
app.use(morgan('combined'));
app.use(express.static('src/dist'));

app.use('/stream', streamRouter);

app.get('/', async (req, res) => {
    res.redirect('/watch');
});

app.get('/watch', async (req, res) => {
    res.set('Content-Security-Policy', "script-src 'self' blob: https://unpkg.com 'unsafe-inline' 'unsafe-eval';");
    res.sendFile(path.join(__dirname, '/watch.html'));
});

app.get('/live', async (req, res) => {
    res.set('Content-Security-Policy', "script-src 'self' blob: https://unpkg.com 'unsafe-inline' 'unsafe-eval';");
    res.sendFile(path.join(__dirname, '/live.html'));
});

app.get('/replay/:replayid', async (req, res) => {
    const filePath = path.join(__dirname, `/../captures/${req.params.replayid}.bson`);
    res.sendFile(filePath);
});

// app.get('/live/streams', async (req, res) => {
//     const streamIds = Object.keys(streamCache);
//     res.status(200).send(streamIds);
// });

// app.post('/live/save/:streamid', async (req, res) => {
//     const replayData = streamCache[req.params.streamid];
//     if (!replayData) {
//         res.status(404).send({
//             message: `No stream found with id ${req.params.streamid}`
//         });
//         return;
//     }
    
//     //console.log('Replay size ', BSON.calculateObjectSize(replayData));

//     let JSONData, BSONData;
//     try {
//         const FileData = ConvertToFileFormat(replayData.captures);
//         BSONData = BSON.serialize(FileData);
//         JSONData = JSON.stringify(FileData, null, 4);
//     } catch (e) {
//         console.log(e);
//         res.status(500).send({
//             message: `Failed to serialize replay data: ${e}`
//         });
//         return;
//     }
//     const capturesFolder = path.join(__dirname, '/../captures');
//     const fileName = `${replayData.placeId}-${req.body.PlaceVersion}-${req.params.streamid}`;

//     fs.writeFileSync(path.join(capturesFolder, fileName + '.json'), JSONData);
//     fs.writeFileSync(path.join(capturesFolder, fileName + '.bson'), BSONData);

//     res.status(200).send({message: `Saved replay data to ${fileName}`});
//     //res.sendFile(path.join(__dirname, fileName));
// })

// // router.get('/capture', async (req, res) => {
// //     res.writeHead(200, { 'Content-Type': 'application/json' });
// //     fs.createReadStream('./captures.json').pipe(res);
// // });

// app.post('/live/capture/:streamid', async (req, res) => {
//     const body = req.body;
//     const streamId = req.params.streamid;

//     if (!streamCache[streamId]) {
//         streamCache[streamId] = {
//             captures: [],
//             placeId: req.headers['roblox-id'],
//             lastUpdate: Date.now()/1000,
//         }
//     }

//     streamCache[streamId].lastUpdate = Date.now()/1000;
//     streamCache[streamId].captures.push(...body.captures);

//     const clientData = {
//         type: 'chunk',
//         captures: body.captures,
//         id: streamId,
//     };

//     sendToAllClients(clientData);
//     res.status(202).send({
//         message: 'OK'
//     });
// });



app.listen(3000, '0.0.0.0', () => {
    console.log('listening on port 3000');
});