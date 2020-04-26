import { container } from "../globals.js";
import GamePage from "./gamePage/gamePage.js";
import StartPage from "./startPage/startPage.js";

export default class App {
    constructor() {
        this.state = {
            playing: false,
            serverSide: false
        }

        this.switchPage = this.switchPage.bind(this);
    }

    switchPage() {
        this.state.playing = !this.state.playing;
        this.render();
    }

    render() {
        console.log("render");
        let { playing } = this.state;

        container.innerHTML = "";
        if (!playing) {
            new StartPage(this.switchPage);
        } else {
            new GamePage(this.switchPage);
        }
    }

    dispose() {

    }
}

