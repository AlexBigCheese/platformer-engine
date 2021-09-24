import { BoxMesh } from "./box";
import { BoxCollider } from "./collision";
import { BoxRenderer, DebugBox } from "./debugbox";
import { Behaviour, Component, GameObject, RenderBehaviour } from "./gameobject"
import { KeyBinder, TwoBind } from "./input";
import { Bindings } from "./inputman";
import { Player } from "./player";
import { Transform } from "./transform";
import { Vec } from "./vec";

export class Engine {
  bindings: Bindings;
  ctx: CanvasRenderingContext2D;
  af: number;
  last_time: number = 0;
  cur_time: number = 0;
  dt: number = 0;
  gameObjects: GameObject[] = [];
  Update(dt: number) {
    this.gameObjects.forEach((o) => {
      o.components.forEach((c) => {
        if (c instanceof Behaviour) c.Update(dt);
        return true;
      })
    })
  }
  Draw(dt: number) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.gameObjects.forEach((o) => {
      o.components.forEach((c) => {
        if (c instanceof RenderBehaviour) c.Draw(dt, this.ctx);
        return true;
      })
    })
  }
  Start() {
    this.gameObjects.forEach((o) => o.components.forEach((c) => { c.Start(); return true }));
    let eng = this;
    function upd(t: number) {
      eng.dt = t-eng.cur_time;
      eng.cur_time = t;
      eng.Update(eng.dt);
      eng.Draw(eng.dt);
      eng.af = window.requestAnimationFrame(upd);
    }
    this.af = window.requestAnimationFrame(upd);
  }
  Stop() {
    window.cancelAnimationFrame(this.af);
  }
  CreateGameObject(): GameObject {
    let o = new GameObject();
    o.engine = this;
    this.gameObjects.push(o);
    return o;
  }
  constructor(canvas: HTMLCanvasElement, bindings: Bindings) {
    this.bindings = bindings;
    this.ctx = canvas.getContext("2d");
  }
}
let canvas: HTMLCanvasElement = document.createElement("canvas");
canvas.width = 640;
canvas.height = 480;
document.body.appendChild(canvas);
let keybinder = new KeyBinder(document.body);
let binds = {
  jump: keybinder.bind("Space"),
  horizontal: new TwoBind(keybinder.bind("ArrowLeft"), keybinder.bind("ArrowRight")),
  vertical: new TwoBind(keybinder.bind("ArrowUp"), keybinder.bind("ArrowDown")),
  shoot: keybinder.bind("KeyX"),
  reload: keybinder.bind("KeyC"),
} as Bindings;
let engine = new Engine(canvas, binds);
{
  let player = engine.CreateGameObject();
  player.transform.pos = new Vec(0, 60);
  player.ApplyComponent(BoxMesh, box => { box.radius = new Vec(8, 8) });
  player.AddComponent(Player);
}
{
  let ground = engine.CreateGameObject();
  ground.transform.pos = new Vec(640 / 2, 200);
  ground.ApplyComponent(BoxMesh, box => { box.radius = new Vec(640 / 2, 20); console.log(box.start,box.end)});
  ground.AddComponent(BoxCollider);
  ground.ApplyComponent(BoxRenderer, renderer => {
    renderer.fillStyle = "#00ff00";
  });
  ground.tag = "terrain"
}
{
  let m_terrain = engine.CreateGameObject();
  m_terrain.transform.pos = new Vec(640 / 2, 480 / 2);
  m_terrain.ApplyComponent(BoxMesh, box => { box.radius = new Vec(32, 32); });
  m_terrain.AddComponent(BoxCollider);
  m_terrain.ApplyComponent(BoxRenderer, renderer => { renderer.fillStyle = "#ffff00" });
  m_terrain.ApplyComponent(DebugBox, d_box => {
    d_box.horiz = new TwoBind(keybinder.bind("KeyJ"), keybinder.bind("KeyL"));
    d_box.vert = new TwoBind(keybinder.bind("KeyI"), keybinder.bind("KeyK"));
  });
  m_terrain.tag = "terrain";
}
engine.Start();