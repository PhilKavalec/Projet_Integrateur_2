import { AbstractCommand } from "./abstractCommand";
import { EditorScene } from "../editorScene";

export class SelectVertex extends AbstractCommand {

    private vertexName: string;

    public constructor(editorScene: EditorScene, vertex: string) {
        super(editorScene);
        this.vertexName = vertex;
    }

    public execute(): void {
        this.editorScene.setSelectedVertex(this.vertexName);
    }
}
