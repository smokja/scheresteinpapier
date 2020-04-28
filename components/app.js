import { container } from "../globals.js";
import GamePage from "./gamePage/gamePage.js";
import StartPage from "./startPage/startPage.js";

export default class App {
    constructor() {
        this.state = {
            playing: false,
            gameState: {
                serverSide: true,
                username: "TestUser"
            }
        }

        // function bind because it is passed onto child components
        this.switchPage = this.switchPage.bind(this);
        this.getServerSide = this.getServerSide.bind(this);
        this.switchServerside = this.switchServerside.bind(this);
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

    getServerSide() {
        return this.state.gameState.serverSide;
    }

    setUsername(username = "") {
        this.state.gameState.username = username;
    }

    switchPage() {
        this.state.playing = !this.state.playing;
        this.render();
    }

    switchServerside(value = !this.state.gameState.serverSide) {
        this.state.gameState.serverSide = value;
    }

    render() {
        console.log("render");
        let { playing } = this.state;

        container.innerHTML = "";
        if (playing) {
            new StartPage(this.switchPage, this.setGameState, this.getGameState);
        } else {
            new GamePage(this.switchPage, this.state.gameState);
        }
    }
}

