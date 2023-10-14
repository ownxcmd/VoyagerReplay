import { Replay } from './Replay.js'

class ReplayFile extends Replay {
    constructor(renderer, replayData) {
        super(renderer);

        this.id = replayData.id;
        this.queue = this.loadFileData(replayData);
        this.displayLoop();
    }

    loadFileData(replayData) {
        const captures = [{}];

        console.log(captures);

        captures[0].MapInfo = replayData.MapInfo;
        captures[0].CameraInfo = replayData.CameraInfo;

        for (const [PartId, PartInfo] of Object.entries(replayData.MovingInfo)) {
            const LastFrame = Number(Object.keys(PartInfo.Positions).reverse()[0]) ;
            const FirstFrame = Number(Object.keys(PartInfo.Positions)[0]);

            let [CurrentSize, CurrentPosition, CurrentRotation] = [PartInfo.Sizes[FirstFrame], PartInfo.Positions[FirstFrame], PartInfo.Rotations[FirstFrame]];
            for (let i = FirstFrame; i<=LastFrame; i++) {
                if (!captures[i]) {
                    captures[i] = {}
                } 
                
                if (!captures[i].MovingInfo) {
                    captures[i].MovingInfo = {};
                }

                if (PartInfo.Sizes[i]) {
                    CurrentSize = PartInfo.Sizes[i];
                }
                if (PartInfo.Positions[i]) {
                    CurrentPosition = PartInfo.Positions[i];
                }
                if (PartInfo.Rotations[i]) {
                    CurrentRotation = PartInfo.Rotations[i];
                }

                //console.log(i, captures[i].MovingInfo)

                captures[i].MovingInfo[PartId] = {
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