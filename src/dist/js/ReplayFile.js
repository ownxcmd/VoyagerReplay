import { Replay } from './Replay.js'

class ReplayFile extends Replay {
    constructor(replayData) {
        super();

        this.id = replayData.id;
        this.queue = ReplayFile.loadFileData(replayData);
        this.displayLoop();
    }

    static loadFileData(replayData) {
        const captures = [{
            MapInfo: replayData.MapInfo,
            CameraInfo: replayData.CameraInfo,
        }];

        console.log(captures);

        for (const [PartId, PartInfo] of Object.entries(replayData.MovingInfo)) {
            const LastFrame = Number(Object.keys(PartInfo.Positions).reverse()[0]) ;
            const FirstFrame = Number(Object.keys(PartInfo.Positions)[0]);

            let [CurrentSize, CurrentPosition, CurrentRotation] = [PartInfo.Sizes[FirstFrame], PartInfo.Positions[FirstFrame], PartInfo.Rotations[FirstFrame]];
            for (let i = FirstFrame; i<=LastFrame; i++) {
                const capture = (captures[i] = captures[i] || {});

                capture.MovingInfo = capture.MovingInfo || {};

                CurrentSize = PartInfo.Sizes[i] || CurrentSize;
                CurrentPosition = PartInfo.Positions[i] || CurrentPosition;
                CurrentRotation = PartInfo.Rotations[i] || CurrentRotation;
                
                capture.MovingInfo[PartId] = {
                    Shape: PartInfo.Shape,
                    Color: PartInfo.Color,
                    Transparency: PartInfo.Transparency,
                    Tags: PartInfo.Tags,
                    Size: CurrentSize,
                    Position: CurrentPosition,
                    Rotation: CurrentRotation,
                }
            }
        }

        return captures;
    }
}

export { ReplayFile }