export const container = document.getElementById("main-container");

export function loadConditionalCSS(path, elem = container) {
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = path;
    container.appendChild(link);
}