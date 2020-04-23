import { container, createLinkElement } from "../../globals.js";
export default class StartPage {
    constructor(switchPage) {
        this.switchPage = switchPage;
        container.appendChild(createLinkElement("./components/startPage/startPage.css"));
        console.log(container);
        this.state = {
            records: [
                { rank: 1, name: "peter", wins: 12},
                { rank: 2, name: "peter2", wins: 11},
                { rank: 3, name: "peter3", wins: 10},
                { rank: 4, name: "peter4", wins: 9},
            ]
        }
    }

    renderRankingTable(records) {

        let template = Handlebars.compile("" +
            "<table id='ranking-table'>" +
            "   <tr>" +
            "       <th>Rang</th>" +
            "        <th>Name</th>" +
            "       <th>Siege</th>" +
            "   </tr>" +
            "" +
            "{{#each records}}" +
            "" +
            "   <tr>" +
            "       <td>{{this.rank}}</td>" +
            "       <td>{{this.name}}</td>" +
            "       <td>{{this.wins}}</td>" +
            "   </tr>" +
            "" +
            "{{/each}}" +
            "</table>" +
            ""
        );

        return template({ records: records });
    }

    renderConfig() {
        return Handlebars.compile("" +
            "<div id='config'>" +
            "<h1>Ein neues Spiel starten</h1>" +
            "<div id='config-area'>" +
            "   <label class='switch'>" +
            "       <input id='server-check' type='checkbox'>" +
            "       <span class='slider round'></span>" +
            "   </label>" +
            "   <label id='server-check-label' for='server-check'>Mit Server spielen?</label>" +

            "</div>" +
            "<button id='play-game-button'>" +
            "    Spiel starten" +
            "</button>" +
            "</div>" +
            ""
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