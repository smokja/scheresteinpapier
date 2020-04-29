import { createLinkElement, container } from "../../globals.js";

export default class GamePage {
    constructor(switchPage, gameState) {
        this.switchPage = switchPage;
        container.appendChild(createLinkElement("./components/gamePage/gamePage.css"));

        this.state = {
            config: gameState,
            currentGameHistory: []
        };

        this.render();
        this.mountEventListeners();
    }

    mountEventListeners() {
        // document.getElementById("go-back-button").addEventListener("click", () => this.switchPage());
    }

    updatePlayZone() {
        let playZoneContainer = document.getElementById("play-zone");

        playZoneContainer.innerHTML = "" +
            "<div id='play-pc-area'>" +
            "   <div class='card'></div>" +
            "</div>" +
            "<div id='play-border-area'>" +
            "</div>" +
            "<div id='play-user-area'>" +
            "   <div class='card'>" +
            "       <img alt='Bild von Schere' src='https://c4.wallpaperflare.com/wallpaper/896/12/900/anime-anime-girls-kill-la-kill-scissors-wallpaper-preview.jpg'>" +
            "           <div class='info'>" +
            "               Schere" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "   <div class='card'>" +
            "       <img alt='Bild von Stein' src='https://i.ytimg.com/vi/KxVJ1_38zwU/maxresdefault.jpg'>" +
            "           <div class='info'>" +
            "               Stein" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "   <div class='card'>" +
            "       <img alt='Bild von Papier' src='https://i.ytimg.com/vi/sbRpfv0L0_Q/maxresdefault.jpg'>" +
            "           <div class='info'>" +
            "               Papier" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "   <div class='card'>" +
            "       <img alt='Bild von Brunnen' src='img/jojo_fountain.PNG'>" +
            "           <div class='info'>" +
            "               Brunnen" +
            "           </div>" +
            "       </img>" +
            "   </div>" +
            "   <div class='card'>" +
            "       <img alt='Bild von Streichholz' src='https://i.gifer.com/2pwq.gif'>" +
            "           <div class='info'>" +
            "               Streichholz" +
            "           </div>" +
            "       </img>" +
            "   </div>" +

            "</div>" +
            "";
    }

    updateGameHistory(playedGames) {
        let gameHistoryContainer = document.getElementById("game-history");
        gameHistoryContainer.innerHTML = Handlebars.compile("" +
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

        // testData
        this.updateGameHistory([
            { round: 1, result: "lost", user: "schere", pc: "stein"  },
            { round: 2, result: "lost", user: "schere", pc: "stein"  },
            { round: 3, result: "lost", user: "schere", pc: "stein"  },
            { round: 4, result: "lost", user: "schere", pc: "stein"  },
            { round: 5, result: "lost", user: "schere", pc: "stein"  },
        ]);
    }
}