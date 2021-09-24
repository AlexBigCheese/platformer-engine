export interface Vec {
    x: number,
    y: number,
}
export class Vec {
    static get zero() { return new Vec(0, 0); }
    static get one() { return new Vec(1, 1); }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other: Vec) {
        return new Vec(this.x + other.x, this.y + other.y);
    }
    sub(other: Vec) {
        return this.add(other.fmap((x) => -x));
    }
    cross(other: Vec) {
        return this.x * other.y - this.y * other.x
    }
    dot(other: Vec) {
        return this.x * other.x + this.y * other.y
    }
    norm() {
        let mag = Math.sqrt(this.dot(this));
        return new Vec(this.x / mag, this.y / mag);
    }
    fmap(f: (d: number) => number) {
        return new Vec(f(this.x), f(this.y));
    }
    neg() {
        return new Vec(-this.x,-this.y);
    }
    mul_parts(other: Vec) {
        return new Vec(this.x*other.x,this.y*other.y)
    }
}