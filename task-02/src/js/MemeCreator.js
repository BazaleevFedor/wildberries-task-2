import memeMenu from "./memeMenu.js";
import {context} from "./context.js";
import CanvasPicture from "./CanvasPicture.js";
import CanvasText from "./CanvasText.js";

class MemeCreator {
    constructor() {
        this._canvasPicture = new CanvasPicture('js-meme-img');
        this._canvasText = new CanvasText('js-meme-text');
        this._menu = new memeMenu();

        document.addEventListener('DOMContentLoaded', () => {
            this._canvasTextElem = document.getElementById('js-meme-text');
            this._render();
            this._addListeners();

            const memeCreator = document.getElementById('js-meme-creator');
            const image = document.getElementById('js-add-image');
            this._offsetLeft = image.offsetLeft + memeCreator.offsetLeft;
            this._offsetTop = image.offsetTop + memeCreator.offsetTop;
        });
    }

    _addListeners = () => {
        const addImgButton = document.getElementById('js-add-image-button');
        const addImgInput = document.getElementById('js-input-img');
        const managementButtons = document.querySelectorAll('.management__item');

        const editContainer = document.getElementById('edit-text-container');
        const stylePanel = document.getElementById('js-style-panel');
        const editText = document.getElementById('js-edit-text');
        const colorSelect = document.getElementById('js-color-select');
        const sizeSelect = document.getElementById('js-size-select');
        const fontSelect = document.getElementById('js-font-select');

        let curText = null;
        let curState = null;

        addImgButton.addEventListener('click', () => {
            addImgInput.click();
        });

        addImgInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image')) {
                this._addImg(file);
            } else {
                alert('Ошибка при выборе изображения для мема');
            }
        });

        Array.from(managementButtons).forEach((button, index) => {
            button.addEventListener('click', () => {
                if (context.managementButtons[index].action === 'clear') {
                    this._clear();
                    curText = null;
                } else if (context.managementButtons[index].action === 'download') {
                    this._download();
                }
            });
        });

        this._canvasTextElem.addEventListener('mousedown', (event) => {
            if (this._menu.getCurAction() === 'text' && curText === null) {
                curState = 'createText';
                curText = {
                    x1: event.clientX - this._offsetLeft, y1: event.clientY - this._offsetTop, x2: event.clientX - this._offsetLeft, y2: event.clientY - this._offsetTop,
                    styles: {fontSize: sizeSelect.value, fontFamily: fontSelect.value, color: colorSelect.value},
                };

                stylePanel.style.display = 'none';
                editContainer.style.display = 'block';
                editContainer.style.pointerEvents = 'none';
                this._setElemSize(editContainer, curText);
            } else if (this._menu.getCurAction() === 'move' && curText === null) {
                curText = this._canvasText.findElem(event.clientX - this._offsetLeft, event.clientY - this._offsetTop);

                if (curText) {
                    curState = 'editText';
                    stylePanel.style.display = 'flex';
                    editContainer.style.display = 'block';
                    editContainer.style.pointerEvents = 'none';
                    this._setElemSize(editContainer, curText);
                    this._setElemStyle(editText, colorSelect.value, sizeSelect.value, fontSelect.value);
                    editText.innerText = curText.text;
                    editText.focus();
                }
            } else {
                focusout();
            }
        });

        let isCall = false;
        this._canvasTextElem.addEventListener('mousemove', (event) => {
            if (!isCall) {
                isCall = true;
                if (this._menu.getCurAction() === 'text' && curText && curState === 'createText') {
                    curText.x2 = event.clientX - this._offsetLeft;
                    curText.y2 = event.clientY - this._offsetTop;

                    this._setElemSize(editContainer, curText);
                }
                setTimeout(() => isCall = false, 100);
            }
        });

        this._canvasTextElem.addEventListener('mouseup', (event) => {
            if (this._menu.getCurAction() === 'text' && curText) {
                curText.x2 = event.clientX - this._offsetLeft;
                curText.y2 = event.clientY - this._offsetTop;
                [curText.x1, curText.x2] = [Math.min(curText.x1, curText.x2), Math.max(curText.x1, curText.x2)];
                [curText.y1, curText.y2] = [Math.min(curText.y1, curText.y2), Math.max(curText.y1, curText.y2)];

                if (curText.x1 === curText.x2 || curText.y1 === curText.y2) {
                    focusout();
                    return;
                }

                curState = 'editText';
                stylePanel.style.display = 'flex';
                editContainer.style.pointerEvents = 'auto';
                this._setElemSize(editContainer, curText);
                this._setElemStyle(editText, colorSelect.value, sizeSelect.value, fontSelect.value);
                editText.innerText = 'Введите тут ваш текст';
                editText.focus();
            }
        });

        editText.addEventListener('mousemove', (event) => {
            if (this._isBorder(curText, event.clientX - this._offsetLeft, event.clientY - this._offsetTop)) {
                editText.style.cursor = this._isBorder(curText, event.clientX - this._offsetLeft, event.clientY - this._offsetTop);
            } else {
                console.log(11)
                editText.style.cursor = 'auto';
            }
        });

        editText.addEventListener('mousedown', (event) => {
            if (this._isBorder(curText, event.clientX - this._offsetLeft, event.clientY - this._offsetTop) === 'move') {
                curState = {x: event.clientX, y: event.clientY}
            } else {
                curState = 'resize';
            }
        });

        editText.addEventListener('mousemove', (event) => {
            if (curState === 'resize') {
                curState = 'resize'
            } else {
                let deltaX = event.clientX - curState.x, deltaY = event.clientY - curState.y;
                curText.x1 += deltaX;
                curText.x2 += deltaX;
                curText.y1 += deltaY;
                curText.y2 += deltaY;
                this._setElemSize(editContainer, curText);
            }
        });



        stylePanel.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        const focusout = () => {
            if (editText.innerText || curText.index >= 0) {
                curText.text = editText.innerText;
                editText.innerText = '';
                if (curText.index >= 0) {
                    this._canvasText.editElem(curText);
                } else {
                    this._canvasText.addElem(curText);
                }
            }
            curText = null;
            editContainer.style.display = 'none';
            curState = 'none';
        }

        colorSelect?.addEventListener('change', () => {
            editText.style.color = colorSelect.value;
            curText.styles.color = colorSelect.value;
        });
        sizeSelect?.addEventListener('change', () => {
            editText.style.fontSize = sizeSelect.value + 'px';
            curText.styles.fontSize = sizeSelect.value;
        });
        fontSelect?.addEventListener('change', () => {
            editText.style.fontFamily = fontSelect.value;
            curText.styles.fontFamily = fontSelect.value;
        });
    }

    _clear = () => {
        document.getElementById('js-add-image').style.display = 'flex';
        this._canvasPicture.delete();
        this._canvasText.delete();
    }

    _download = () => {

    }

    _isBorder = ({x1, x2, y1, y2}, x, y) => {
        const eps = 5;
        if (Math.abs(x - x1) < eps && Math.abs(y - y1) < eps) return 'nwse-resize';
        if (Math.abs(x - x2) < eps && Math.abs(y - y1) < eps) return 'nesw-resize';
        if (Math.abs(x - x1) < eps && Math.abs(y - y2) < eps) return 'nesw-resize';
        if (Math.abs(x - x2) < eps && Math.abs(y - y2) < eps) return 'nwse-resize';
        if (Math.abs(y - y2) < eps) return 'move';
        if (Math.abs(y - y1) < eps) return 'move';
        if (Math.abs(x - x2) < eps) return 'move';
        if (Math.abs(x - x1) < eps) return 'move';
        return null;
    }

    _isInside = ({x1, x2, y1, y2}, x, y) => {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    _setElemSize = (elem, {x1, x2, y1, y2}) => {
        elem.style.width = `${x2 - x1}px`;
        elem.style.height = `${y2 - y1}px`;
        elem.style.left = `${x1}px`;
        elem.style.top = `${y1}px`;
    }

    _setElemStyle = (elem, color, size, font) => {
        elem.style.color = color;
        elem.style.fontSize = size + 'px';
        elem.style.fontFamily = font;
    }

    _addImg = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
                const maxHeight = document.getElementById('js-add-image').offsetHeight;
                const maxWidth = document.getElementById('js-add-image').offsetWidth;
                const imgRatio = img.width / img.height;

                let newWidth, newHeight;
                if (imgRatio > 1 && imgRatio >= maxWidth / maxHeight) {
                    newWidth = maxWidth;
                    newHeight = maxWidth / imgRatio;
                } else {
                    newHeight = maxHeight;
                    newWidth = maxHeight * imgRatio;
                }

                this._canvasPicture.changeSize(newWidth, newHeight);
                this._canvasText.changeSize(newWidth, newHeight);
                this._canvasPicture.addElem(img);
                document.getElementById('js-add-image').style.display = 'none';
                this._menu.unlockMenu();
            };
        };

        reader.readAsDataURL(file);
    };

    _render = () => {
        const memeMenuElem = document.querySelector('.menu__management');
        context.managementButtons.forEach(({title, src}) => {
            memeMenuElem.innerHTML += `
            <button class="management__item" title="${title}">
                <img class="item__img" src="${src}" alt="меню">
            </button>
        `;
        });

        const fontSelectElem = document.getElementById('js-font-select');
        context.fonts.forEach(({title}) => {
            fontSelectElem.innerHTML += `
                <option value="${title}">${title}</option>
            `;
        });

        const sizeSelectElem = document.getElementById('js-size-select');
        context.fontSizes.forEach(({title, selected}) => {
            sizeSelectElem.innerHTML += `
                <option ${selected ? 'selected' : ''} value="${title}">${title}</option>
            `;
        });
    }
}

export default new MemeCreator();
