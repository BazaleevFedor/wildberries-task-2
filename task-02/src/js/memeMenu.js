import {context} from "./context.js";

/**
 * Класс отвечающий за взаимодействие с меню.
 */
export default class MemeMenu {
    constructor(callbacks) {
        this._menuStateContainer = document.getElementById('js-menu-state');
        this._menuManagementContainer = document.getElementById('js-menu-management');

        this._buttons = this._render();
        this._addListeners(callbacks);
        this.blockMenu();
        this._chooseButtonID = null;
    }

    getCurAction = () => {
        return this._chooseButtonID !== null ? context.stateButtons[this._chooseButtonID].action : null;
    }

    /**
     * Блокировка кнопок меню
     */
    unlockMenu = () => {
        [...this._buttons.stateButtons, ...this._buttons.managementButtons].forEach((elem) => elem.classList.remove('item_blocked'));
        this._isBlock = false;
    }

    /**
     * Разблокировка кнопок меню
     */
    blockMenu = () => {
        [...this._buttons.stateButtons, ...this._buttons.managementButtons].forEach((elem) => {
            elem.classList.add('item_blocked');
            elem.classList.remove('state__item_choose');
        });
        this._chooseButtonID = null;
        this._isBlock = true;
    }

    /**
     * Выделение нажатой кнопки.
     * @param id - идентификатор нажатой кнопки
     * @private
     */
    _menuClick = (id) => {
        if (id !== this._chooseButtonID && !this._isBlock) {
            if (this._chooseButtonID !== null) {
                this._buttons.stateButtons[this._chooseButtonID].classList.remove('item_blocked');
                this._buttons.stateButtons[this._chooseButtonID].classList.remove('state__item_choose');
            }
            this._buttons.stateButtons[id].classList.add('item_blocked');
            this._buttons.stateButtons[id].classList.add('state__item_choose');
            this._chooseButtonID = id;
        }
    }

    _addListeners = (callbacks) => {
        this._buttons.stateButtons.forEach((button, index) => {
            button.addEventListener('click', () => this._menuClick(index));
        });

        this._buttons.managementButtons.forEach((button, index) => {
            button.addEventListener('click', callbacks[index]);
        });
    }

    _render = () => {
        context.stateButtons.forEach(({title, src}) => {
            this._menuStateContainer.innerHTML += (`
                <button class="state__item" title="${title}">
                    <img class="item__img" src="${src}" alt="меню">
                </button>
            `);
        });

        context.managementButtons.forEach(({title, src}, index) => {
            this._menuManagementContainer.innerHTML += (`
                <button class="management__item" title="${title}">
                    <img class="item__img" src="${src}" alt="меню">
                </button>
            `);
        });

        return {
            stateButtons: document.querySelectorAll('.state__item'),
            managementButtons: document.querySelectorAll('.management__item'),
        }

    }
}
