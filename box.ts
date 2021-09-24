import { Component } from "./gameobject";
import { Transform } from "./transform";
import { Vec } from "./vec";

export class BoxMesh extends Component {
    radius: Vec
    get start() {
        return this.transform.pos.sub(this.radius)
    }
    get end() {
        return this.transform.pos.add(this.radius)
    }
    ClosestCorner(direction: Vec) {
        return this.transform.pos.add(this.radius.mul_parts(direction.fmap(Math.sign)))
    }
}