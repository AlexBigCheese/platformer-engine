import { Engine } from "./engine";
import { Transform } from "./transform";

export abstract class Component {
    Start() { }
    Init() { } //runs when component is added
    gameObject: GameObject
    get transform() {
        return this.gameObject.transform
    }
}

export abstract class Behaviour extends Component {
    abstract Update(dt: number): void;
}

export abstract class RenderBehaviour extends Component {
    abstract Draw(dt: number, ctx: CanvasRenderingContext2D): void;
}

export class GameObject {
    engine: Engine;
    transform: Transform = new Transform();
    components: Component[] = [];
    tag: string = "";
    GetComponent<T extends Component>(T: new () => T): T {
        return this.components.find((x) => x instanceof T) as T
    }
    AddComponent<C extends Component>(ctor: new () => C): C {
        let comp = new ctor();
        this.components.push(comp);
        comp.gameObject = this;
        comp.Init();
        return comp
    }
    ApplyComponent<C extends Component>(C: new () => C, f: (comp: C) => void): void {
        let comp = new C()
        this.components.push(comp);
        comp.gameObject = this;
        f(comp);
        comp.Init();
    }
}

export interface ComponentTemplate {
    c: any,
    attrs: any,
}