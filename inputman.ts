import {ValueBinding} from "./input";

export class Bindings {
    jump: ValueBinding;
    shoot: ValueBinding;
    reload: ValueBinding;
    horizontal: ValueBinding;
    vertical: ValueBinding;
}

export interface VelocityMeasure {
    value: () => number,
    current: number,
    last: number,
    delta: number,
    velocity: number,
}

export class VelocityMeasure {
    constructor(v: () => number) {
        this.value=v;
    }
    update(dt) {
        this.delta = dt;
        this.last=this.current;
        this.current=this.value();
        this.velocity = (this.current-this.last)/(this.delta);
    }
}

export class ButtonMeasure {
    change: number = 0;
    changed: boolean = false;
    current: number = 0;
    last: number = 0;
    threshold: number = 0.5;
    value: () => number;
    constructor(v: () => number) {
        this.value=v;
    }
    update() {
        this.last=this.current;
        this.current = this.value();
        //last=0,current=1
        //current-last=1
        if (Math.abs(this.current-this.last) > this.threshold) {
            this.change = this.current-this.last;
            this.changed = true;
        } else {
            this.change = 0;
            this.changed = false;
        }
    }
}