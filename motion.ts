import { Behaviour } from "./gameobject";
import { Vec } from "./vec";

export class Motion extends Behaviour {
    velocity: Vec = Vec.zero //pixels per second
    Update(dt: number) {
        const dts = dt/1000;
        this.transform.pos = this.transform.pos.add(this.velocity.fmap(x=>x*dts));
    }
    Add(other: Vec) {
        this.velocity = this.velocity.add(other);
    }
    Set(x?:number,y?:number) {
        this.velocity = new Vec(x??this.velocity.x,y??this.velocity.y);
    }
}