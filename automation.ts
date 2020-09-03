import {Quilt} from "./quilt";

export class AutoSelector {
    private readonly delay: number;
    private lastIndex: number = -1;
    private readonly quilt: Quilt;
    private running: boolean = false;
    private strategy: "sequential"|"random";

    constructor(quilt: Quilt, options: {delay: number, strategy: "sequential"|"random"}) {
        this.quilt = quilt;
        this.delay = options.delay;
        this.strategy = options.strategy;

        window.addEventListener("keypress", (e: KeyboardEvent) => {
            // All keyboard shortcuts start with "ctrl"
            if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
                return;
            }

            if (e.key == "a" || e.key == "A") {
                if (this.running) {
                    this.stop();
                } else {
                    this.start({strategy: "sequential"});
                }
            }

            if (e.key == "r" || e.key == "R") {
                if (this.running) {
                    this.stop();
                } else {
                    this.start({strategy: "random"});
                }
            }

            e.preventDefault();
            e.stopPropagation();
        });
    }

    private run(): void {
        const panelCount = this.quilt.getPanelCount();

        if (this.strategy === "sequential") {
            do {
                this.lastIndex++;
                if (this.lastIndex >= panelCount) {
                    this.lastIndex = 0;
                }
            } while (!this.quilt.canFocus(this.lastIndex))
        }

        if (this.strategy === "random") {
            do {
                this.lastIndex = Math.floor(Math.random() * panelCount);
            } while (!this.quilt.canFocus(this.lastIndex))
        }

        this.quilt.defocusPanel();
        this.quilt.focusPanelByIndex(this.lastIndex);

        setTimeout(() => {
            if (this.running) {
                this.run();
            }
        }, this.delay);
    }

    start(options: {strategy: "sequential"|"random"}): void {
        if (this.running) {
            return;
        }

        this.strategy = options.strategy;

        this.running = true;
        this.run();
    }

    stop(): void {
        this.running = false;
    }
}
