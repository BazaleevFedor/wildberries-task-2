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
            this._state = 'settings';

            this._addListeners();
        });
    }

    _start = () => {
        this._addResult('');
        this._curGame = {
            field: new Array(9).fill(-1),
            users: [{name: null, elem: ''}, {name: null, elem: ''}],
            curUser: Math.round(Math.random()),
            gameWithBot: this._chooseOpponentElem.checked,
        }

        const tmp = Math.round(Math.random());
        this._curGame.users[tmp].elem = 'cross';
        this._curGame.users[Number(!tmp)].elem = 'circle';

        if (!this._curGame.gameWithBot) {
            const first = this._firstPlayerNameElem.value;
            const second = this._secondPlayerNameElem.value;
            this._curGame.users[0].name = first ? first : 'первый игрок';
            this._curGame.users[1].name = second ? second : 'второй игрок';
        }

        if (!this._curGame.gameWithBot) {
            this._addMoveInfo(`Ходит ${this._curGame.users[this._curGame.curUser].name} (${this._curGame.users[this._curGame.curUser].elem === 'circle' ? 'нолики' : 'крестики'})`);
        } else {
            if (this._curGame.curUser) {
                // ToDo: ход компьютера
                this._pcMove(this._curGame.field)
            }
            this._addMoveInfo(`Ваш ход (${this._curGame.users[this._curGame.curUser].elem === 'circle' ? 'нолики' : 'крестики'})`);
        }
    }

    _move = (id) => {
        this._addElemToCell(id, this._curGame.users[this._curGame.curUser].elem);
        this._curGame.field[id] = this._curGame.curUser;

        const {winId, position} = this._isWin(this._curGame.field);

        if (winId !== -1) {
            this._end(winId, position);
        } else {
            this._curGame.curUser = Number(!this._curGame.curUser);

            if (!this._curGame.gameWithBot) {
                this._addMoveInfo(`Ходит ${this._curGame.users[this._curGame.curUser].name} (${this._curGame.users[this._curGame.curUser].elem === 'circle' ? 'нолики' : 'крестики'})`);
            } else {
                if (this._curGame.curUser) {
                    // ToDo: ход компьютера
                    this._pcMove(this._curGame.field)
                } else {
                    this._addMoveInfo(`Ваш ход (${this._curGame.users[this._curGame.curUser].elem === 'circle' ? 'нолики' : 'крестики'})`);
                }
            }
        }
    }

    _end = (winId, position) => {
        this._addMoveInfo('');
        this._state = 'game-end';

        if (winId === -2) {
            this._addResult(`Ничья!`);
        } else {
            this._addWinLine(position);
            const winner = this._curGame.users[winId].name;
            if (winner) {
                this._addResult(`Победил ${winner}!`);
            } else {
                if (winId) {
                    this._addResult(`Вы проиграли(`);
                } else {
                    this._addResult(`Вы победили!`);
                }
            }
        }

        this._curGame.curUser = null;
    }

    _isWin = (arr) => {
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

        let fieldIsFull = true;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === -1) {
                fieldIsFull = false;
                break;
            }
        }


        for (let {a, b, c, position} of winCombinations) {
            if (arr[a] !== -1 && arr[a] === arr[b] && arr[b] === arr[c]) {
                return {winId: arr[a], position: position};
            }
        }

        if (fieldIsFull) return {winId: -2}
        return {winId: -1};
    }

    _pcMove = (array) => {
        if (this._difficultyLevelElem.value === 'easy') {
            let freeField = array.reduce((acc, item, index) => {
                if (item === -1) acc.push(index);
                return acc;
            }, []);
            const id = Math.floor(Math.random() * (freeField.length));
            this._move(freeField[id]);
        } else {
            let freeField = array.reduce((acc, item, index) => {
                if (item === -1) acc.push(index);
                return acc;
            }, []);
            console.log(this._findBestMove([...array], 1));
            const id = this._findBestMove([...array], 1).id;
            console.log(id);

            this._move(id);
        }
    }

    _findBestMove = (board, player) => {
        let { winId } = this._isWin(board);

        if (winId === -2) {
            return { score: 0 };
        } else if (winId === 0) {
            return { score: -1 };
        } else if (winId === 1) {
            return { score: 1 };
        } else {
            let best;
            if (player === 1) {
                best = { score: -Infinity, id: -1 };
            } else if (player === 0) {
                best = { score: Infinity, id: -1 };
            }

            for (let i = 0; i < board.length; i++) {
                if (board[i] === -1) {
                    let tmp = [...board];
                    tmp[i] = player;

                    const { score } = this._findBestMove(tmp, 1 - player);

                    if (player === 1 && score > best.score) {
                        best = { score, id: i };
                    } else if (player === 0 && score < best.score) {
                        best = { score, id: i };
                    }
                }
            }

            return best;
        }
    };

    _addElemToCell = (id, elem) => {
        console.log(id, elem)
        this._gameCellElems[id].innerHTML = `<div class="${elem}-line ${elem}-line-1"></div><div class="${elem}-line ${elem}-line-2"></div>`;
    }

    _addWinLine = ({rotate, left, top}) => {
        this._gameLineElems.style.transform = `rotate(${rotate}deg)`;
        this._gameLineElems.style.left = `${left}%`;
        this._gameLineElems.style.top = `${top}%`;
        this._gameLineElems.style.display = '';
    }

    _removeWinLine = () => {
        this._gameLineElems.style.display = 'none';
    }

    _clearField = () => {
        this._gameCellElems.forEach((item) => item.innerHTML = '');
    }

    _addMoveInfo = (text) => {
        this._moveInfoElem.innerText = text;
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
        });

        this._startElem.addEventListener('mouseup', () => {
            if (this._state === 'settings') {
                this._deactivateSettings();
                this._start();
                this._state = 'game';
            }
        })

        this._gameCellElems.forEach((elem) => {
            elem.addEventListener('mouseup', () => {
                if (this._state === 'game' && !elem.innerHTML) {
                    this._move(Number(elem.id.replace('js-', '')));
                }
            });
        });

        this._restartElem.addEventListener('click', () => {
            this._activateSettings();
            this._clearField();
            this._addResult('');
            this._addMoveInfo('');
            this._removeWinLine();
            this._state = 'settings';
        });
    }
}

export default new Game();
