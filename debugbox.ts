import { BoxMesh } from "./box";
import { BoxCollider } from "./collision";
import { Behaviour, Component, GameObject, RenderBehaviour } from "./gameobject";
import { ValueBinding } from "./input";
import { Text } from "./text";
import { Vec } from "./vec";

export class DebugBox extends Behaviour {
    horiz: ValueBinding
    vert: ValueBinding
    Update(dt: number) {
        this.transform.pos = this.transform.pos.add(new Vec(this.horiz.value,this.vert.value))
    }
}

export class BoxRenderer extends RenderBehaviour {
    box: BoxMesh
    fillStyle: string = "#00ff00"
    Draw(dt: number, ctx:CanvasRenderingContext2D) {
        ctx.fillStyle = this.fillStyle;
        const start = (this.box.start);
        if (this.fillStyle === "#00ff00") {
            // console.log(start)
        }
        const dims = (this.box.end).sub(start);
        ctx.fillRect(start.x,start.y,dims.x,dims.y);
    }
    Init() {
        this.box = this.gameObject.GetComponent(BoxMesh) as BoxMesh;
    }
}