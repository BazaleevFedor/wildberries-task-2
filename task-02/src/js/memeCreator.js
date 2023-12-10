import memeMenu from "./memeMenu.js";
import {context} from "./context.js";

class MemeCreator {
    constructor() {
        this._render();
        this._meme = document.getElementById('js-meme');
        this._convasImg = document.getElementById('js-meme-img');
        this._convasText = document.getElementById('js-meme-text');
        this._addListeners();
        this._offsetLeft = this._convasImg.offsetLeft;
        this._offsetTop = this._convasImg.offsetTop;
        this._textList = new Map();
    }

    _addListeners = () => {
        const addImgButton = document.getElementById('js-add-img');
        const addImgInput = document.getElementById('js-input-img');
        const managementButtons = document.querySelectorAll('.management__item');

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
                } else if (context.managementButtons[index].action === 'download') {
                    this._download();
                }
            });
        });
    }

    _clear = () => {
        document.getElementById('js-add-image').classList.remove('display-none');
        document.getElementById('js-add-image').classList.add('add-image');
        const canvas = this._meme;
        const canvasImg = this._convasImg;
        const canvasText = this._convasText;

        const ctxImg = canvasImg.getContext('2d');
        const ctxText = canvasText.getContext('2d');
        ctxImg.clearRect(0, 0, canvas.width, canvas.height);
        ctxText.clearRect(0, 0, canvas.width, canvas.height);

        canvas.classList.add('meme-field_init');
        canvas.removeAttribute('height');
        canvas.removeAttribute('width');
    }

    _download = () => {
        const canvas = this._convas;
        const imageDataURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataURL;
        downloadLink.download = 'meme.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    _addImg = (file) => {
        document.getElementById('js-add-image').classList.add('display-none');
        document.getElementById('js-add-image').classList.remove('add-image');
        memeMenu.unlockMenu();

        const meme = this._meme;
        const canvasImg = this._convasImg;
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
                const imgRatio = img.width / img.height;
                const screenRatio = meme.offsetWidth / meme.offsetHeight;

                const maxHeight = meme.offsetHeight;
                const maxWidth = meme.offsetWidth;
                if (imgRatio > 1 && imgRatio >= screenRatio) {
                    meme.width = maxWidth;
                    meme.height = maxWidth / imgRatio;
                } else {
                    meme.height = maxHeight;
                    meme.width = maxHeight * imgRatio;
                }
                meme.classList.remove('meme-field_init');

                const ctx = canvasImg.getContext('2d');
                ctx.clearRect(0, 0, meme.width, meme.height);
                ctx.drawImage(img, 0, 0, meme.width, meme.height);
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
    }
}

export default new MemeCreator();
