import { container } from "../globals.js";
import GamePage from "./gamePage/gamePage.js";
import StartPage from "./startPage/startPage.js";

export default class App {
    constructor() {
        this.state = {
            playing: false,
            gameState: {
                serverSide: true,
                username: ""
            }
        }

        // function bind because it is passed onto child components
        this.switchPage = this.switchPage.bind(this);
        this.getGameState = this.getGameState.bind(this);
        this.setGameState = this.setGameState.bind(this);
        this.render();
    }

    getGameState() {
        return this.state.gameState;
    }

    setGameState(gameState) {
        this.state.gameState = gameState;
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
            new StartPage(this.switchPage, this.setGameState, this.getGameState);
        } else {
            new GamePage(this.switchPage, this.state.gameState);
        }
    }
}

