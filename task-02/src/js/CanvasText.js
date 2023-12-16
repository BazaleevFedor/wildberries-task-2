import {Canvas} from "./Canvas.js";

export default class CanvasText extends Canvas {
    constructor(id) {
        super(id);
    }

    _render = () => {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._elements.forEach((elem) => {
            if (elem.index === null || elem.index === undefined) {
                this._context.font = `${elem.styles.fontSize}px ${elem.styles.fontFamily}`;
                this._context.fillStyle = elem.styles.color;

                const metrics = this._context.measureText(elem.text);
                const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
                const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

                let row = [];
                let curX = elem.x1, curY = elem.y1 + actualHeight;

                elem.text.split(' ').forEach((word) => {
                    row.push(word);
                    if (this._context.measureText(row.join(' ')).width > elem.x2 - elem.x1) {
                        let isPop = false;
                        if (row.length > 1) {
                            row.pop();
                            isPop = true;
                        }

                        this._context.fillText(row.join(' '), curX, curY);
                        row = isPop ? [word] : [];
                        curY += fontHeight;
                    }
                });

                if (row.length) {
                    this._context.fillText(row.join(' '), curX, curY);
                }
            }
        });
    }
}
