import {Component,GameObject, RenderBehaviour} from "./gameobject"
export class Text extends RenderBehaviour {
    text: string = ""
    font: string = "sans"
    fillStyle: string|CanvasGradient|CanvasPattern = "#000000"
    Draw(dt: number,ctx: CanvasRenderingContext2D) {
        ctx.font = this.font;
        ctx.fillStyle = this.fillStyle;
        ctx.fillText(this.text,this.transform.pos.x,this.transform.pos.y);
    }
}