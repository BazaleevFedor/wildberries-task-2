class Sort {
    constructor() {
    }

    bubble = (array, selectElem, swapElem, iterationInc, stopSort) => {
        let pause = null;

        const iteration = async () => {
            for (let i = 0; i < array.length - 1; i++) {
                for (let j = 0; j < array.length - 1 - i; j++) {
                    if (pause) {
                        if (pause.status) {
                            pause.i = i;
                            pause.j = j;
                            return;
                        } else {
                            i = pause.i;
                            j = pause.j;
                            pause = null;
                        }
                    }

                    iterationInc();
                    await selectElem(j, j + 1, true);
                    if (array[j] > array[j + 1]) {
                        const temp = array[j];
                        array[j] = array[j + 1];
                        array[j + 1] = temp;
                        await swapElem(j, j + 1);
                    }
                    await selectElem(j, j + 1, false);
                }
            }

            stopSort();
        }

        iteration();
        return {
            pause: () => {pause = {status: true, i: 0, j: 0}},
            begin: () => {pause.status = false; iteration()},
        }
    }

    comb = (array, selectElem, swapElem, iterationInc, stopSort) => {
        let pause = null;

        const iteration = async () => {
            const factor = 1.247; // Фактор уменьшения
            let gap = Math.floor(array.length / factor);

            while (gap >= 1) {
                for (let i = 0; i + gap < array.length; i++) {
                    iterationInc();

                    if (pause) {
                        if (pause.status) {
                            pause.i = i;
                            pause.gap = gap;
                            return;
                        } else {
                            i = pause.i;
                            gap = pause.gap;
                            pause = null;
                        }
                    }

                    await selectElem(i, i + gap);
                    if (array[i] > array[i + gap]) {
                        const temp = array[i];
                        array[i] = array[i + gap];
                        array[i + gap] = temp;
                        await swapElem(i, i + gap);
                    }
                    await selectElem(i, i + gap, true);
                }
                gap = Math.floor(gap / factor);
            }

            stopSort();
        }

        iteration();
        return {
            pause: () => {pause = {status: true, i: 0}},
            begin: () => {pause.status = false; iteration()},
        }
    }

    insertion = (array, selectElem, swapElem, iterationInc, stopSort) => {
        let pause = null;

        const iteration = async () => {
            for (let i = 1; i < array.length; i++) {
                let j = i - 1;
                let key = array[i];
                if (pause) {
                    console.log(pause);
                    if (!pause.status) {
                        key = pause.key;
                        j = pause.j;
                        pause = null;
                    }
                }

                while (j >= 0 && array[j] > key) {
                    if (pause) {
                        console.log(pause);
                        if (pause.status) {
                            pause.key = key;
                            pause.j = j;
                            return;
                        }
                        alert('err')
                    }
                    await selectElem(j, j + 1, true);
                    array[j + 1] = array[j];
                    iterationInc();
                    await swapElem(j, j + 1);
                    await selectElem(j, j + 1, false);
                    j--;
                }

                array[j + 1] = key;
            }

            stopSort();
        }

        iteration();
        return {
            pause: () => {pause = {status: true, key: 0, j: 0}},
            begin: () => {pause.status = false; iteration()},
        }
    }

    selection = (array, selectElem, swapElem, iterationInc, stopSort) => {
        let pause = null;

        const iteration = async () => {
            for (let i = 0; i < array.length - 1; i++) {
                await selectElem(i, null, false);
                let minIndex = i;
                for (let j = i + 1; j < array.length; j++) {
                    if (pause) {
                        if (pause.status) {
                            pause.i = i;
                            pause.minIndex = minIndex;
                            pause.j = j;
                            return;
                        } else {
                            await selectElem(i, null, false);
                            i = pause.i;
                            minIndex = pause.minIndex;
                            j = pause.j;
                            pause = null;
                        }
                    }
                    await selectElem(j, null, true);
                    iterationInc();
                    if (array[j] < array[minIndex]) {
                        minIndex = j;
                    }
                    await selectElem(j, null, false);
                }

                if (minIndex !== i) {
                    await selectElem(minIndex, null, false);
                    const temp = array[i];
                    array[i] = array[minIndex];
                    array[minIndex] = temp;
                    await swapElem(i, minIndex);
                    await selectElem(minIndex, null, false);

                }

                await selectElem(i, null, false);
            }

            stopSort();
        }

        iteration();
        return {
            pause: () => {pause = {status: true, i: 0, minIndex:0, j: 0}},
            begin: () => {pause.status = false; iteration()},
        }
    }

    quick = (array, selectElem, swapElem, iterationInc, stopSort) => {
        let pause = null;

        const partition = async (left, right) => {
            await selectElem(right, null, true);
            let pivot = array[right];
            let i = left - 1;

            for (let j = left; j < right; j++) {
                if (pause) {
                    if (pause.status) {
                        pause.i = i;
                        pause.j = j;
                        pause.left = left;
                        pause.right = right;
                        await selectElem(j, null, false);
                        return -1;
                    } else {
                        i = pause.i;
                        j = pause.j;
                        pivot = array[right];
                        pause = null;
                        await selectElem(j, null, false);
                    }
                }

                await selectElem(j, null, true);
                if (array[j] <= pivot) {
                    i++;
                    await swap(i, j);
                }
                await selectElem(j, null, false)
            }

            await swap(i + 1, right);
            await selectElem(right, null, false);
            return i + 1;
        }

        const swap = async (i, j) => {
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            await swapElem(i, j, false);
        }

        const iteration = async () => {
            let stack = [{ left: 0, right: array.length - 1 }];
            let left, right;

            while (stack.length) {
                if (pause) {
                    if (pause.status) {
                        pause.stack = [...stack];
                        return;
                    } else {
                        if (!pause.left && pause.left !== 0) {
                            stack = [...pause.stack];
                            let tmp = stack.pop();
                            left = tmp.left;
                            right = tmp.right;
                            pause = null;
                        } else {
                            stack = [...pause.stack];
                            left = pause.left;
                            right = pause.right;
                        }
                    }
                } else {
                    let tmp = stack.pop();
                    left = tmp.left;
                    right = tmp.right;
                }

                if (left < right) {
                    const pivotIndex = await partition(left, right);

                    if (pivotIndex === -1) {
                        pause.stack = [...stack];
                        return;
                    }

                    stack.push({ left, right: pivotIndex - 1 });
                    stack.push({ left: pivotIndex + 1, right });
                }
            }

            stopSort();
        }

        iteration();
        return {
            pause: () => {pause = {status: true}},
            begin: () => {pause.status = false; iteration()},
        }
    }
}

export default new Sort();
