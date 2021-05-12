import {Quilt} from "./quilt";

/**
 * A class that can "automate" a quilt by focusing panels according to a
 * strategy.
 */
export class AutoSelector {
    /**
     * Time, in ms, between panel focuses.
     *
     * @private
     */
    private readonly delay: number;

    /**
     * The index of the panel chosen for focus. This is selected based on the
     * automation strategy.
     *
     * @private
     */
    private lastIndex: number = -1;

    /**
     * The quilt to automate.
     *
     * @private
     */
    private readonly quilt: Quilt;

    /**
     * Whether or not the auto selector is running, and therefore focusing
     * panels in the quilt.
     *
     * @private
     */
    private isRunning: boolean = false;

    /**
     * The strategy to use for selecting panels for focus.
     *
     *   * sequential - panels are focused one after another, left-to-right
     *     and top-to-bottom
     *   * random - panels are focused randomly, but with no repeats
     *
     * @private
     */
    private strategy: "sequential"|"random";

    constructor(quilt: Quilt, options: {delay: number}) {
        this.quilt = quilt;
        this.delay = options.delay;

        window.addEventListener("keypress", (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
                return;
            }

            if (e.key === "a" || e.key === "A") {
                if (this.isRunning) {
                    this.stop();
                } else {
                    this.start({strategy: "sequential"});
                }
            }

            if (e.key === "r" || e.key === "R") {
                if (this.isRunning) {
                    this.stop();
                } else {
                    this.start({strategy: "random"});
                }
            }

            e.preventDefault();
            e.stopPropagation();
        });
    }

    private async run(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        if (this.strategy === "sequential") {
            const panelCount = this.quilt.getPanelCount();

            do {
                this.lastIndex++;
                if (this.lastIndex >= panelCount) {
                    this.lastIndex = 0;
                }
            } while (!this.quilt.canFocus(this.lastIndex))
        }

        if (this.strategy === "random") {
            const weightTotal = this.quilt.getWeightTotal();

            const oldLastIndex = this.lastIndex;
            do {
                const index = Math.floor(Math.random() * weightTotal);
                this.lastIndex = this.quilt.getWeightedIndex(index);
            } while (!this.quilt.canFocus(this.lastIndex) || this.lastIndex === oldLastIndex)
        }

        await this.quilt.focusPanelByIndex(this.lastIndex);

        setTimeout(() => {
            if (this.isRunning) {
                this.run();
            }
        }, this.delay);
    }

    start(options: {strategy: "sequential"|"random"}): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.strategy = options.strategy;

        this.run();
    }

    stop(): void {
        this.isRunning = false;
    }
}
