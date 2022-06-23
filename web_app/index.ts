import {AutoSelector} from "./automation.js";
import {Metadata} from "./metadata.js";
import {Panel} from "./panel.js";
import {Quilt} from "./quilt.js";

async function loadQuilt() {
    const response = await fetch("quilt_data/metadata.json");
    const metadata = await response.json() as Metadata;

    const container = document.getElementById("container");
    const quilt = new Quilt(container, {
        basePanelSize: 200,
        panelsPerRow: metadata.col_count,
    });

    for (let row_index = 0; row_index < metadata.row_count; row_index++) {
        for (let col_index = 0; col_index < metadata.col_count; col_index++) {
            const path = metadata.paths[row_index][col_index];
            const weight = metadata.weights[row_index][col_index];
            const focusable = metadata.focusable[row_index][col_index];
            const panel = new Panel({
                backgroundColor: "white",
                focusable: focusable,
                imageUrl: `quilt_data/${path}`,
                weight: weight,
            });
            quilt.addPanel(panel);
        }
    }

    quilt.layoutAll();

    new AutoSelector(quilt, {delay: 12000});
}

loadQuilt().then(_ => {
    console.log("quilt loaded");
}).catch(e => {
    console.log("error on quilt load");
    console.error(e);
});
