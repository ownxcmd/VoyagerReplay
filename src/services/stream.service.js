const { WebSocketServer } = require('ws');
const { sendToAllClients, convertToFileFormat } = require('../utils/helper.util.js');
const { BSON } = require('bson');
const path = require('path');
const fs = require('fs');

const server = new WebSocketServer({ port: 8080, clientTracking: true });
server.on('connection', (ws) => {
    console.log('Client connected');
});

const streamCache = {};


async function findAll() {
    return Object.keys(streamCache);
}

async function capture(streamId, captures, placeId) {
    const cacheEntry = (streamCache[streamId] = streamCache[streamId] || {
        captures: [],
        placeId: placeId,
    });

    cacheEntry.lastUpdate = Date.now()/1000;
    cacheEntry.captures.push(...captures);

    const clientData = {
        type: 'chunk',
        captures: captures,
        id: streamId,
    };

    sendToAllClients(server, clientData);
    
    return {
        message: 'OK'
    };
}

async function saveStream(streamId, placeVersion) {
    const replayData = streamCache[streamId];
    if (!replayData) {
        throw new Error(`No stream found with id ${streamId}`);
    }

    let JSONData, BSONData;
    try {
        const FileData = convertToFileFormat(replayData.captures);
        BSONData = BSON.serialize(FileData);
        JSONData = JSON.stringify(FileData, null, 4);
    } catch (e) {
        throw new Error(`Failed to serialize replay data: ${e}`);
    }
    const capturesFolder = path.join(__dirname, '/../../captures');
    const fileName = `${replayData.placeId}-${placeVersion}-${streamId}`;

    fs.writeFileSync(path.join(capturesFolder, fileName + '.json'), JSONData);
    fs.writeFileSync(path.join(capturesFolder, fileName + '.bson'), BSONData);

    sendToAllClients(server, {
        type: 'end',
        id: streamId,
    });
    delete streamCache[streamId];
    return {
        message: `Saved replay data to ${fileName}`
    };
}

(async () => {
    while (true) {
        const streamIds = Object.keys(streamCache);
        const now = Date.now()/1000;
        for (const streamId of streamIds) {
            const stream = streamCache[streamId];
            console.log(now - stream.lastUpdate);
            if (now - stream.lastUpdate > 10) {
                sendToAllClients(server, {
                    type: 'end',
                    id: streamId,
                });
                delete streamCache[streamId];
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
})();

module.exports = {
    findAll,
    capture,
    saveStream,
};