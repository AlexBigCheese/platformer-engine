import { BoxMesh } from "./box";
import { Component, GameObject } from "./gameobject";
import { Motion } from "./motion";
import { Transform } from "./transform";
import {Vec} from "./vec";
export interface Collision<T> {
    other: T,
}

export class Collision<T> {
    constructor(other:T) {
        this.other=other;
    }
}

export interface Collidable<T> {
    collide(other: T): Collision<T>
}

export interface SlideSpec {
    normal: Vec
    new_center: Vec
}

export class BoxCollider extends Component implements Collidable<BoxCollider> {
    box: BoxMesh
    collide(other: BoxCollider) {
        if (this.box.start.x < other.box.end.x &&
            this.box.end.x > other.box.start.x &&
            this.box.start.y < other.box.end.y &&
            this.box.end.y > other.box.start.y) {return new Collision(other)} else return null
    }
    Init() {
        this.box = this.gameObject.GetComponent(BoxMesh) as BoxMesh;
    }
    slide(other: BoxCollider,motion: Motion) { //other is going in direction, slide them along me.
        other.transform.pos.sub(motion.velocity);
        const my_corner = this.box.ClosestCorner(motion.velocity.neg()); //if vy = 0, this is left or right
        const their_corner = other.box.ClosestCorner(motion.velocity);   //   vx = 0,         top or bottom
        const diff_corner = their_corner.sub(my_corner); //from mine to theirs
        if (motion.velocity.y === 0) {
            other.transform.pos.x -= diff_corner.x;
            motion.velocity.x = 0;
            return;
        } else if (motion.velocity.x === 0) {
            //change the y pos by the difference of terra top to player bottom
            other.transform.pos.y -= diff_corner.y;
            motion.velocity.y = 0;
            return;
        }
        //dcy + dcx*vy/vx = ydiff
        const use_y = Math.sign(diff_corner.y+diff_corner.x*motion.velocity.y/motion.velocity.x);
        // -1 = slide along |
        // 0 = corner
        // 1 = slide along -
        switch (use_y) {
            case 1:
                other.transform.pos.x += motion.velocity.x*this.gameObject.engine.dt/1000
                other.transform.pos.y -= diff_corner.y;
                motion.velocity.y = 0;
                break
            case 0:
            case -1:
                console.log("wow")
                other.transform.pos.y += motion.velocity.y*this.gameObject.engine.dt/1000
                other.transform.pos.x -= diff_corner.x;
                motion.velocity.x = 0;
                break
        }
    }
}