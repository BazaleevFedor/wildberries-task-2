import {context} from "./context.js";

class InteractiveMap {
    constructor() {
        this._markers = new Map();
        this._curId = 0;

        document.addEventListener('DOMContentLoaded', () => {
            this._mapElem = document.getElementById('js-map');

            this._filterElem = document.getElementById('js-filter-button');
            this._filterTextElem = document.getElementById('js-filter-input');

            this._restartElem = document.getElementById('js-restart');

            this._addMap();

            this._addListeners();

            if (localStorage.hasOwnProperty('markers')) {
                this._localStorageGet();
            }

            this._popupOpen = false;
        });
    }

    _filter = (text) => {
        this._markers.forEach(({marker, settings}) => {
            if (settings.description.includes(text)) {
                this.markersLayer.addLayer(marker);
            } else {
                this.markersLayer.removeLayer(marker);
            }
        });
    }

    _addMap = () => {
        this._map = L.map('js-map').setView(context.startPosition, context.startZoom);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this._map);

        this.markersLayer = L.markerClusterGroup();
        this._map.addLayer(this.markersLayer);
    }

    _addMarker = (latLng, settings) => {
        if (!settings) {
            settings = JSON.parse(JSON.stringify(context.defaultSettings));
            settings.id = this._curId++;
            settings.latLng = latLng;
        }

        const marker = L.marker(settings.latLng, {icon: this._getIcon(settings), draggable: true, settings: settings})
            .on('popupopen', () => this._addMarkerListeners(marker, settings))
            .on('popupclose', () => setTimeout(() => marker.bindPopup(this._getPopup(settings)), 10))
            .on('dragend', (event) => this._changePosition(settings.id, event.target.getLatLng()))
            .bindPopup(latLng ? this._getEditPopup(settings) : this._getPopup(settings));

        this._markers.set(settings.id, {marker: marker, settings: settings});
        this.markersLayer.addLayer(marker);

        marker.openPopup();

        this._localStorageSet();
    }

    _localStorageSet = () => {
        let markers = Array();
        this._markers.forEach((marker) => markers.push(marker.settings));
        localStorage.markers = JSON.stringify(markers);
        localStorage.curId = this._curId;
    }

    _localStorageGet = () => {
        if (localStorage.hasOwnProperty('markers')) {
            const markers = JSON.parse(localStorage.markers);
            markers.forEach((settings) => {
                this._curId ++;
                this._addMarker(null, settings);
            });
        }

        if (localStorage.hasOwnProperty('curId')) {
            this._curId = localStorage.curId;
        }
    }

    _changePosition = (id, newPosition) => {
        const marker = this._markers.get(id);
        marker.settings.latLng = newPosition;
        this._markers.set(id, marker);

        this._localStorageSet();
    }

    _changeTitle = (id, newTitle) => {
        const marker = this._markers.get(id);
        marker.settings.title = newTitle;
        this._markers.set(id, marker);

        this._localStorageSet();
    }

    _changeType = (id, newType) => {
        const marker = this._markers.get(id);
        marker.settings.type = newType;
        this._markers.set(id, marker);
        marker.marker.setIcon(this._getIcon(marker.settings));

        this._localStorageSet();
    }

    _changeDescription = (id, newDescription) => {
        const marker = this._markers.get(id);
        marker.settings.description = newDescription;
        this._markers.set(id, marker);

        this._localStorageSet();
    }

    _changeColor = (id, newColor) => {
        const marker = this._markers.get(id);
        marker.settings.color = newColor;
        this._markers.set(id, marker);
        marker.marker.setIcon(this._getIcon(marker.settings));

        this._localStorageSet();
    }

    _removeMarker = (id) => {
        const marker = this._markers.get(id);
        this.markersLayer.removeLayer(marker.marker);
        this._markers.delete(id);
        this._localStorageSet();
        this._popupOpen = false;
    }

    _getIcon = ({type, color}) => {
        const iconSvg = context.icon[type].replace(context.defaultColor, color);

        return L.divIcon({
            className: 'custom-icon',
            html: iconSvg,
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40],
        });
    }

    _addListeners = () => {
        window.addEventListener('resize', () => {
            if (this._mapElem) {
                this._mapElem.style.width = `${this._mapElem.parentElement.offsetWidth}px`;
                this._mapElem.style.height = `${this._mapElem.parentElement.offsetHeight}px`;
            }
        });

        this._map.on('click', (e) => {
            if (!this._popupOpen) {
                this._addMarker(e.latlng);
            } else {
                this._popupOpen = false;
            }
        });

        this._filterElem.addEventListener('click', () => this._filter(this._filterTextElem.value));

        this._restartElem.addEventListener('click', () => this._filter(''));

        window.dispatchEvent(new Event('resize'));
    }

    _addMarkerListeners(marker, settings) {
        this._popupOpen = true;
        document.getElementById(`js-title-${settings.id}`)?.addEventListener('input', (e) => this._changeTitle(settings.id, e.target.value));
        document.getElementById(`js-type-${settings.id}`)?.addEventListener('change', (e) => this._changeType(settings.id, e.target.value));
        document.getElementById(`js-description-${settings.id}`)?.addEventListener('input', (e) => this._changeDescription(settings.id, e.target.value));
        document.getElementById(`js-color-${settings.id}`)?.addEventListener('change', (e) => this._changeColor(settings.id, e.target.value));
        document.querySelector(`.leaflet-popup-close-button`)?.addEventListener('click', () => this._popupOpen = false);

        document.getElementById(`js-edit-marker-${settings.id}`)?.addEventListener('mouseup', () => {
            marker.bindPopup(this._getEditPopup(settings));
            this._addMarkerListeners(marker, settings);
        });
        document.getElementById(`js-remove-marker-${settings.id}`)?.addEventListener('mouseup', () => this._removeMarker(settings.id));
    }

    _getPopup = ({title, type, description, id}) => {
        return (`
            <div class="info">
                <div class="info__title">${title}</div>
                
                <div class="info__type">Тип: ${type === 'marker' ? 'Место' : type === 'home' ? 'Дом' : 'Работа'}</div>
                
                <div class="info__description">Описание: ${description}</div>
                
                <div>
                    <button class="info__button" id="js-edit-marker-${id}">
                        <img class="img1 button__icon" src="assets/img/edit.svg" alt="edit">
                        <img class="img2 button__icon" src="assets/img/edit_hover.svg" alt="edit">
                    </button>
                    <button class="info__button" id="js-remove-marker-${id}">
                        <img class="img1 button__icon" src="assets/img/trash.svg" alt="trash">
                        <img class="img2 button__icon" src="assets/img/trash_hover.svg" alt="trash">
                    </button>
                </div>
            </div>
        `);
    }

    _getEditPopup = ({title, type, description, id, color}) => {
        return (`
            <div class="info">
                <label class="label__input">
                    <span class="label__text">Название:</span>
                    <input class="info__title-input" value="${title}" id="js-title-${id}">
                </label>
                
                <label class="label__input-inline">
                    <span class="label__text">Тип:</span>
                    <select class="info__type-input" id="js-type-${id}">
                        <option ${type === 'marker' ? 'selected' : ''} value="marker">Место</option>
                        <option ${type === 'home' ? 'selected' : ''} value="home">Дом</option>
                        <option ${type === 'work' ? 'selected' : ''} value="work">Работа</option>
                    </select>
                </label>
                
                <label class="label__input">
                    <span class="label__text">Описание:</span>
                    <textarea class="info__description-input" id="js-description-${id}">${description}</textarea>
                </label>
                
                <label>
                    <span class="label__text">Цвет маркера:</span>
                    <input type="color" value="${color}" id="js-color-${id}">
                </label>
            </div>
        `);
    }
}

export default new InteractiveMap();
