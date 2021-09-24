export interface ValueBinding {
    value: number
}
export interface TwoBind {
    value_pos: ValueBinding,
    value_neg: ValueBinding
}
export interface ConstBind {
    value: number
}
export class ConstBind implements ValueBinding {
    constructor(value: number) {
        this.value=value;
    }
}
export class TwoBind implements ValueBinding {
    get value() {
        return this.value_pos.value - this.value_neg.value;
    }
    constructor(neg: ValueBinding,pos: ValueBinding) {
        this.value_pos = pos;
        this.value_neg = neg;
    }
}
export interface MaxBind {
    a: ValueBinding,
    b: ValueBinding
}
export class MaxBind implements ValueBinding {
    get value() {
        let a = this.a.value;
        let b = this.b.value;
        return Math.abs(a) > Math.abs(b)? a : b
    }
}
export class KeyBinder {
    callbacks: Map<string,KeyBind[]>
    constructor(e: HTMLElement) {
        this.callbacks = new Map();
        e.addEventListener("keydown", (event) => {if (this.callbacks.has(event.code))this.callbacks.get(event.code).forEach((x) => x.down = true);})
        e.addEventListener("keyup", (event) => {if (this.callbacks.has(event.code))this.callbacks.get(event.code).forEach((x) => x.down = false)})
    }
    bind(key: string) {
        let b = new KeyBind();
        if (!this.callbacks.has(key)) {
            this.callbacks.set(key,[]);
        }
        this.callbacks.get(key).push(b);
        return b;
    }
}
export interface KeyBind {
    down: boolean
}
export class KeyBind implements ValueBinding {
    constructor() {
        this.down=false
    }
    get value() {
        return this.down ? 1 : 0;
    }
}