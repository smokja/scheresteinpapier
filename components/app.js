import { container } from "../globals.js";
import GamePage from "./gamePage/gamePage.js";
import StartPage from "./startPage/startPage.js";

export default class App {
    constructor() {
        this.state = {
            playing: false,
            serverSide: false
        }

        // function bind because it is passed onto child components
        this.switchPage = this.switchPage.bind(this);
        this.getServerSide = this.getServerSide.bind(this);
        this.switchServerside = this.switchServerside.bind(this);
    }

    getServerSide() {
        return this.state.serverSide;
    }

    switchPage() {
        this.state.playing = !this.state.playing;
        this.render();
    }

    switchServerside(value = !this.state.serverSide) {
        this.state.serverSide = value;
    }

    render() {
        console.log("render");
        let { playing } = this.state;

        container.innerHTML = "";
        if (!playing) {
            new StartPage(this.switchPage, this.switchServerside, this.getServerSide);
        } else {
            new GamePage(this.switchPage, this.getServerSide);
        }
    }

    dispose() {

    }
}

