import memeMenu from "./memeMenu.js";
import {Canvas} from "./Canvas.js";
import {TextContainer} from "./TextContainer.js";

class MemeCreator {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this._memeElem = document.getElementById('js-meme');
            this._memeCreatorElem = document.getElementById('js-meme-creator');
            this._addImageElem = document.getElementById('js-add-image');
            this._addImageButton = document.getElementById('js-add-image-button');
            this._addImageInputElem = document.getElementById('js-input-img');

            this._offsetLeft = this._memeElem.offsetLeft + this._memeCreatorElem.offsetLeft;
            this._offsetTop = this._memeElem.offsetTop + this._memeCreatorElem.offsetTop;

            this._Canvas = new Canvas('js-canvas-container', 'js-meme-canvas');
            this._Text = new TextContainer('js-text-container', this._offsetLeft, this._offsetTop);
            this._menu = new memeMenu([this._download, this._clear]);

            this._addListeners();
        });
    }

    _clear = () => {
        this._menu.blockMenu();
        this._Canvas.clear();
        this._Text.clear();
        this._addDownloadImgButton();
    }

    _download = () => {
        this._Canvas.addMeme(this._Text._texts);
        this._Canvas.download();
    }

    _addImg = (file) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result.toString();

            img.onload = () => {
                this._Canvas.addImg(img, this._addImageElem.offsetHeight, this._addImageElem.offsetWidth);
                this._menu.unlockMenu();
                this._removeDownloadImgButton();
            };
        };

        reader.readAsDataURL(file);
    };

    _addDownloadImgButton = () => {
        this._addImageElem.style.display = 'flex';
    }

    _removeDownloadImgButton = () => {
        this._addImageElem.style.display = 'none';
    }

    _addListeners = () => {
        this._addImageButton.addEventListener('click', () => {
            this._addImageInputElem.click();
        });

        this._addImageInputElem.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image')) {
                this._addImg(file);
                this._addImageInputElem.value = '';
            }
        });
    }
}

export default new MemeCreator();
