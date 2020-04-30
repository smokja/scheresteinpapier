import { container, createLinkElement, server } from "../../globals.js";
export default class StartPage {
    constructor(switchPage, setGameState, getGameState) {
        this.switchPage = switchPage;
        this.setGameState = setGameState;
        this.getGameState = getGameState;
        container.appendChild(createLinkElement("./components/startPage/startPage.css"));
        console.log(container);
        this.state = {
            recordsOnline: []
        }
        this.serverSwitchChanged = this.serverSwitchChanged.bind(this);
        this.playGame = this.playGame.bind(this);
        this.render();
        this.mountEventListener();
    }

    mountEventListener() {
        document.getElementById("server-switch").addEventListener("change", this.serverSwitchChanged);
        document.getElementById("play-game-button").addEventListener("click", this.playGame);
    }

    playGame() {
        let username = document.getElementById("username-field");
        if (username.checkValidity()) {
            let gameState = this.getGameState();
            this.setGameState({
                username: username.value,
                serverSide: gameState.serverSide,
                records: gameState.records
            });
            this.switchPage();
        } else {
            username.classList.add("not-filled");
            alert("Username is required");
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
                console.log(this.state.recordsOnline);
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
        console.log(records);
        let rankingContainer = document.getElementById("ranking-container");

        if (loading) {
            rankingContainer.innerHTML = "Loading...";
        } else {
            rankingContainer.innerHTML = this.renderRankingTable(this.getGameState().serverSide ? recordsOnline : records);
        }
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
            "<label for='username-field'>Username" +
            "    <input required id='username-field' />" +
            "</label>" +
            "<div class='button' id='play-game-button'>" +
            "   Spiel starten" +
            "</div>";
    }

    render() {
        let records = this.getGameState().records;
        console.log(records, "render records");
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
    }
}