'use strict';
import { container, createLinkElement, server } from "../../globals.js";
import Api from "../../api/api.js";
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

        // method binding
        this.serverSwitchChangedEventHandler = this.serverSwitchChangedEventHandler.bind(this);
        this.playGameEventHandler = this.playGameEventHandler.bind(this);
        this.updateUsernameField = this.updateUsernameField.bind(this);

        // page build up
        this.render();
        this.mountEventListener();
    }

    mountEventListener() {
        const { serverSwitch, playGameButton, usernameField } = this.state.querySelector;
        serverSwitch.addEventListener("change", this.serverSwitchChangedEventHandler);
        playGameButton.addEventListener("click", this.playGameEventHandler);
        usernameField.addEventListener("change", this.updateUsernameField);
    }

    setRelevantQuerySelectorConstants() {
        this.state.querySelector = {
            usernameField: document.getElementById("username-field"),
            serverSwitch: document.getElementById("server-switch"),
            playGameButton: document.getElementById("play-game-button"),
            usernameError: document.getElementById("username-error")
        };
    }

    playGameEventHandler() {
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

    serverSwitchChangedEventHandler(e) {
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

    sortAndRankRecords(records) {
        let counter = 1;
        let sorted = records.sort((x, y) => y.win - x.win).map(x => {
            x.rank = counter++;
            return x;
        });

        let lastHighestWins = 0;
        let lastRank = 1;
        sorted.forEach(x => {
            if (x.win === lastHighestWins) {
                x.rank = lastRank;
            } else {
                x.rank = lastRank++;
                lastHighestWins = x.win;
            }

            return x;
        });

        return sorted.slice(0, 10);
    }

    async loadOnlineRanking() {
        this.updateRankingTable(true);
        this.state.recordsOnline = await Api.getRankingList();
        console.log(this.state.recordsOnline);
        this.updateRankingTable(false);
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

    renderRankingTable(records) {
        console.log(records);
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
}