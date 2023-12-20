import {context} from "./context.js";


/**
 * Класс отвечающий за отрисовку текстовых блоков.
 */
export class TextContainer {
    constructor(id, offsetLeft, offsetTop) {
        this._texts = [];
        this._offsetLeft = offsetLeft;
        this._offsetTop = offsetTop;
        this._editText = null;

        this._container = document.getElementById(id);
        this._editElem = document.getElementById('js-edit-text-container');
        this._editTextElem = document.getElementById('js-edit-text');
        this._fontSelectElem = document.getElementById('js-font-select');
        this._colorSelectElem = document.getElementById('js-color-select');
        this._sizeSelectElem = document.getElementById('js-size-select');
        this._resizeElem = document.getElementById('js-resize');
        this._stylePanelElem = document.getElementById('js-style-panel');

        this._renderEditElem();
        this._addListeners();
    }

    addNewElem = (x, y) => {
        const newElemInfo = JSON.parse(JSON.stringify(context.defaultElem));
        newElemInfo.id = this._texts.length
        newElemInfo.left = x - this._offsetLeft;
        newElemInfo.top = y - this._offsetTop;

        this._texts.push(newElemInfo);
        this._addEditElem(newElemInfo);
    }

    clear = () => {
        this._container.innerHTML = '';
        this._texts = [];
        this._removeEditElem();
        this._editText = null;
    }

    _addEditElem = (elemInfo) => {
        this._editElem = document.getElementById('js-edit-text-container');
        this._editElem.style.display = 'grid';
        this._editText = elemInfo;
        this._setStyleEditElem(elemInfo);
    }

    _saveElem = (elemInfo) => {
        this._removeEditElem();
        this._editText = null;

        if (elemInfo.text) {
            const newElement = document.createElement('div');
            newElement.innerHTML = this._renderElem(elemInfo);
            const elem = newElement.firstElementChild;
            this._container.appendChild(elem);

            this._texts[elemInfo.id] = elemInfo;
            elem.addEventListener('mouseup', (event) => {
                if (this._editText) {
                    this._saveElem(this._editText);
                }
                this._removeElem(this._texts[elem.getAttribute('data-id')]);
                this._addEditElem(this._texts[elem.getAttribute('data-id')]);
                event.stopPropagation();
            });
        }
    }

    _removeEditElem = () => {
        this._editElem.style.display = 'none';
    }

    _removeElem = (elem) => {
        document.querySelector(`.text-container[data-id="${elem.id}"]`)?.remove();
    }

    _containerClick = (event, curMenuAction) => {
        if (!this._editText && curMenuAction === 'text') {
            this.addNewElem(event.clientX, event.clientY);
        } else if (this._editText) {
            this._saveElem(this._editText);
        }
    }

    _addListeners = () => {
        this._editElem.addEventListener('click', (event) => {
            event.stopPropagation()
        });

        this._fontSelectElem.addEventListener('change', (event) => {
            this._editText.font = event.target.value;
            this._setStyleEditElem(this._editText);
        });

        this._sizeSelectElem.addEventListener('change', (event) => {
            this._editText.size = event.target.value;
            this._setStyleEditElem(this._editText);
        });

        this._colorSelectElem.addEventListener('input', (event) => {
            this._editText.color = event.target.value;
            this._setStyleEditElem(this._editText);
        });

        this._editTextElem.addEventListener('input', (event) => {
            this._editText.text = this._editTextElem.innerText;
        });

        this._editElem.firstElementChild.onmousedown = (event) => {
            const startX = event.clientX;
            const startY = event.clientY;

            this._stylePanelElem.style.cursor = 'grabbing';
            const deltaX = Number(this._editElem.style.left.replace('px', '')) + this._offsetLeft - event.clientX;
            const deltaY = Number(this._editElem.style.top.replace('px', '')) + this._offsetTop - event.clientY;

            const moveEditElem = (x, y) => {
                this._editText.left = x - this._offsetLeft + deltaX;
                this._editText.top = y - this._offsetTop + deltaY;
                this._editElem.style.left = `${this._editText.left}px`;
                this._editElem.style.top = `${this._editText.top}px`;

            }
            moveEditElem(event.clientX, event.clientY);

            const onMouseMove = (event) => {
                const width = document.body.offsetWidth;
                const height = document.body.offsetHeight;
                if (event.clientX < 0 || event.clientY < 0 || event.clientX > width || event.clientY > height) {
                    moveEditElem(startX, startY);
                    this._editElem.dispatchEvent(new Event('mouseup'));
                    return;
                }
                moveEditElem(event.clientX, event.clientY);
            }

            document.addEventListener('mousemove', onMouseMove);

            this._editElem.onmouseup = () => {
                this._stylePanelElem.style.cursor = 'grab';
                document.removeEventListener('mousemove', onMouseMove);
                this._editElem.onmouseup = null;
            };
        };

        this._editElem.ondragstart = () => {
            return false;
        };

        this._resizeElem.onmousedown = (event) => {
            const startX = event.clientX;
            const startY = event.clientY;

            const moveEditElem = (x, y) => {
                this._editText.width = x - this._offsetLeft - this._editText.left;
                this._editText.height = y - this._offsetTop - this._editText.top;
                this._editElem.style.width = `${this._editText.width}px`;
                this._editElem.style.height = `${this._editText.height}px`;

            }
            moveEditElem(event.pageX, event.pageY);

            const onMouseMove = (event) => {
                const width = document.body.offsetWidth;
                const height = document.body.offsetHeight;
                if (event.clientX < 0 || event.clientY < 0 || event.clientX > width || event.clientY > height) {
                    moveEditElem(startX, startY);
                    this._editElem.dispatchEvent(new Event('mouseup'));
                    return;
                }
                moveEditElem(event.pageX, event.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            this._editElem.onmouseup = () => {
                document.removeEventListener('mousemove', onMouseMove);
                this._editElem.onmouseup = null;
            };
        };

        this._editElem.ondragstart = () => {
            return false;
        };


    }

    _renderFontsSelect = () => {
        return context.fonts.map(({ title }) => `<option value="${ title }">${ title }</option>`);
    }

    _renderSizeSelect = () => {
        return context.fontSizes.map(({ title }) => `<option value="${ title }">${ title }</option>`);
    }

    _renderElem = (elem) => {
        return (`
            <div class="text-container" data-id="${ elem.id }" style="width: ${ elem.width }px; height: ${ elem.height }px; top: ${ elem.top }px; left: ${ elem.left }px ">
                <div class="text" style="font-family: ${ elem.font }; font-size: ${ elem.size }px; color: ${ elem.color };">${ elem.text }</div>
            </div>
        `);
    }

    _setStyleEditElem = (elemInfo) => {
        this._editElem.style.top = `${elemInfo.top}px`;
        this._editElem.style.left = `${elemInfo.left}px`;
        this._editElem.style.width = `${elemInfo.width}px`;
        this._editElem.style.height = `${elemInfo.height}px`;

        this._editTextElem.style.fontFamily = elemInfo.font;
        this._editTextElem.style.fontSize = `${elemInfo.size}px`;
        this._editTextElem.style.color = elemInfo.color;
        this._editTextElem.innerText = elemInfo.text;

        this._fontSelectElem.value = elemInfo.font;
        this._sizeSelectElem.value = elemInfo.size;
        this._colorSelectElem.value = elemInfo.color;
    }

    _renderEditElem = () => {
        this._fontSelectElem.innerHTML = this._renderFontsSelect();
        this._sizeSelectElem.innerHTML = this._renderSizeSelect();
    }
}

