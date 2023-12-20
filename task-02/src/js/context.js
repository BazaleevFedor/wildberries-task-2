export const context = {
    title: 'Meme generator',
    stateButtons: [
        {title: 'Перемещение', src: 'assets/img/cursor.png', action: 'move'},
        {title: 'Текст', src: 'assets/img/text.png', action: 'text'},
        /*{title: 'Карандаш', src: 'assets/img/pencil.png', action: 'pencil'},
        {title: 'Кисть', src: 'assets/img/brush.png', action: 'brush'},
        {title: 'Ластик', src: 'assets/img/rubber.png', action: 'rubber'},*/
    ],
    managementButtons: [
        {title: 'Скачать', src: 'assets/img/download.png', action: 'download'},
        {title: 'Отчистить', src: 'assets/img/clear.png', action: 'clear'},
    ],
    fonts: [
        {title: 'Impact', selected: true},
        {title: 'Comic Sans MS'},
        {title: 'Arial'},
        {title: 'Montserrat'},
        {title: 'Papyrus Pixel'},
        {title: 'Block Helvetica'},
    ],
    fontSizes: [
        {title: '6'},
        {title: '8'},
        {title: '12'},
        {title: '15'},
        {title: '19'},
        {title: '22', selected: true},
        {title: '25'},
        {title: '27'},
        {title: '29'},
        {title: '35'},
        {title: '40'},
        {title: '45'},
        {title: '50'},
        {title: '60'},
        {title: '70'},
    ],
    defaultElem: {
        text: 'Ваш мемный текст',
        font: 'Impact',
        size: '22',
        color: '#000000',
        width: 200,
        height: 50,
    }
}