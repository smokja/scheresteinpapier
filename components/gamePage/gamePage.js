'use strict';
import {
    container,
    createLinkElement,
    play_options,
    sleep,
    getRandomInt
} from "../../globals.js";
import Api from "../../api/api.js";


export default class GamePage {
    constructor(switchPage, gameState) {
        this.switchPage = switchPage;
        container.appendChild(createLinkElement("./components/gamePage/gamePage.css"));

        this.state = {
            config: gameState,
            currentGameHistory: [],
            loading: false,
            currentRound: 1,
            userScore: 0,
            pcScore: 0,
            waitTimer: 4,
            querySelector: {
                playZone: {}
            }
        };

        this.render();
        this.mountEventListeners();
    }

    mountEventListeners() {
        const { goBackButton } = this.state.querySelector;
        const { playerCards } = this.state.querySelector.playZone;

        playerCards.forEach((card) => {
            card.addEventListener("click", (e) => this.cardClickedEventHandler(e));
        });

        goBackButton.addEventListener("click", () => this.switchPage());
    }

    setRelevantQuerySelectorConstants() {
        this.state.querySelector = {
            goBackButton: document.getElementById("go-back-button"),
            playZoneContainer: document.getElementById("play-zone"),
            gameHistoryContainer: document.getElementById("game-history")
        };
    }

    setPlayerZoneQuerySelectorConstants() {
        const pcCard = document.getElementById("play-pc-area").querySelector(".card");
        this.state.querySelector.playZone = {
            playerCards: document.querySelectorAll("#play-user-area .card"),
            pcCardImg: pcCard.querySelector("img"),
            pcCardInfo: pcCard.querySelector(".info"),
            continuePElement: document.getElementById("continue-text")
        };
    }


    cardClickedEventHandler(e) {
        if (this.state.gameIsRunning) {
            return;
        }

        this.state.gameIsRunning = true;
        this.updatePlayerCards(true);
        this.updateActivePlayerCard(e.target);
        this.evaluateGame(e.target.querySelector("p").innerText);
    }

    updatePlayerCards(disabled) {
        const { playerCards } = this.state.querySelector.playZone;
        if (disabled) {
            playerCards.forEach((card) => {
                this.updateCard(card, true, false);
            });
        } else {
            playerCards.forEach((card) => {
                this.updateCard(card, false, false);
            });
        }
    }

    updateCard(card, disabled, cardFocused) {
        if (disabled) {
            card.classList.add("disabled");
        } else {
            card.classList.remove("disabled");
        }

        if (cardFocused) {
            card.classList.add("card-focused");
        } else {
            card.classList.remove("card-focused");
        }
    }

    updateActivePlayerCard(playerCard) {
        this.updateCard(playerCard, false, true);
    }

    updatePCCard(selectedCard) {
        const { pcCardImg, pcCardInfo } = this.state.querySelector.playZone;
        const play_option = play_options.filter(x => x.name === selectedCard)[0];
        let selectedImgPath;
        if (typeof play_option === 'undefined') {
            selectedImgPath = "img/hidden.jpg";
        } else {
            selectedImgPath = "img/"+play_option.filename;
        }

        pcCardImg.setAttribute("src", selectedImgPath);
        if (this.state.loading) {
            pcCardInfo.classList.remove("hidden");
        } else {
            pcCardInfo.classList.add("hidden");
        }
    }

    writeToHistory(pcAction, userAction, result) {
        const { username } = this.state.config;
        this.state.currentGameHistory.push({
            round: this.state.currentRound++,
            result: result,
            user: userAction,
            pc: pcAction
        });

        const record = this.state.config.records.filter(x => x.user === username);
        const winsToAdd = result === "win" ? 1 : 0;

        if (record.length > 0) {
            record[0].win += winsToAdd;
        } else {
            this.state.config.records.push({
                user: username,
                win: winsToAdd
            });
        }

        this.updateGameHistory();
    }

    updateBorderScore() {
        const { userScore, pcScore } = this.state;
        const borderScoreP = document.getElementById("score-text");
        borderScoreP.innerText = `Spieler ${userScore} : ${pcScore} PC`;
    }

    writeToScore(result) {
        switch (result) {
            case "win":
                this.state.userScore++;
                break;
            case "lose":
                this.state.pcScore++;
                break;
            default:
                break;
        }

        this.updateBorderScore();
    }

    async updateContinueText() {
        const { continuePElement } = this.state.querySelector.playZone;
        const baseText = "Nächstes Spiel beginnt in ";
        for (let i = this.state.waitTimer; i > 0; i--) {
            continuePElement.innerText = baseText + i + "...";
            await sleep(1000);
        }

        continuePElement.innerText = "";
    }

    updateGame(pcAction, playerAction, result) {
        pcAction = (pcAction || "").toLowerCase();
        playerAction = (playerAction || "").toLowerCase();
        this.updatePCCard(pcAction);
        this.writeToHistory(pcAction, playerAction, result);
        this.writeToScore(result);
        this.updateContinueText();
    }

    getRandomPCOption() {
        const idx = getRandomInt(1, play_options.length);
        return play_options.filter(x => x.id === idx)[0];
    }

