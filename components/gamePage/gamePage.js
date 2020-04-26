import { createLinkElement, container } from "../../globals.js";

export default class GamePage {
    constructor(switchPage) {
        this.switchPage = switchPage;
        container.appendChild(createLinkElement("./components/gamePage/gamePage.css"));
        this.render();
        this.mountEventListeners();
    }

    mountEventListeners() {
        document.getElementById("go-back-button").addEventListener("click", () => this.switchPage());
    }

    render() {
        container.innerHTML += "<button id='go-back-button'>Go back</button>"
    }
}