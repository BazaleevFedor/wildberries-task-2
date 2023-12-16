export class Canvas {
    constructor(id) {
        document.getElementById('js-meme-creator').innerHTML += `<canvas class="meme-layer meme-field_init" id="${id}"></canvas>`;

        document.addEventListener('DOMContentLoaded', () => {
            this._canvas = document.getElementById(id);
            this._context = this._canvas.getContext('2d');
        });

        this._history = [];
        this._elements = [];
    }

    getElem = () => {
        return this._canvas;
    }

    addElem = (newElem) => {
        this._elements.push(newElem);
        this._render();
    }

    editElem = (elem) => {
        const index = elem.index;

        if (!elem.text) {
            this._elements.splice(index, 1);
        } else {
            elem.index = null;
            this._elements[index] = elem;
        }

        this._render();
    }

    findElem = (x, y) => {
        console.log(this._elements)
        for (let i = this._elements.length - 1; i >= 0; i--) {
            const elem = this._elements[i];
            if (x >= elem.x1 && x <= elem.x2 && y >= elem.y1 && y <= elem.y2) {
                elem.index = i;
                this._render();
                return elem;
            }
        }

        return null;
    }

    changeSize = (width, height) => {
        this._canvas.classList.remove('meme-field_init');
        this._canvas.setAttribute('width', width);
        this._canvas.setAttribute('height', height);
    }

    clear = () => {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    delete = () => {
        this.clear();
        this._elements = [];
        this._canvas.classList.add('meme-field_init');
    }

    undo = () => {

    }

    _render() {
        throw new Error('method _render should be overridden in the child class');
    }

    _saveState = () => {

    }

    _restoreState = () => {

    }
}
