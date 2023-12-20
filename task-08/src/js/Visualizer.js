import {context} from "./context.js";
import Sort from "./Sort.js";

class Visualizer {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this._arrayTypeElem = document.getElementById('js-select-array-type');

            this._arrayInputTitleElem = document.getElementById('js-array-title');
            this._arrayInputElem = document.getElementById('js-array-input');

            this._algSelectElem = document.getElementById('js-select-alg');
            this._speedSelectElem = document.getElementById('js-select-speed');

            this._errorElem = document.getElementById('js-error');

            this._startElem = document.getElementById('js-start-button');
            this._pauseElem = document.getElementById('js-pause-button');
            this._resumeElem = document.getElementById('js-resume-button');
            this._resetElem = document.getElementById('js-reset-button');

            this._statisticsElem = document.getElementById('js-statistics');
            this._timeElem = document.getElementById('js-time');
            this._iterationsElem = document.getElementById('js-iterations');

            this._visualizerElem = document.getElementById('js-visualizer');

            this._addListeners();
            this._render();
        });
    }

    _start = () => {
        this._array = this._getArray(this._arrayTypeElem.value, this._arrayInputElem.value);
        this._sortRender(this._array);
        this._timer = this._startTimer(this._timeElem, 30);
        this._sort =  Sort[this._algSelectElem.value](this._array, this._selectElem, this._swapElem, this._incCounter, this._stop);
    }

    /**
     * Пауза сортировки
     * @private
     */
    _pause = () => {
        this._timer.pause();
        this._sort.pause();
    }

    /**
     * Возобновление сортировки
     * @private
     */
    _resume = () => {
        this._timer.begin();
        this._sort.begin();
    }

    /**
     * Завершение сортировки
     * @private
     */
    _stop = () => {
        this._timer.pause();
        this._deactivateElem(this._pauseElem);

        this._startElem.style.display = 'none';
        this._pauseElem.style.display = '';
        this._resumeElem.style.display = 'none';
    }

    /**
     * Получение массива по параметрам
     * @param type - тип (генерация или парсинг)
     * @param arrayInfo
     * @return {*}
     * @private
     */
    _getArray = (type, arrayInfo) => {
        if (type === 'size') {
            let array = Array.from({ length: arrayInfo }, (v, i) =>  i + 1);
            return this._shuffle(array);
        }

        return JSON.parse(arrayInfo);
    }

    /**
     * Произвольное перетасовывание массива
     * @param array
     * @return {*}
     * @private
     */
    _shuffle = (array) => {
        let m = array.length, t, i;

        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return array;
    }

    /**
     * Таймер выполнения сортировки
     * @param timerElem
     * @param delay
     * @return {{begin: begin, pause: (function(): void)}}
     * @private
     */
    _startTimer = (timerElem, delay) => {
        let time = new Date(0);
        let timer;

        const begin = () => {
            timerElem.innerText = `${time.getUTCMinutes()}:${time.getUTCSeconds()}:${time.getUTCMilliseconds()}`;
            time.setMilliseconds(time.getMilliseconds() + delay);
            timer = setTimeout(begin, delay);
        }
        begin();

        return {pause: () => clearTimeout(timer), begin: begin}
    }

    _incCounter = () => {
        this._iterationsElem.innerText = `${Number(this._iterationsElem.innerText) + 1}`;
    }

    _validationEmpty = (string) => {
        if (!string) {
            this._addError('Нужно заполнить поле.');
        }
    }

    _validationArray = (string) => {
        if (!string) return;
        this._removeError();
        try {
            const array = JSON.parse(string);
            if (!Array.isArray(array)) {
                this._addError('Ожидается массив c натуральными числами вида [1, 3, 4, 2, ...]');
            } else if (!array.every(num => Number.isInteger(num) && num > 0)) {
                this._addError('Ожидается массив c натуральными числами вида [1, 3, 4, 2, ...]');
            } else if (!array.length) {
                this._addError('Массив не должен быть пустым.');
            }
        } catch (_) {
            this._addError('Ожидается массив c натуральными числами вида [1, 3, 4, 2, ...]');
        }
    }

    _validationNumber = (string) => {
        if (!string) return;
        if (!/^[-\d]+$/.test(string)) {
            this._addError('Я загадал целое число.');
        } else if (!Number(string)) {
            this._addError('Указано неверное значение.');
        } else if ((Number(string) < 1) || (Number(string) > 1000)) {
            this._addError('Число должно быть в интервале [1, 1000].');
        } else {
            this._removeError();
        }
    }

    /**
     * Выделение или снятие выделения двух элементов по id
     * @param id1
     * @param id2
     * @param isDelay
     * @return {Promise<void>}
     * @private
     */
    _selectElem = async (id1, id2 = null, isDelay = true) => {
        const column1 = document.querySelector(`.sort__column[data-id="${id1}"]`);
        const column2 = document.querySelector(`.sort__column[data-id="${id2}"]`);
        column1.classList.toggle('select');
        column2?.classList.toggle('select');

        if (isDelay) await new Promise(resolve => setTimeout(resolve, Number(this._speedSelectElem.value)));
    }

    /**
     * Переставление двух элементов по id с задержкой
     * @param id1
     * @param id2
     * @param isDelay
     * @return {Promise<void>}
     * @private
     */
    _swapElem = async (id1, id2, isDelay = true) => {
        const column1 = document.querySelector(`.sort__column[data-id="${id1}"]`);
        const column2 = document.querySelector(`.sort__column[data-id="${id2}"]`);
        const tmp = {item: column1.getAttribute('data-item'), height: column1.style.height};

        column1.setAttribute('data-item', column2.getAttribute('data-item'));
        column1.style.height = column2.style.height;
        column1.innerHTML = `<div class="column__id">${column2.getAttribute('data-item')}</div>`;

        column2.setAttribute('data-item', tmp.item);
        column2.style.height = tmp.height;
        column2.innerHTML = `<div class="column__id">${tmp.item}</div>`;

        if (isDelay) await new Promise(resolve => setTimeout(resolve, Number(this._speedSelectElem.value)));
    }

    _addError = (message) => {
        this._errorElem.innerText = message;
        this._deactivateElem(this._startElem);
    }

    _removeError = () => {
        this._errorElem.innerText = '';
        this._activateElem(this._startElem);
    }

    _deactivateSettings = () => {
        this._deactivateElem(this._arrayTypeElem);
        this._deactivateElem(this._arrayInputElem);
        this._deactivateElem(this._algSelectElem);
    }

    _activateSettings = () => {
        this._activateElem(this._arrayTypeElem);
        this._activateElem(this._arrayInputElem);
        this._activateElem(this._algSelectElem);
    }

    _deactivateElem = (elem) => {
        elem.disabled = true;
    }

    _activateElem = (elem) => {
        elem.disabled = false;
    }

    _sortRender = (array) => {
        let maxElem = array[0];
        array.forEach((item) => maxElem = item > maxElem ? item : maxElem);
        let elemHeight = this._visualizerElem.offsetHeight / maxElem;
        let elemWidth = this._visualizerElem.offsetWidth / array.length;

        if (elemWidth < 30) {
            this._visualizerElem.classList.add('small');
        } else {
            this._visualizerElem.classList.remove('small');
        }
        this._visualizerElem.innerHTML = array.reduce((acc, item, index) => {
            acc += `<div class="sort__column" data-id="${index}" data-item="${item}" style="height: ${item * elemHeight}px">
                        <div class="column__id">${item}</div>
                    </div>`;
            return acc;
        }, '');
    }

    _render = () => {
        context.algorithmList.forEach(({title, value, selected}) => {
            this._algSelectElem.innerHTML += `
                <option class="select__item" value="${value}" ${selected ? 'selected' : ''}>${title}</option>
            `;
        });

        context.speedList.forEach(({title, value, selected}) => {
            this._speedSelectElem.innerHTML += `
                <option class="select__item" value="${value}" ${selected ? 'selected' : ''}>${title}</option>
            `;
        });
    }

    _addListeners = () => {
        this._arrayTypeElem.addEventListener('change', (event) => {
            if (event.target.value === 'size') {
                this._arrayInputTitleElem.innerText = 'Размер массива:'
            } else {
                this._arrayInputTitleElem.innerText = 'Массив:'
            }
            this._arrayInputElem.dispatchEvent(new Event('input'));
        })

        this._arrayInputElem.addEventListener('input', (event) => {
            if (this._arrayTypeElem.value === 'array') {
                this._validationArray(event.target.value);
            } else {
                this._validationNumber(event.target.value);
            }
        });

        this._startElem.addEventListener('click', () => {
            this._validationEmpty(this._arrayInputElem.value);
            if (!this._startElem.disabled) {
                this._deactivateSettings();
                this._activateElem(this._resetElem);
                this._activateElem(this._pauseElem);
                this._statisticsElem.style.display = 'grid';

                this._startElem.style.display = 'none';
                this._pauseElem.style.display = '';
                this._resumeElem.style.display = 'none';

                this._iterationsElem.innerText = '0';

                this._start();
            }
        });

        let canClick = true;
        const setCanClick = (state = true) => {
            if (state) {
                canClick = true;
                this._activateElem(this._pauseElem);
                this._activateElem(this._resumeElem);
            } else {
                canClick = false;
                this._deactivateElem(this._pauseElem);
                this._deactivateElem(this._resumeElem);
            }
        }

        this._pauseElem.addEventListener('click', () => {
            if (canClick) {
                setCanClick(false);
                this._startElem.style.display = 'none';
                this._pauseElem.style.display = 'none';
                this._resumeElem.style.display = '';
                this._pause();
                setTimeout(setCanClick, 250);
            }
        });

        this._resumeElem.addEventListener('click', () => {
            if (canClick) {
                setCanClick(false);
                this._startElem.style.display = 'none';
                this._pauseElem.style.display = '';
                this._resumeElem.style.display = 'none';
                this._resume();
                setTimeout(setCanClick, 250);
            }
        });

        this._resetElem.addEventListener('click', () => {
            this._activateSettings();
            this._deactivateElem(this._resetElem);
            this._statisticsElem.style.display = 'none';

            this._startElem.style.display = '';
            this._pauseElem.style.display = 'none';
            this._resumeElem.style.display = 'none';
            this._timer.pause();
            this._sort.pause();
        });

        window.addEventListener('resize', () => {
            if (this._array?.length) {
                let elemWidth = this._visualizerElem.offsetWidth / this._array.length;
                elemWidth < 30 ? this._visualizerElem.classList.add('small') : this._visualizerElem.classList.remove('small');
            }
        });

    }
}

export default new Visualizer();
