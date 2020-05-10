'use strict';
export const container = document.body;
export const server = "https://us-central1-schere-stein-papier-ee0c9.cloudfunctions.net/widgets";
export const play_options = [
    {
        id: 1,
        name: "papier",
        filename: "paper.jpg",
        beats: [2, 4]
    },
    {
        id: 2,
        name: "stein",
        filename: "stone.jpg",
        beats: [5, 3]
    },
    {
        id: 3,
        name: "streichholz",
        filename: "match.gif",
        beats: [1, 4]
    },
    {
        id: 4,
        name: "brunnen",
        filename: "jojo_fountain.PNG",
        beats: [2, 5]
    },
    {
        id: 5,
        name: "schere",
        filename: "scissors.jpg",
        beats: [1, 3]
    }
];

export function createLinkElement(path) {
    let link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = path;

    return link;
}

export function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}