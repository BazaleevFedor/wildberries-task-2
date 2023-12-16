import {Canvas} from "./Canvas.js";

export default class CanvasPicture extends Canvas {
    constructor(id) {
        super(id);
    }

    _render = () => {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.drawImage(this._elements[0], 0, 0, this._canvas.width, this._canvas.height);
    }
}
