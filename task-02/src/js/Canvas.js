export class Canvas {
    constructor(parentId, id) {
        document.getElementById(parentId).innerHTML = `<canvas class="meme-layer meme-field_init" id="${ id }"></canvas>`;
        this._canvas = document.getElementById(id);
        this._context = this._canvas.getContext('2d');

        this._img = null;
    }

    addMeme = (textList) => {
        this.addText(textList);
    }

    addImg = (img, maxHeight, maxWidth) => {
        this._img = {img, maxHeight, maxWidth};
        let width = img.width, height = img.height;
        if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
        }

        if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
        }

        this.changeSize(height, width);
        this._context.drawImage(img, 0, 0, height, width);
    }

    addText = (textList) => {
        textList.forEach((elem) => {
            this._context.font = `${elem.size}px ${elem.font}`;
            this._context.fillStyle = elem.color;

            const metrics = this._context.measureText(elem.text);
            const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
            const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

            let row = [];
            let curX = elem.left + 1, curY = elem.top + actualHeight + 3;

            elem.text.split(' ').forEach((word) => {
                row.push(word);
                if (this._context.measureText(row.join(' ')).width > elem.width) {
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
        });
    }

    changeSize = (width, height) => {
        this._canvas.classList.remove('meme-field_init');
        this._canvas.setAttribute('width', width);
        this._canvas.setAttribute('height', height);
    }

    clear = () => {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._canvas.classList.add('meme-field_init');
        this._canvas.removeAttribute('width');
        this._canvas.removeAttribute('height');
    }

    download = () => {
        const imageDataURL = this._canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataURL;
        downloadLink.download = 'meme.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        this.clear();
        this.addImg(this._img.img, this._img.maxHeight, this._img.maxWidth);
    }
}
