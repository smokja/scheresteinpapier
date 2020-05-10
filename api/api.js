import { server } from "../globals.js";

export default class Api {
    static async getRankingList() {
        const response = await fetch(server + "/ranking");
        const json = await response.json();
        return Object.values(json);
    }

    static async sendRequest(playerName, playerHand) {
        const response = await fetch(server + `/play?playerName=${playerName}&playerHand=${playerHand}`);
        const json = await response.json();
        let result = typeof json.win === 'undefined' ? "=" : json.win  ? "win" : "lose";
        return { pcAction: json.choice, resultText: result };
    }
}