import { createLinkElement, container, server } from "../../globals.js";

export default class GamePage {
    constructor(switchPage, gameState) {
        this.switchPage = switchPage;
        container.appendChild(createLinkElement("./components/gamePage/gamePage.css"));

        this.state = {
            config: gameState,
            currentGameHistory: [],
            loading: false,
            currentRound: 1
        };

        this.evaluateGame = this.evaluateGame.bind(this);
        this.cardClicked = this.cardClicked.bind(this);
        this.writeToHistory = this.writeToHistory.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.render();
        this.mountEventListeners();
    }

    mountEventListeners() {
        let cards = document.querySelectorAll("#play-user-area .card");
        cards.forEach((card) => {
            card.addEventListener("click", this.cardClicked);
        });

        // document.getElementById("go-back-button").addEventListener("click", () => this.switchPage());
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

    updatePCCard(selectedCard = "") {
        console.log("got here")
        let pcCard = document.getElementById("play-pc-area").querySelector(".card");
        let pcCardImg = pcCard.querySelector("img");
        let pcCardInfo = pcCard.querySelector(".info");
        let selectedImgPath = "img/";
        switch (selectedCard.toLowerCase()) {
            case "brunnen":
                selectedImgPath += "jojo_fountain.PNG";
                break;
            case "schere":
                selectedImgPath += "scissors.jpg";
                break;
            case "streichholz":
                selectedImgPath += "match.gif";
                break;
            case "stein":
                selectedImgPath += "stone.jpg";
                break;
            case "papier":
                selectedImgPath += "paper.jpg";
                break;
            default:
                selectedImgPath += "hidden.jpg"
                break;
        }
        pcCardImg.setAttribute("src", selectedImgPath);
        if (this.state.loading) {
            pcCardInfo.classList.remove("hidden");
        } else {
            pcCardInfo.classList.add("hidden");
        }
    }

    writeToHistory(pcAction, userAction, result) {
        this.state.currentGameHistory.push({
            round: this.state.currentRound++,
            result: result ? "win" : "lose",
            user: userAction,
            pc: pcAction
        });

        this.updateGameHistory();
    }


    evaluateGame(playerAction) {
        console.log(playerAction);
        if (this.state.config.serverSide) {
            this.state.loading = true;
            this.updatePCCard();
            try {
                fetch(server + `/play?playerName=${this.state.config.username}&playerHand=${playerAction}`)
                    .then(res => res.json())
                    .then(body => {
                        console.log(body, "body");
                        this.state.loading = false;
                        this.updatePCCard(body.choice);
                        this.writeToHistory(body.choice, playerAction, body.win === undefined ? "=" : body.win);
                        setTimeout(this.resetGame, 3000);

                    })
                    .catch((e) => {
                        this.state.loading = false;
                        this.updatePCCard();
                        this.state.gameIsRunning = false;
                    });
            } catch (e) {
                console.log(e);
            }
        } else {

        }


    }

    resetGame() {
        this.state.gameIsRunning = false;
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
            "<header id='game-header'><h1>Schere Stein Papier (Brunnen und Streichholz edition)</h1></header>" +
            "<section id='game-body'>" +
            "   <aside id='game-history' ></aside>" +
            "   <section id='play-zone'>" +
            "   </section>" +
            "</section>"
        )();

        this.updatePlayZone();
        this.updatePCCard();
        this.updateGameHistory();
    }
}