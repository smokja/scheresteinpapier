import {container, createLinkElement, play_options, server} from "../../globals.js";


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
            waitTimer: 4
        };

        this.render();
        this.mountEventListeners();
    }

    mountEventListeners() {
        let cards = document.querySelectorAll("#play-user-area .card");
        cards.forEach((card) => {
            card.addEventListener("click", (e) => this.cardClicked(e));
        });

        document.getElementById("go-back-button").addEventListener("click", () => this.switchPage());
    }


    cardClicked(e) {
        if (this.state.gameIsRunning) {
            return;
        }

        this.state.gameIsRunning = true;
        let cards = document.querySelectorAll("#play-user-area .card");
        cards.forEach((card) => {
            card.classList.add("disabled");
        });

        e.target.classList.remove("disabled");
        e.target.classList.add("card-focused");
        this.evaluateGame(e.target.innerText);
    }

    updatePCCard(selectedCard) {
        console.log("got here")
        let pcCard = document.getElementById("play-pc-area").querySelector(".card");
        let pcCardImg = pcCard.querySelector("img");
        let pcCardInfo = pcCard.querySelector(".info");
        let play_option = play_options.filter(x => x.name === selectedCard)[0];
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
        let { username } = this.state.config;
        this.state.currentGameHistory.push({
            round: this.state.currentRound++,
            result: result,
            user: userAction,
            pc: pcAction
        });

        console.log(this.state.config.records, "before update");
        let record = this.state.config.records.filter(x => x.user === username);
        let winsToAdd = result === "win" ? 1 : 0;

        if (record.length > 0) {
            console.log(record);
            record[0].win += winsToAdd;
        } else {
            this.state.config.records.push({
                user: username,
                win: winsToAdd
            });
        }
        console.log(this.state.config.records, "after update");
        this.updateGameHistory();
    }

    updateBorderScore() {
        let { userScore, pcScore } = this.state;
        let borderScoreP = document.getElementById("score-text");
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
        console.log("test");
        let continueP = document.getElementById("continue-text");
        let baseText = "Nächstes Spiel beginnt in ";
        for (let i = this.state.waitTimer; i > 0; i--) {
            console.log("in loop");
            continueP.innerText = baseText + i + "...";
            await this.sleep(1000);
        }

        continueP.innerText = "";
    }

    sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    updateGame(pcAction, playerAction, result) {
        pcAction = (pcAction || "").toLowerCase();
        this.updatePCCard(pcAction);
        this.writeToHistory(pcAction, playerAction, result);
        this.writeToScore(result);
        this.updateContinueText();
    }


    getRandomInt(min, max) {
        console.log(min);
        console.log(max);
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    getRandomPCOption() {
        let idx = this.getRandomInt(1, play_options.length);
        return play_options.filter(x => x.id === idx)[0];
    }

    simulateGame(pcOption, playerAction) {
        playerAction = (playerAction || "").toLowerCase();
        let playerOption = play_options.filter(x => x.name === playerAction)[0];
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

    evaluateGame(playerAction) {
        console.log(playerAction);
        if (this.state.config.serverSide) {
            this.state.loading = true;
            this.updatePCCard();
            fetch(server + `/play?playerName=${this.state.config.username}&playerHand=${playerAction}`)
                .then(res => res.json())
                .then(body => {
                    console.log(body, "body");
                    this.state.loading = false;
                    let result = typeof body.win === 'undefined' ? "=" : body.win  ? "win" : "lose";
                    this.updateGame(body.choice, playerAction, result);
                    setTimeout(() => this.resetGame(), this.state.waitTimer * 1000);

                })
                .catch(() => {
                    alert("Server not responding.");
                    this.resetGame();
                });
        } else {
            let pcOption = this.getRandomPCOption();
            let resultBody = this.simulateGame(pcOption, playerAction);
            this.updateGame(resultBody.pcAction, playerAction, resultBody.result);
            setTimeout(() => this.resetGame(), this.state.waitTimer * 1000);
        }
    }


    resetGame() {
        this.state.loading = false;
        this.state.gameIsRunning = false;
        this.updatePCCard();
        let cards = document.querySelectorAll("#play-user-area .card");
        let pcCardImg = document.getElementById("play-pc-area").querySelector(".card > img");
        cards.forEach((card) => {
            card.classList.remove("disabled");
            card.classList.remove("card-focused");
        });

        pcCardImg.setAttribute("src", "img/hidden.jpg");
    }

    updatePlayZone() {
        let playZoneContainer = document.getElementById("play-zone");

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
            "   <span>" +
            "       <h2>Score</h2>" +
            "       <p id='score-text'></p>" +
            "       <p id='continue-text'></p>" +
            "   </span>" +
            "</div>" +
            "<div id='play-user-area'>" +
            "   <div id='scissors-element' class='card'>" +
            "       <img alt='Bild von Schere' src='img/scissors.jpg'>" +
            "           <div class='info'>" +
            "               Schere" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "   <div id='stone-element' class='card'>" +
            "       <img alt='Bild von Stein' src='img/stone.jpg'>" +
            "           <div class='info'>" +
            "               Stein" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "   <div id='paper-element' class='card'>" +
            "       <img alt='Bild von Papier' src='img/paper.jpg'>" +
            "           <div class='info'>" +
            "               Papier" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "   <div id='fountain-element' class='card'>" +
            "       <img alt='Bild von Brunnen' src='img/jojo_fountain.PNG'>" +
            "           <div class='info'>" +
            "               Brunnen" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "   <div id='match-element' class='card'>" +
            "       <img alt='Bild von Streichholz' src='img/match.gif'>" +
            "           <div class='info'>" +
            "               Streichholz" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "</div>" +
            "";
    }

    updateGameHistory(playedGames = this.state.currentGameHistory) {
        console.log(playedGames);
        let gameHistoryContainer = document.getElementById("game-history");
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

        this.updatePlayZone();
        this.updatePCCard();
        this.updateGameHistory();
        this.updateBorderScore();
    }
}