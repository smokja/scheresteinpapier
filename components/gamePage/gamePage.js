import { createLinkElement, container } from "../../globals.js";

export default class GamePage {
    constructor(switchPage, gameState) {
        this.switchPage = switchPage;
        container.appendChild(createLinkElement("./components/gamePage/gamePage.css"));

        this.state = {
            config: gameState,
            currentGameHistory: []
        };

        this.render();
        this.mountEventListeners();
    }

    mountEventListeners() {
        document.getElementById("go-back-button").addEventListener("click", () => this.switchPage());
    }

    render() {
        container.innerHTML += Handlebars.compile(
            "<div id='game-header'></div>" +
            "<div id='game-body'>" +
            "   <div id='game-history'>History</div>" +
            "   <div id='play-zone'>" +
            "       Playzone" +
            "   </div>" +
            "</div>"
        )();//this.state.config.username + "<button id='go-back-button'>Go back</button>"
    }
}