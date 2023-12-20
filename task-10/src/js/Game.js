class Game {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this._chooseOpponentElem = document.getElementById('js-opponent');
            this._chooseOpponentTextElem = document.getElementById('js-opponent-title');

            this._firstPlayerNameElem = document.getElementById('js-first-player-name');
            this._secondPlayerNameElem = document.getElementById('js-second-player-name');

            this._difficultyLevelElem = document.getElementById('js-difficulty');

            this._startElem = document.getElementById('js-start-button');

            this._gameCellElems = Array.from({ length: 9 }).map((item, index) => document.getElementById(`js-${index}`));
            this._gameLineElems = document.getElementById('js-line-end-game');

            this._moveInfoElem = document.getElementById('js-move-info');

            this._resultElem = document.getElementById('js-game-result');

            this._restartElem = document.getElementById('js-restart');

            this._curGame = null;

            this._addListeners();

            this._localStorageGet();
        });
    }

    _start = () => {
        this._curGame = {
            field: new Array(9).fill(-1),
            users: [{name: null, elem: ''}, {name: null, elem: ''}],
            curUser: Math.round(Math.random()),
            gameWithBot: this._chooseOpponentElem.checked,
        }

        const tmp = Math.round(Math.random());
        this._curGame.users[tmp].elem = 'cross';
        this._curGame.users[1 - tmp].elem = 'circle';

        if (this._curGame.gameWithBot) {
            if (this._curGame.curUser) {
                this._computerRunning(this._curGame.field, this._difficultyLevelElem.value)
                return;
            }
        } else {
            const first = this._firstPlayerNameElem.value;
            const second = this._secondPlayerNameElem.value;
            this._curGame.users[0].name = first ? first : 'первый игрок';
            this._curGame.users[1].name = second ? second : 'второй игрок';
        }

        this._addMoveInfo();
    }

    _move = (id) => {
        const curUser = this._curGame.users[this._curGame.curUser];

        this._addElemToCell(id, curUser.elem);
        this._curGame.field[id] = this._curGame.curUser;

        const isWin = this._isWin(this._curGame.field);

        if (isWin.status !== 'not-end') {
            this._end(isWin);
        } else {
            this._curGame.curUser = 1 - this._curGame.curUser;

            if (this._curGame.gameWithBot && this._curGame.curUser) {
                // ход компьютера с небольшой задержкой
                setTimeout(() => this._computerRunning(this._curGame.field, this._difficultyLevelElem.value), 300);
                return;
            }
            this._addMoveInfo();
        }
    }

    _end = ({status, winnerId, position}) => {
        if (status === 'draw') {
            this._addResult(`Ничья!`);
        } else {
            this._addWinLine(position);
            if (this._curGame.gameWithBot) {
                this._addResult(`Вы ${winnerId ? 'проиграли(' : 'выиграли!'}`);
            } else {
                this._addResult(`Победил ${this._curGame.users[winnerId].name}!`);
            }
        }

        this._curGame = null;
    }

    /**
     * Определение завершения игры
     * @param arr
     * @return {{status: string}}
     * @private
     */
    _isWin = (arr) => {
        let res = { status: 'draw' };

        let winCombinations = [
            {a: 0, b: 4, c: 8, position: {rotate: 45, left: 0, top: 50}},
            {a: 2, b: 4, c: 6, position: {rotate: -45, left: 0, top: 50}},

            {a: 0, b: 3, c: 6, position: {rotate: 90, left: -35, top: 50}},
            {a: 1, b: 4, c: 7, position: {rotate: 90, left: 0, top: 50}},
            {a: 2, b: 5, c: 8, position: {rotate: 90, left: 35, top: 50}},

            {a: 0, b: 1, c: 2, position: {rotate: 0, left: 0, top: 15}},
            {a: 3, b: 4, c: 5, position: {rotate: 0, left: 0, top: 50}},
            {a: 6, b: 7, c: 8, position: {rotate: 0, left: 0, top: 83}},
        ];

        for (let i of arr) {
            if (i === -1) {
                res.status = 'not-end';
                break;
            }
        }

        for (let {a, b, c, position} of winCombinations) {
            if (arr[a] !== -1 && arr[a] === arr[b] && arr[b] === arr[c]) {
                res = { status: 'win', winnerId: arr[a], position: position }
                break;
            }
        }

        return res;
    }

    /**
     * Вычисление хода компьютера
     * @param array
     * @param difficulty
     * @private
     */
    _computerRunning = (array, difficulty) => {
        if (difficulty === 'easy') {
            let freeField = array.reduce((acc, item, index) => {
                if (item === -1) acc.push(index);
                return acc;
            }, []);

            const id = Math.floor(Math.random() * (freeField.length));
            this._move(freeField[id]);
        } else {
            this._move(this._findMoveMiniMax([...array], 1).id);
        }
    }

    /**
     * Алгоритм поиска оптимального хода - Минимакс
     * @param board
     * @param player
     * @return {{score: number}|{score: number, id: number}|{score: number, id: number}}
     * @private
     */
    _findMoveMiniMax = (board, player) => {
        let { status, winnerId } = this._isWin(board);

        if (status === 'draw') {
            return { score: 0 };
        } else if (status === 'win') {
            if (winnerId) {
                return { score: 1 };
            } else {
                return { score: -1 };
            }
        } else {
            let best = player ? { score: -Infinity, id: -1 } : { score: Infinity, id: -1 };

            for (let i = 0; i < board.length; i++) {
                if (board[i] === -1) {
                    let tmp = [...board];
                    tmp[i] = player;
                    const { score } = this._findMoveMiniMax(tmp, 1 - player);

                    if (player && score > best.score) {
                        best = { score, id: i };
                    } else if (!player && score < best.score) {
                        best = { score, id: i };
                    }
                }
            }

            return best;
        }
    };

    /**
     * Сохранение состояния в localStorage
     * @private
     */
    _localStorageSet = () => {
        localStorage.setItem('curGame', JSON.stringify(this._curGame));

        let settings = {
            opponents: this._chooseOpponentElem.checked,
            user1: this._firstPlayerNameElem.value,
            user2: this._secondPlayerNameElem.value,
            level: this._difficultyLevelElem.value,
            isActivate: Boolean(!this._curGame),
        };
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    /**
     * Выгрузка состояния из localStorage
     * @private
     */
    _localStorageGet = () => {
        if (localStorage.hasOwnProperty('curGame')) {
            this._curGame = JSON.parse(localStorage.getItem('curGame'));
            if (this._curGame) {
                this._addMoveInfo();
                this._curGame.field.forEach((userId, index) => {
                    if (userId !== -1) {
                        this._addElemToCell(index, this._curGame.users[userId].elem);
                    }
                });
            }
        }

        if (localStorage.hasOwnProperty('settings')) {
            const {opponents, user1, user2, level, isActivate} = JSON.parse(localStorage.getItem('settings'));
            this._chooseOpponentElem.checked = opponents;
            this._firstPlayerNameElem.value = user1;
            this._secondPlayerNameElem.value = user2;
            this._difficultyLevelElem.value = level;
            if (!isActivate) this._deactivateSettings();
            this._chooseOpponentElem.dispatchEvent(new Event('change'));
        }
    }

    _addElemToCell = (id, elem) => {
        this._gameCellElems[id].innerHTML = `<div class="${elem}-line ${elem}-line-1"></div><div class="${elem}-line ${elem}-line-2"></div>`;
    }

    _addWinLine = ({rotate, left, top}) => {
        this._gameLineElems.style.transform = `rotate(${rotate}deg)`;
        this._gameLineElems.style.left = `${left}%`;
        this._gameLineElems.style.top = `${top}%`;
        this._gameLineElems.style.display = '';
    }

    _clearField = () => {
        this._addResult('');
        this._removeMoveInfo();
        this._gameCellElems.forEach((item) => item.innerHTML = '');
        this._gameLineElems.style.display = 'none';
    }

    _addMoveInfo = () => {
        let curUser = this._curGame.users[this._curGame.curUser];

        if (this._curGame.gameWithBot) {
            if (this._curGame.curUser === 0) {
                this._moveInfoElem.innerText = `Ваш ход (${curUser.elem === 'circle' ? 'нолики' : 'крестики'})`;
            }
        } else {
            this._moveInfoElem.innerText = `Ходит ${curUser.name} (${curUser.elem === 'circle' ? 'нолики' : 'крестики'})`;
        }
    }

    _removeMoveInfo = () => {
        this._moveInfoElem.innerText = '';
    }

    _addResult = (text) => {
        this._resultElem.innerText = text;
    }

    _deactivateSettings = () => {
        document.querySelectorAll('.js-disabled').forEach((elem) => elem.disabled = true);
    }

    _activateSettings = () => {
        document.querySelectorAll('.js-disabled').forEach((elem) => elem.disabled = false);
    }

    _addListeners = () => {
        this._chooseOpponentElem.addEventListener('change', () => {
            if (this._chooseOpponentElem.checked) {
                this._chooseOpponentTextElem.innerText = 'Играть с компьютером';
                document.querySelector('.game__settings').classList.add('one-player');
                document.querySelector('.game__settings').classList.remove('two-player');
            } else {
                this._chooseOpponentTextElem.innerText = 'Играть вдвоем';
                document.querySelector('.game__settings').classList.remove('one-player');
                document.querySelector('.game__settings').classList.add('two-player');
            }
            this._localStorageSet();
        });

        this._difficultyLevelElem.addEventListener('change', () => {
            this._localStorageSet();
        });

        this._startElem.addEventListener('mouseup', () => {
            if (this._curGame === null) {
                this._deactivateSettings();
                this._start();
                this._localStorageSet();
            }
        })

        this._gameCellElems.forEach((elem, index) => {
            elem.addEventListener('mouseup', () => {
                if (this._curGame && !elem.innerHTML) {
                    this._move(index);
                    this._localStorageSet();
                }
            });
        });

        this._restartElem.addEventListener('mouseup', () => {
            this._activateSettings();
            this._clearField();
            this._curGame = null;
            this._localStorageSet();
        });
    }
}

export default new Game();
