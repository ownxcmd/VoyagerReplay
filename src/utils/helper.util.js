const { WebSocket } = require('ws');

function sendToAllClients(websocket, data) {
    websocket.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

const lastObjIndex = obj => {
    return Object.keys(obj).reverse()[0]; 
};

const posEq = (pos1, pos2) => {
    if (!pos1 || !pos2) return false;

    return pos1[0] === pos2[0] && pos1[1] === pos2[1] && pos1[2] === pos2[2];
}

const convertToFileFormat = (captures) => {
    const SaveData = {};
    SaveData.MovingInfo = {};
    SaveData.FrameCount = captures.length;

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
            

            // If the last known position is the same as the current position, don't add it
            if (i == 0 || !posEq(PartEntry.Positions[lastObjIndex(PartEntry.Positions)], PartInfo.Position)) {
                PartEntry.Positions[i] = PartInfo.Position;
            }
            if (i == 0 || !posEq(PartEntry.Rotations[lastObjIndex(PartEntry.Rotations)], PartInfo.Rotation)) {
                PartEntry.Rotations[i] = PartInfo.Rotation;
            }
            if (i == 0 || !posEq(PartEntry.Sizes[lastObjIndex(PartEntry.Sizes)], PartInfo.Size)) {
                PartEntry.Sizes[i] = PartInfo.Size;
            }

            // Add null entries for deletion of parts
            const LastIndex = captures.findLastIndex((element) => element.MovingInfo[PartId]);
            if (i == LastIndex) {
                PartEntry.Positions[i+1] = null;
                PartEntry.Rotations[i+1] = null;
                PartEntry.Sizes[i+1] = null;
                continue;
            }
        }
    }

    console.log('Converted!')

    return SaveData;
}

module.exports = {
    convertToFileFormat,
    sendToAllClients,
    lastObjIndex,
    posEq,
}