# wildberries task L2

Реализация мини-проект «Визуализация алгоритмов сортировки». 

[Деплой](https://monumental-arithmetic-6bee47.netlify.app/)

## Функционал
Пользователь может:
* Выбирать размер массива или указывать сам массив.
* Выбирать алгоритм сортировки.
* Выбирать скорость.

## Стек технологий
В проекте используется только голый js. css, html для верстки.

## Особенности реализации
Скорость сортировки настраивается задержкой после каждого действия. Во все алгоритмы сортировки передаются колбеки для подсветки элемента, переставления элементов и тд. Для сортировки были взяты обычные алгоритмы в которые были вставленны вызовы колбеков. 

Пауза реализована путем остановки цикла сортировки с сохранением текущих позиций. При возобновлении значения подставляются обратно.
