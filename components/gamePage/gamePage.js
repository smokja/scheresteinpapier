import { createLinkElement, container } from "../../globals.js";

export default class GamePage {
    constructor(switchPage, gameState) {
        this.switchPage = switchPage;
        container.appendChild(createLinkElement("./components/gamePage/gamePage.css"));

        this.state = gameState;

        this.render();
        this.mountEventListeners();
    }

    mountEventListeners() {
        document.getElementById("go-back-button").addEventListener("click", () => this.switchPage());
    }

    render() {

        container.innerHTML += this.state.username + "<button id='go-back-button'>Go back</button>"
    }
}