import {AutoSelector} from "./automation.js";
import {Quilt} from "./quilt.js";

// TODO: Everything below goes in "main"

const container = document.getElementById("container");
const quilt = new Quilt(container, {
    basePanelSize: 200,
    classPrefix: "panel",
    panelsPerRow: 12,
});

// TODO: Stuff the image definitions into a JSON array and load it here

const letters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

const pictures = [
    // Added 9/9
    "I10", "J2", "J3",
    // Missed
    "A2", " A5", "C4", "D1", "F2", "H1", "H2", "K8",
    // Added 9/4
    "A10", "A11", "A8", "C1", "E4", "E9", "G6", "H5", "H6", "I4", "I5", "I6", "J9", "K12", 
    // Original
    "F1",
    "C2",
    "B3", "E3", "I3", "L3",
    "G4", "K4",
    "C5", "D5", "F5",
    "B6", "E6", "J6",
    "E7", "G7", "J7", "K7",
    "C8", "H8",
    "K9",
    "C10", "G10", "J10", "L10",
    "E11", "H11",
    "D12",
];

for (let j = 0; j < letters.length; j++) {
    for (let i = 0; i < letters.length; i++) {
        const filename = `${letters[i]}${j + 1}`;
        const focusable = pictures.indexOf(filename) !== -1;
        const panel = new Panel({
            backgroundColor: "white",
            focusable: focusable,
            imageUrl: `images/${filename}.jpg`,
        });
        quilt.addPanel(panel);
    }
}

new AutoSelector(quilt, {delay: 4000, strategy: "sequential"});
