import { container, createLinkElement, server } from "../../globals.js";
export default class StartPage {
    constructor(switchPage) {
        this.switchPage = switchPage;
        container.appendChild(createLinkElement("./components/startPage/startPage.css"));
        console.log(container);
        this.state = {
            recordsOnline: [],
            records: [],
            serverSide: false
        }
        this.serverSwitchChanged = this.serverSwitchChanged.bind(this);
        this.render();
        this.mountEventListener();
    }

    mountEventListener() {
        document.getElementById("server-switch").addEventListener("change", this.serverSwitchChanged);
        document.getElementById("play-game-button").addEventListener("click", () => this.switchPage());
    }

    serverSwitchChanged(e) {
        let serverSide = e.target.checked;
        console.log(serverSide);
        this.state.serverSide = serverSide;

        if (serverSide) {
            this.updateRankingTable(true);
            fetch(server + "/ranking")
                .then(res => res.json())
                .then(json => {
                    this.state.recordsOnline = json;
                    console.log(this.state.records);
                    this.updateRankingTable(false);
                });
        } else {
            this.updateRankingTable(false);
        }
    }

    updateRankingTable(loading = false) {
        let { serverSide, recordsOnline, records } = this.state;
        let rankingContainer = document.getElementById("ranking-container");

        if (loading) {
            rankingContainer.innerHTML = "Loading...";
        } else {
            rankingContainer.innerHTML = this.renderRankingTable(serverSide ? recordsOnline : records);
        }
    }
    renderRankingTable(records) {

        let template = Handlebars.compile("" +
            "<table id='ranking-table'>" +
            "   <tr>" +
            "       <th>Lost</th>" +
            "        <th>Name</th>" +
            "       <th>Win</th>" +
            "   </tr>" +
            "" +
            "{{#each records}}" +
            "" +
            "   <tr>" +
            "       <td>{{this.lost}}</td>" +
            "       <td>{{this.user}}</td>" +
            "       <td>{{this.win}}</td>" +
            "   </tr>" +
            "" +
            "{{/each}}" +
            "</table>"
        );

        return template({ records: records });
    }

    renderConfig() {
        return Handlebars.compile("" +
            "<div id='config'>" +
            "<h1>Ein neues Spiel starten</h1>" +
            "<div id='config-area'>" +
            "   <label id='server-switch' class='switch'>" +
            "       <input id='server-check' type='checkbox'>" +
            "       <span class='slider round'></span>" +
            "   </label>" +
            "   <label id='server-check-label' for='server-check'>Mit Server spielen?</label>" +

            "</div>" +
            "<button id='play-game-button'>" +
            "    Spiel starten" +
            "</button>" +
            "</div>"
        )();
    }

    render() {
        let { records } = this.state;
        container.innerHTML += "" +
        "<div id='ranking-container'>" +
            this.renderRankingTable(records) +
        "</div>" +
        "<div id='config-container'>" +
            this.renderConfig() +
        "</div>";
    }
}