import { Component, GameObject } from "./gameobject";
import { Vec } from "./vec";

export class Transform {
    parent: Transform = null;
    pos: Vec = Vec.zero;
    ///Local to World
    TransformPoint(p: Vec): Vec {
        const myspace = this.pos.add(p);
        if (this.parent === null) {
            return myspace;
        } else {
            return this.parent.TransformPoint(myspace);
        }
    }
    //World to Local
    InverseTransformPoint(p: Vec): Vec {
        let parentspace = (this.parent === null) ? p : this.parent.InverseTransformPoint(p);
        return parentspace.sub(this.pos);
    }
}