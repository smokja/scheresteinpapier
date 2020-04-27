export const container = document.body;
export const server = "https://us-central1-schere-stein-papier-ee0c9.cloudfunctions.net/widgets";
export function createLinkElement(path) {
    let link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = path;

    return link;
}