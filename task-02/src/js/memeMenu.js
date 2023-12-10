import {context} from "./context.js";

class MemeMenu {
    constructor() {
        this._render();
        this._menuButtons = Array.from(document.querySelectorAll('.state__item'));
        this._chooseButtonID = null;
    }

    getCurAction = () => {
        return this._chooseButtonID ? context.menuButtons[this._chooseButtonID].action : null;
    }

    unlockMenu = () => {
        this._menuButtons.forEach((button) => {
            button.classList.remove('state__item_blocked');
            button.classList.add('state__item_unlocked');
        });
        this._addListeners();
    }

    _menuClick = (id) => {
        if (id !== this._chooseButtonID) {
            if (this._chooseButtonID !== null) {
                this._menuButtons[this._chooseButtonID].classList.remove('state__item_blocked');
                this._menuButtons[this._chooseButtonID].classList.add('state__item_unlocked');
                this._menuButtons[this._chooseButtonID].classList.remove('state__item_choose');
            }
            this._menuButtons[id].classList.remove('state__item_unlocked');
            this._menuButtons[id].classList.add('state__item_blocked');
            this._menuButtons[id].classList.add('state__item_choose');
            this._chooseButtonID = id;
        }
    }

    _addListeners = () => {
        this._menuButtons.forEach((button, index) => {
            button.addEventListener('click', () => this._menuClick(index));
        });
    }

    _render = () => {
        const memeMenuElem = document.querySelector('.menu__state');
        context.menuButtons.forEach(({title, src}) => {
            memeMenuElem.innerHTML += `
                <button class="state__item state__item_blocked" title="${title}">
                    <img class="item__img" src="${src}" alt="меню">
                </button>
            `;
        });
    }
}

export default new MemeMenu();
