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
            if (!e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
                return;
            }

            if (e.key === "a") {
                if (this.running) {
                    this.stop();
                } else {
                    this.start({strategy: "sequential"});
                }
            }

            if (e.key === "r") {
                if (this.running) {
                    this.stop();
                } else {
                    this.start({strategy: "random"});
                }
            }
        });
    }

    private run(): void {
        const panelCount = this.quilt.getPanelCount();

        if (this.strategy === "sequential") {
            this.lastIndex++;
            if (this.lastIndex >= panelCount) {
                this.lastIndex = 0;
            }
        }

        if (this.strategy === "random") {
            this.lastIndex = Math.floor(Math.random() * panelCount);
        }

        this.quilt.defocusPanel();
        this.quilt.focusPanelByIndex(this.lastIndex);

        setTimeout(() => {
            if (this.running) {
                setTimeout(this.run.bind(this));
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
