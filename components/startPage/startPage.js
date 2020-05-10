'use strict';
import { container, createLinkElement, server } from "../../globals.js";
export default class StartPage {
    constructor(switchPage, setGameState, getGameState) {
        this.switchPage = switchPage;
        this.setGameState = setGameState;
        this.getGameState = getGameState;
        container.appendChild(createLinkElement("./components/startPage/startPage.css"));

        this.state = {
            recordsOnline: [],
            querySelector: {}
        };

        // function binding
        this.serverSwitchChanged = this.serverSwitchChanged.bind(this);
        this.playGame = this.playGame.bind(this);
        this.updateUsernameField = this.updateUsernameField.bind(this);

        // page build up
        this.render();
        this.mountEventListener();
    }

    mountEventListener() {
        const { serverSwitch, playGameButton, usernameField } = this.state.querySelector;
        serverSwitch.addEventListener("change", this.serverSwitchChanged);
        playGameButton.addEventListener("click", this.playGame);
        usernameField.addEventListener("change", this.updateUsernameField)
    }

    setRelevantQuerySelectorConstants() {
        this.state.querySelector = {
            usernameField: document.getElementById("username-field"),
            serverSwitch: document.getElementById("server-switch"),
            playGameButton: document.getElementById("play-game-button"),
            usernameError: document.getElementById("username-error")
        };
    }

    playGame() {
        const username = this.state.querySelector.usernameField;
        const validity = username.checkValidity();
        if (validity) {
            let gameState = this.getGameState();
            this.setGameState({
                username: username.value,
                serverSide: gameState.serverSide,
                records: gameState.records
            });
            this.switchPage();
        } else {
            this.updateUsernameField();
        }
    }

    updateUsernameField() {
        const { usernameField, usernameError } = this.state.querySelector;
        const validity = usernameField.checkValidity();
        console.log(validity);
        if (validity) {
            usernameField.classList.remove("not-filled");
            usernameError.classList.remove("error-shown");
        } else {
            usernameField.classList.add("not-filled");
            usernameError.classList.add("error-shown");
        }
    }

    serverSwitchChanged(e) {
        let gameState = this.getGameState();
        let serverSide = e.target.checked;
        this.setGameState({
            serverSide: serverSide,
            username: gameState.username,
            records: gameState.records
        });

        if (serverSide) {
            this.loadOnlineRanking();
        } else {
            this.updateRankingTable(false);
        }
    }

    loadOnlineRanking() {
        this.updateRankingTable(true);

        fetch(server + "/ranking")
            .then(res => res.json())
            .then(json => {
                this.state.recordsOnline = Object.values(json);
                this.updateRankingTable(false);
            })
            .catch(() => {
                this.updateRankingTable(false);
            });
    }

    sortAndRankRecords(records) {
        let counter = 1;
        return records.sort((x, y) => y.win - x.win).map(x => {
            x.rank = counter++;
            return x;
        });
    }

    updateRankingTable(loading = false) {
        let { recordsOnline } = this.state;
        let records = this.getGameState().records;

        let rankingContainer = document.getElementById("ranking-container");

        if (loading) {
            rankingContainer.innerHTML = "Loading...";
        } else {
            rankingContainer.innerHTML = this.renderRankingTable(this.getGameState().serverSide ? recordsOnline : records);
        }
    }

    renderRankingTable(records) {

        records = this.sortAndRankRecords(records);

        let template = Handlebars.compile("" +
            "<h1>Rangliste</h1>" +
            "<table id='ranking-table'>" +
            "{{#each records}}" +
            "" +
            "   <tr>" +
            "       <td><h2>{{this.rank}}. Platz: {{this.user}}</h2>Siege: {{this.win}}</td>" +
            "   </tr>" +
            "" +
            "{{/each}}" +
            "</table>"
        );

        return template({ records: records });
    }

    renderConfig() {
        return "" +
            "<label id='server-switch' class='switch' for='server-check'>Mit Server spielen?" +
            `    <input id='server-check' type='checkbox' ${this.getGameState().serverSide ? 'checked' : ''}>` +
            "</label>" +
            "<label id='username-field-label' for='username-field'>Benutzernamen eingeben:" +
            "    <input required id='username-field' />" +
            "    <label id='username-error' for='username-field'>Bitte einen Namen eingeben!</label>" +
            "</label>" +
            "<div class='button' id='play-game-button'>" +
            "   Spiel starten" +
            "</div>";
    }

    render() {
        let records = this.getGameState().records;

        container.innerHTML += "" +
            "<header><h1>Willkommen beim besten Spiel der Welt: Schere-Stein-Papier</h1></header>" +
            "" +
            "<section id='ranking-container'>" +
                this.renderRankingTable(records) +
            "</section>" +
            "<section id='config-container'>" +
            "   <h1>Ein neues Spiel starten</h1>" +
                this.renderConfig() +
            "</section>";

        if (this.getGameState().serverSide) {
            this.loadOnlineRanking();
        }

        this.setRelevantQuerySelectorConstants();
    }
}