import memeMenu from "./memeMenu.js";
import {context} from "./context.js";

class MemeCreator {
    constructor() {
        this._render();
        this._convas = document.getElementById('js-meme');
        this._addListeners();
    }

    _addListeners = () => {
        const addImgButton = document.getElementById('js-add-img');
        const addImgInput = document.getElementById('js-input-img');
        addImgButton.addEventListener('click', () => {
            addImgInput.click();
        });

        addImgInput.addEventListener('change', (event) => {
            const file = event.target.files[0];

            if (file && file.type.startsWith('image')) {
                document.getElementById('js-add-image').classList.add('display-none');
                document.getElementById('js-add-image').classList.remove('add-image');
                memeMenu.unlockMenu();

                this._addImg(file);

                console.log('Изображение выбрано:', file.name);
            } else {
                alert('Ошибка при выборе изображения для мема');
            }
        });

        const managementButtons = document.querySelectorAll('.management__item');
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
        const canvas = document.getElementById('js-meme');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.add('meme-field_init');
        canvas.removeAttribute('height');
        canvas.removeAttribute('width');
    }

    _download = () => {
        const canvas = document.getElementById('js-meme');
        const ctx = canvas.getContext('2d');
        const imageDataURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataURL;
        downloadLink.download = 'meme.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    _addImg = (file) => {
        const canvas = document.getElementById('js-meme');
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
                const imgRatio = img.width / img.height;
                const screenRatio = canvas.offsetWidth / canvas.offsetHeight;

                console.log(imgRatio, screenRatio)

                // устанавливаем новые размеры canvas в соответствии с соотношением сторон изображения
                const maxHeight = canvas.offsetHeight;
                const maxWidth = canvas.offsetWidth;
                if (imgRatio > 1 && imgRatio >= screenRatio) {
                    canvas.width = maxWidth;
                    canvas.height = maxWidth / imgRatio;
                } else {
                    canvas.height = maxHeight;
                    canvas.width = maxHeight * imgRatio;
                    console.log(canvas.height, canvas.width)
                }
                canvas.classList.remove('meme-field_init');

                // Очищаем canvas и рисуем изображение
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
        };

        reader.readAsDataURL(file);
    };




    _addText = () => {

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