    simulateGame(pcOption, playerAction) {
        playerAction = (playerAction || "").toLowerCase();
        const playerOption = play_options.filter(x => x.name === playerAction)[0];
        let resultBody;
        if (pcOption.id === playerOption.id) {
            resultBody = {
                pcAction: playerAction,
                result: "="
            };
        } else if (playerOption.beats.filter(x => x === pcOption.id).length > 0) {
            resultBody = {
                pcAction: pcOption.name,
                result: "win"
            };
        } else {
            resultBody = {
                pcAction: pcOption.name,
                result: "lose"
            };
        }

        return resultBody;
    }

    async evaluateGame(playerAction) {
        if (this.state.config.serverSide) {
            this.state.loading = true;
            this.updatePCCard();
            try {
                const result = await Api.sendRequest(this.state.config.username, playerAction);
                this.state.loading = false;
                this.updateGame(result.pcAction, playerAction, result.resultText);
                setTimeout(() => this.resetGame(), this.state.waitTimer * 1000);
            } catch {
                this.resetGame();
            }
        } else {
            const pcOption = this.getRandomPCOption();
            const resultBody = this.simulateGame(pcOption, playerAction);
            this.updateGame(resultBody.pcAction, playerAction, resultBody.result);
            setTimeout(() => this.resetGame(), this.state.waitTimer * 1000);
        }
    }


    resetGame() {
        const { pcCardImg } = this.state.querySelector.playZone;
        this.state.loading = false;
        this.state.gameIsRunning = false;
        this.updatePCCard();
        this.updatePlayerCards(false);
        pcCardImg.setAttribute("src", "img/hidden.jpg");
    }

    renderPlayZone() {
        const { playZoneContainer } = this.state.querySelector;

        playZoneContainer.innerHTML = "" +
            "<div id='play-pc-area'>" +
            "   <div class='card'>" +
            "       <img alt='Bild von PC auswahl'>" +
            "           <div class='info'>" +
            "               <div class='lds-spinner'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "</div>" +
            "<div id='play-border-area'>" +
            "   <div>" +
            "       <h2>Score</h2>" +
            "       <p id='score-text'></p>" +
            "       <p id='continue-text'></p>" +
            "   </div>" +
            "</div>" +
            "<div id='play-user-area'>" +
            "   <div id='scissors-element' class='card'>" +
            "       <img alt='Bild von Schere' src='img/scissors.jpg'>" +
            "           <div class='info'><p>Schere</p></div>" +
            "       </img>" +
            "   </div>" +
            "   <div id='stone-element' class='card'>" +
            "       <img alt='Bild von Stein' src='img/stone.jpg'>" +
            "           <div class='info'><p>Stein</p></div>" +
            "       </img>" +
            "   </div>" +
            "   <div id='paper-element' class='card'>" +
            "       <img alt='Bild von Papier' src='img/paper.jpg'>" +
            "           <div class='info'><p>Papier</p></div>" +
            "       </img>" +
            "   </div>" +
            "   <div id='fountain-element' class='card'>" +
            "       <img alt='Bild von Brunnen' src='img/jojo_fountain.PNG'>" +
            "           <div class='info'><p>Brunnen<p></div>" +
            "       </img>" +
            "   </div>" +
            "   <div id='match-element' class='card'>" +
            "       <img alt='Bild von Streichholz' src='img/match.gif'>" +
            "           <div class='info'><p>Streichholz</p></div>" +
            "       </img>" +
            "   </div>" +
            "</div>" +
            "";

        this.setPlayerZoneQuerySelectorConstants();
    }

    updateGameHistory(playedGames = this.state.currentGameHistory) {
        const { gameHistoryContainer } = this.state.querySelector;
        gameHistoryContainer.innerHTML = Handlebars.compile("" +
            "<h1>Username: "+this.state.config.username+"</h1><br />" +
            "<h1>Match-history</h1>" +
            "<table>" +
            "   <thead>" +
            "       <tr>" +
            "           <th>Runde</th>" +
            "           <th>Resultat</th>" +
            "           <th>Nutzer</th>" +
            "           <th>PC</th>" +
            "       </tr>" +
            "   </thead>" +
            "   {{#each records}}" +
            "   <tr>" +
            "       <td>{{this.round}}</td>" +
            "       <td>{{this.result}}</td>" +
            "       <td>{{this.user}}</td>" +
            "       <td>{{this.pc}}</td>" +
            "   </tr>" +
            "   {{/each}}" +
            "</table>")({ records: playedGames });
    }

    render() {
        container.innerHTML += Handlebars.compile(
            "<header id='game-header'>" +
            "   <h1>Schere Stein Papier (Brunnen und Streichholz edition) </h1> " +
            "   <span class='button' id='go-back-button'>Zurück zur Startseite</span>" +
            "</header>" +
            "<section id='game-body'>" +
            "   <aside id='game-history' ></aside>" +
            "   <section id='play-zone'>" +
            "   </section>" +
            "</section>"
        )();
        this.setRelevantQuerySelectorConstants();
        this.renderPlayZone();

        this.updatePCCard();
        this.updateGameHistory();
        this.updateBorderScore();
    }
}