import { BoxCollider, Collidable } from "./collision";
import { BoxRenderer } from "./debugbox";
import { Behaviour, Component, GameObject } from "./gameobject";
import { ValueBinding } from "./input";
import { ButtonMeasure, VelocityMeasure } from "./inputman";
import { Motion } from "./motion";
import { Transform } from "./transform";
import { Vec } from "./vec";

export class Player extends Behaviour {
    motion: Motion;
    collider: BoxCollider;
    color: string = "#ff0000";
    hbind: ValueBinding;
    jbind: ButtonMeasure;
    gameObject: GameObject;
    Update(dt: number) {
        this.jbind.update();
        if (this.jbind.change == 1) {
            this.motion.Set(null,-10*this.jbind.change * dt);
        }
        this.motion.velocity.x = 50*this.hbind.value;
        this.motion.Add(new Vec(0,4));
    }
    Init() {
        console.log("bruh");
        this.jbind = new ButtonMeasure(() => this.gameObject.engine.bindings.jump.value);
        this.hbind = this.gameObject.engine.bindings.horizontal;
        this.collider = this.gameObject.AddComponent(BoxCollider);
        this.motion = this.gameObject.AddComponent(Motion);
        let renderer = this.gameObject.AddComponent(BoxRenderer);
        let body = this.gameObject.AddComponent(BoxBody)
        renderer.fillStyle = "#0000ff"
        console.log(this);
    }
}

export class BoxBody extends Behaviour {
    motion: Motion
    collider: BoxCollider
    Update(dt: number): void {
        let collided = false;
        this.gameObject.engine.gameObjects.filter(x => x.tag == "terrain").forEach(terra => {
            const t_coll = terra.GetComponent(BoxCollider) as BoxCollider;
            if (t_coll.collide(this.collider)) {collided=true;t_coll.slide(this.collider,this.motion)}
        })
    }
    Init() {
        this.motion = this.gameObject.GetComponent(Motion);
        this.collider = this.gameObject.GetComponent(BoxCollider);
    }
}