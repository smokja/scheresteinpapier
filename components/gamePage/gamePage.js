import { createLinkElement, container } from "../../globals.js";

export default class GamePage {
    constructor(switchPage, getServerSide) {
        this.switchPage = switchPage;
        this.getServerSide = getServerSide;
        container.appendChild(createLinkElement("./components/gamePage/gamePage.css"));

        this.state = {
            serverSide: this.getServerSide()
        };

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