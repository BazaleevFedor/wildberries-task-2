class Game {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this._boundMinElem = document.getElementById('js-bound-min');
            this._boundMaxElem = document.getElementById('js-bound-max');

            this._inputElem = document.getElementById('js-input');

            this._hintOnElem = document.getElementById('js-hint-on');
            this._hintOffElem = document.getElementById('js-hint-off');
            this._hintTextElem = document.getElementById('js-hint-text');

            this._moveResultElem = document.getElementById('js-move-result');
            this._errorElem = document.getElementById('js-error');
            this._startElem = document.getElementById('js-start-game');
            this._sendElem = document.getElementById('js-send-num');

            this._counterElem = document.getElementById('js-counter');
            this._counterTitleElem = document.getElementById('js-counter-title');

            this._restartElem = document.getElementById('js-restart');

            this._addListeners();
        });
    }

    _start = () => {
        const min = Number(this._boundMinElem.value);
        const max = Number(this._boundMaxElem.value);
        this._number = this._getNumber(min, max);
        this._count = 0;

        this._addCounter(this._count);
    }

    /**
     * Обработка хода игрока
     * @private
     */
    _move = () => {
        this._addCounter(++this._count);
        if (this._number === Number(this._inputElem.value)) {
            this._win()
        } else {
            if (this._count === 3) {
                this._addHint(`Загаданное число является ${this._number % 2 === 0 ? 'четным' : 'нечетным'}`);
            }
            this._addMoveResult(`Загаданное число ${this._number > Number(this._inputElem.value) ? 'больше' : 'меньше'} вашего`);
        }
    }

    /**
     * Обработка победы
     * @private
     */
    _win = () => {
        this._addMoveResult('Угадал!');
        this._deactivateInput(this._inputElem);
        this._sendElem.classList.add('error');
    }

    /**
     * Загадывание рандомного числа в интервале
     * @param min
     * @param max
     * @return {*}
     * @private
     */
    _getNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Валидация игровых границ на корректность и последовательность расположения нижней и верхней.
     * @param minElem
     * @param maxElem
     * @private
     */
    _boundValidation = (minElem, maxElem) => {
        if (minElem.value) {
            if (!/^[-\d]+$/.test(minElem.value)) {
                this._addError(minElem, 'Граница интервала может быть только целым числом.');
            } else if (!Number(minElem.value) && Number(minElem.value) !== 0) {
                this._addError(minElem, 'Указано неверное значение интервала.');
            } else if (Number(minElem.value) >= Number(maxElem.value)) {
                this._addError(minElem, 'Верхняя граница должна быть больше нижней.');
            } else {
                this._removeError(minElem);
            }
        }

        if (maxElem.value) {
            if (!/^[-\d]+$/.test(maxElem.value)) {
                this._addError(maxElem, 'Граница интервала может быть только целым числом.');
            } else if (!Number(maxElem.value) && Number(maxElem.value) !== 0) {
                this._addError(maxElem, 'Указано неверное значение интервала.');
            } else if (Number(minElem.value) >= Number(maxElem.value)) {
                this._addError(maxElem, 'Верхняя граница должна быть больше нижней.');
            } else {
                this._removeError(maxElem);
            }
        }
    }

    /**
     * Проверка элемента на пустоту.
     * @param elem
     * @private
     */
    _emptyValidation = (elem) => {
        if (!elem.value) {
            this._addError(elem, 'Нужно заполнить поле.');
        }
    }

    /**
     * Валидация вводимого числа на корректность и нахождение в диапазоне.
     * @param number
     * @param min
     * @param max
     * @private
     */
    _numberValidation = (number, min, max) => {
        if (!number.value) return;
        if (!/^[-\d]+$/.test(number.value)) {
            this._addError(number, 'Я загадал целое число.');
        } else if (!Number(number.value) && Number(number.value) !== 0) {
            this._addError(number, 'Указано неверное значение.');
        } else if (!(Number(number.value) >= Number(min)) || !(Number(number.value) <= Number(max))) {
            this._addError(number, `Число должно быть в интервале [${min}, ${max}].`);
        } else {
            this._removeError(number);
        }
    }

    /**
     * Функция, изменяющая окончание слов в зависимости от падежа.
     * @param count - количество
     * @param first - первая форма слова
     * @param second - вторая форма слова
     * @param third - третья форма слова
     * @return {string} - итоговая строка со словом в нужной форме.
     */
    _choosingWordsEnding = (count, {first, second, third}) => {
        let result = '';
        if (count % 10 === 1 && count % 100 !== 11) {  // если число заканчивается на 1, но не заканчивается на 11, выбираем первую форму
            result += first;
        } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {  // если последняя цифра [2, 4] но последние две не в (10, 20], вторую форму
            result += second;
        } else {  // в остальных случаях выбираем третью форму
            result += third;
        }
        return result;  // возвращаем строку
    }

    _addSendButton = () => {
        this._sendElem.style.display = ''
        this._startElem.style.display = 'none'
    }

    _removeSendButton = () => {
        this._startElem.style.display = ''
        this._sendElem.style.display = 'none'
        this._sendElem.classList.remove('error');
    }

    _deactivateInput = (elem) => {
        elem.disabled = true;
    }

    _activateInput = (elem) => {
        elem.disabled = false;
    }

    _addError = (elem, message) => {
        elem.classList.add('error');
        this._startElem.classList.add('error');
        this._sendElem.classList.add('error');
        this._errorElem.style.display = '';
        this._moveResultElem.style.display = 'none';
        this._errorElem.setAttribute('data-id', elem.id);
        this._errorElem.innerText = message;
    }

    _removeError = (elem, all = null) => {
        elem.classList.remove('error');
        if (this._errorElem.getAttribute('data-id') === elem.id || all) {
            this._startElem.classList.remove('error');
            this._sendElem.classList.remove('error');
            this._errorElem.style.display = 'none';
            this._moveResultElem.style.display = '';
            this._errorElem.classList.remove('error');
            this._errorElem.innerText = '';
        }
    }

    _addHint = (hint) => {
        this._hintTextElem.innerText = hint;
        this._hintOnElem.style.display = '';
        this._hintOffElem.style.display = 'none';
    }

    _removeHint = () => {
        this._hintTextElem.innerText = '';
        this._hintOnElem.style.display = 'none';
        this._hintOffElem.style.display = '';
    }

    _addMoveResult = (message) => {
        this._moveResultElem.innerText = message;
        this._moveResultElem.style.display = ''
    }

    _removeMoveResult = () => {
        this._moveResultElem.innerText = '';
        this._moveResultElem.style.display = 'none'
    }

    _addCounter = (count) => {
        this._counterElem.innerText = count;
        this._counterTitleElem.innerText = this._choosingWordsEnding(count, {first: 'ход', second: 'хода', third: 'ходов'});
    }

    _removeCounter = () => {
        this._counterElem.innerText = '';
        this._counterTitleElem.innerText = '';
    }

    _addListeners = () => {
        this._boundMinElem.addEventListener('change', () => {
            this._boundValidation(this._boundMinElem, this._boundMaxElem);
        });

        this._boundMaxElem.addEventListener('change', () => {
            this._boundValidation(this._boundMinElem, this._boundMaxElem);
        });

        this._inputElem.addEventListener('input', () => {
            this._numberValidation(this._inputElem, this._boundMinElem.value, this._boundMaxElem.value);
        });

        this._startElem.addEventListener('click', () => {
            this._emptyValidation(this._boundMinElem);
            this._emptyValidation(this._boundMaxElem);
            if (!this._startElem.classList.contains('error')) {
                this._activateInput(this._inputElem);
                this._deactivateInput(this._boundMinElem);
                this._deactivateInput(this._boundMaxElem);
                this._addSendButton();

                this._start();
            }
        });

        this._sendElem.addEventListener('click', () => {
            this._emptyValidation(this._inputElem);
            if (!this._sendElem.classList.contains('error')) {
                this._move();
            }
        });

        this._restartElem.addEventListener('click', () => {
            this._activateInput(this._boundMinElem);
            this._activateInput(this._boundMaxElem);
            this._deactivateInput(this._inputElem);
            this._removeSendButton();
            this._removeCounter();
            this._removeHint();
            this._removeMoveResult();
            this._removeError(this._inputElem, true);
            this._boundValidation(this._boundMinElem, this._boundMaxElem);
            this._inputElem.value = '';
        });
    }
}

/**
 * Функция-обертка, которая откладывает вызовы func, пока не пройдёт delay миллисекунд бездействия (без вызовов)
 * @param func - вызываемая функция
 * @param delay - промежуток бездействия, после которого вызывается функция
 * @return {(function(...[*]): void)|*} - функция, которую можно вызывать
 */
const debounce = (func, delay) => {
    let timeoutId;  // переменная, хранящая информацию о таймере

    return (...args) => {  // возвращаем функцию
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(args), delay);  // если функция вызвана повторно до завершения таймера, таймер обнуляется
        // вызов откладывается на delay
    }
}

export default new Game();
