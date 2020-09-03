import {AutoSelector} from "./automation.js";
import {Quilt} from "./quilt.js";

// TODO: Everything below goes in "main"

function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createPanel(options: {
    author: string,
    description: string,
    imageUrl: string,
    title: string,
}): HTMLDivElement {
    const tempContainer = document.createElement("div") as HTMLDivElement;
    const htmlString = `<div>
        <div class="image">
            <img alt="${options.title}" src="${options.imageUrl}">
        </div>`
    tempContainer.innerHTML = htmlString.trim();
    return tempContainer.firstChild as HTMLDivElement;
}

const container = document.getElementById("container");
const quilt = new Quilt(container, {
    basePanelSize: 200,
    classPrefix: "panel",
    panelsPerRow: 25,
});

for (let i = 0; i < (25 * 25); i++) {
    const element = createPanel({
        author: "George Lesica",
        description: "This is a fake image",
        imageUrl: `images/img-${i % 190}.jpg`,
        title: "Fake Image",
    });
    element.style.backgroundColor = randomColor();
    quilt.addPanel(element, {allowFocus: true});
}

new AutoSelector(quilt, {delay: 4000, strategy: "sequential"});
