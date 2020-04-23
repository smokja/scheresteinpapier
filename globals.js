export const container = document.getElementById("main-container");

export function createLinkElement(path) {
    let link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = path;

    return link;
}