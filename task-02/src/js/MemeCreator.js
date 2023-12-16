import memeMenu from "./memeMenu.js";
import {context} from "./context.js";

class MemeCreator {
    constructor() {
        this._render();
        this._canvasImg = document.getElementById('js-meme-img');
        this._canvasText = document.getElementById('js-meme-text');
        this.tmp = document.querySelector('.meme-creator');
        this._addListeners();

        this._offsetLeft = this._canvasImg.offsetLeft + this.tmp.offsetLeft;
        this._offsetTop = this._canvasImg.offsetTop + this.tmp.offsetTop;
    }

    _addListeners = () => {
        const addImgButton = document.getElementById('js-add-img');
        const addImgInput = document.getElementById('js-input-img');
        const managementButtons = document.querySelectorAll('.management__item');

        const editContainer = document.getElementById('edit-text-container');
        const stylePanel = document.getElementById('js-style-panel');
        const editText = document.getElementById('js-edit-text');
        const colorSelect = document.getElementById('js-color-select');
        const sizeSelect = document.getElementById('js-size-select');
        const fontSelect = document.getElementById('js-font-select');

        let textList = [];
        let curText = null;

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
                    textList = [];
                    curText = null;
                } else if (context.managementButtons[index].action === 'download') {
                    this._download();
                }
            });
        });

        this._canvasText.addEventListener('mousedown', (event) => {
            if (memeMenu.getCurAction() === 'text' && !curText) {
                curText = {
                    x1: event.clientX - this._offsetLeft, y1: event.clientY - this._offsetTop,
                    x2: 0, y2: 0,
                    styles: {fontSize: sizeSelect.value, fontFamily: fontSelect.value, color: colorSelect.value},
                    isChangingOutline: true,
                };
            } else {
                focusout();
            }
        });

        let isCall = false;
        this._canvasText.addEventListener('mousemove', (event) => {
            if (!isCall) {
                isCall = true;
                if (memeMenu.getCurAction() === 'text' && curText && curText.isChangingOutline) {
                    curText.x2 = event.clientX - this._offsetLeft;
                    curText.y2 = event.clientY - this._offsetTop;
                    this._rerenderTextCanvas(textList, curText);
                }
                setTimeout(() => isCall = false, 100);
            }
        });

        this._canvasText.addEventListener('mouseup', (event) => {
            if (memeMenu.getCurAction() === 'text' && curText && curText.isChangingOutline) {
                curText.x2 = event.clientX - this._offsetLeft;
                curText.y2 = event.clientY - this._offsetTop;

                if (curText.x1 === curText.x2 || curText.y1 === curText.y2) {
                    curText = null;
                    return;
                }

                if (curText.x1 > curText.x2) {
                    const tmp = curText.x1;
                    curText.x1 = curText.x2;
                    curText.x2 = tmp;
                }

                if (curText.y1 > curText.y2) {
                    const tmp = curText.y1;
                    curText.y1 = curText.y2;
                    curText.y2 = tmp;
                }

                curText.isChangingOutline = false;

                this._rerenderTextCanvas(textList, curText);

                editContainer.style.display = 'block';
                editContainer.style.width = `${curText.x2 - curText.x1}px`;
                editContainer.style.height = `${curText.y2 - curText.y1}px`;
                editContainer.style.left = `${curText.x1}px`;
                editContainer.style.top = `${curText.y1}px`;

                editText.style.color = colorSelect.value;
                editText.style.fontSize = sizeSelect.value + 'px';
                editText.style.fontFamily = fontSelect.value;
                editText.innerText = 'Введите тут ваш текст';
                editText.focus();
            }
        });

        this._canvasText.addEventListener('mouseleave', () => {
            // Дополнительная проверка, чтобы избежать проблемы, если мышь покидает область canvas во время рисования
            if (memeMenu.getCurAction() === 'text' && curText && curText.isChangingOutline) {
                curText = null;
                this._rerenderTextCanvas(textList, curText);
            }
        });

        stylePanel.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        const focusout = () => {
            if (editText.innerText) {
                curText.text = editText.innerText;
                textList.push(curText);
            }
            curText = null;
            this._rerenderTextCanvas(textList, curText);
            editContainer.style.display = 'none';
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

    _rerenderTextCanvas = (textList, curText) => {
        const canvasText = document.getElementById('js-meme-text');
        const ctxText = canvasText.getContext('2d');

        ctxText.clearRect(0, 0, canvasText.width, canvasText.height);

        if (curText) {
            ctxText.beginPath();
            ctxText.setLineDash([5, 5]);
            ctxText.moveTo(curText.x1, curText.y1);
            ctxText.rect(curText.x1, curText.y1, curText.x2 - curText.x1, curText.y2 - curText.y1);
            ctxText.closePath();
            ctxText.stroke();
        }

        textList.forEach((text) => {
            this._wrapText(ctxText, text);
        });
    }

    _wrapText = (ctx, text) => {
        ctx.font = `${text.styles.fontSize}px ${text.styles.fontFamily}`;
        ctx.fillStyle = text.styles.color;

        const maxWidth = text.x2 - text.x1;
        let row = [];
        let curX = text.x1;
        const metrics = ctx.measureText(text.text);
        const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        let curY = text.y1 + actualHeight;

        text.text.split(' ').forEach((word) => {
            row.push(word);
            if (ctx.measureText(row.join(' ')).width > maxWidth) {
                if (row.length > 1) {
                    row.pop();
                    ctx.fillText(row.join(' '), curX, curY);
                    row = [word];
                } else {
                    ctx.fillText(row.join(' '), curX, curY);
                    row = [];
                }

                curY += fontHeight;
            }

        });

        if (row.length) {
            ctx.fillText(row.join(' '), curX, curY);
        }
    }

    _clear = () => {
        document.getElementById('js-add-image').style.display = 'flex';
        const canvasImg = this._canvasImg;
        const canvasText = this._canvasText;

        const ctxImg = canvasImg.getContext('2d');
        const ctxText = canvasImg.getContext('2d');
        ctxImg.clearRect(0, 0, canvasImg.width, canvasImg.height);
        ctxText.clearRect(0, 0, canvasText.width, canvasText.height);

        canvasImg.classList.add('meme-field_init');
        canvasText.classList.add('meme-field_init');
    }

    _download = () => {

    }

    _addImg = (file) => {
        document.getElementById('js-add-image').style.display = 'none';
        memeMenu.unlockMenu();

        const canvasImg = this._canvasImg;
        const canvasText = this._canvasText;
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
                const imgRatio = img.width / img.height;
                const screenRatio = canvasImg.offsetWidth / canvasImg.offsetHeight;

                const maxHeight = canvasImg.offsetHeight;
                const maxWidth = canvasImg.offsetWidth;

                if (imgRatio > 1 && imgRatio >= screenRatio) {
                    canvasImg.width = maxWidth;
                    canvasText.width = maxWidth;
                    canvasImg.height = maxWidth / imgRatio;
                    canvasText.height = maxWidth / imgRatio;
                } else {
                    canvasImg.height = maxHeight;
                    canvasText.height = maxHeight;
                    canvasImg.width = maxHeight * imgRatio;
                    canvasText.width = maxHeight * imgRatio;
                }
                canvasImg.classList.remove('meme-field_init');
                canvasText.classList.remove('meme-field_init');

                const ctxImg = canvasImg.getContext('2d');
                const ctxText = canvasImg.getContext('2d');
                ctxImg.clearRect(0, 0, canvasImg.width, canvasImg.height);
                ctxText.clearRect(0, 0, canvasText.width, canvasText.height);
                ctxImg.drawImage(img, 0, 0, canvasImg.width, canvasImg.height);
            };
        };

        reader.readAsDataURL(file);
    };

    _addText = (coordinates, text, lastCoordinates = null) => {
        this._textList.set(coordinates, text);

        if (lastCoordinates) {
            this._textList.delete(lastCoordinates);
        }
    }

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
