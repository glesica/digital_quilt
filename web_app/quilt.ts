import {Panel} from "./panel.js";

/**
 * An abstraction around a grid of div elements representing a
 * "digital quilt". Clicking on a quilt panel will focus it,
 * making it bigger and optionally presenting additional information
 * about the panel.
 */
export class Quilt {
    private readonly allowsFocus: Map<number, boolean> = new Map<number, boolean>();

    private readonly basePanelSize: number;

    private readonly container: HTMLElement;

    private currentPanelSize: number;

    private focusedElement?: HTMLDivElement = null;

    private originalElement?: HTMLDivElement = null;

    private panelCount: number = 0;

    private readonly panelsPerRow: number;

    private readonly weightedIndices: Array<number> = [];

    private zoomLevel: number = 1;

    constructor(container: HTMLElement, {
        basePanelSize = 200,
        panelsPerRow = 10,
    }: QuiltConstructorParams) {
        this.container = container;
        container.textContent = "";

        this.basePanelSize = basePanelSize * this.zoomLevel;
        this.currentPanelSize = this.basePanelSize;
        this.panelsPerRow = panelsPerRow;

        window.addEventListener("resize", this.layoutAll.bind(this));
    }

    /**
     * A function to do the math for where the focused panel should
     * start and end its zoom-in and zoom-out animations, respectively.
     *
     * The calculation is a bit complicated because we use
     * `position: fixed` on the focused panel, which means that its
     * position is computed relative to the viewport, whereas the
     * unfocused panel positions are relative to the document.
     *
     * `container` is the DOM element into which the quilt is mounted,
     * usually the window itself.
     *
     * `element` is the original (unfocused) panel DOM element.
     */
    static fixedPanelOffsets(
        container: { scrollX: number, scrollY: number },
        element: { offsetLeft: number, offsetTop: number })
        : { x: number, y: number } {

        const leftScroll = container.scrollX;
        const topScroll = container.scrollY;

        const originalOffsetLeft = element.offsetLeft;
        const originalOffsetTop = element.offsetTop;

        return {
            x: originalOffsetLeft - leftScroll,
            y: originalOffsetTop - topScroll,
        };
    }

    addPanel(panel: Panel): void {
        const element = panel.asDomElement();

        if (panel.isFocusable) {
            element.addEventListener("click", async (_: MouseEvent) => {
                await this.focusPanel(element);
            });
        } else {
            element.classList.add("fixed");
        }

        element.classList.add("panel");
        element.classList.add(`panel-${this.panelCount}`);

        element.style.height = `${this.currentPanelSize}px`;
        element.style.width = `${this.currentPanelSize}px`;

        this.allowsFocus[this.panelCount] = panel.isFocusable;

        const roundedWeight = Math.round(panel.weight);
        for (let i = 0; i < roundedWeight; i++) {
            this.weightedIndices.push(this.panelCount);
        }

        this.container.append(element);
        this.panelCount++;

        if (this.panelCount % this.panelsPerRow === 0) {
            this.container.append(document.createElement("br"));
        }
    }

    async defocusPanel(): Promise<void> {
        if (this.focusedElement === null) {
            return;
        }

        const clone = this.focusedElement;
        const element = this.originalElement;
        const offsets = Quilt.fixedPanelOffsets(window, element);

        clone.style.left = `${offsets.x}px`;
        clone.style.top = `${offsets.y}px`;
        clone.style.width = `${this.currentPanelSize}px`;
        clone.style.height = `${this.currentPanelSize}px`;

        this.focusedElement = null;
        this.originalElement = null;

        return new Promise<void>((resolve, _reject) => {
            // TODO: This delay needs to sync with the animation duration
            setTimeout(() => {
                clone.remove();
                resolve();
            }, 1100);
        })
    }

    // TODO: Make this agnostic toward the container (window or not)
    fitToWindow(): void {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        // count quilt grid width and height
        const gridWidth = this.panelsPerRow;
        const gridHeight = Math.ceil(this.panelCount / this.panelsPerRow)

        // multiply out based on patch width and height
        const gridPixelWidth = gridWidth * this.basePanelSize;
        const gridPixelHeight = gridHeight * this.basePanelSize;

        // find scale that will show everything
        const widthFactor = containerWidth / gridPixelWidth;
        const heightFactor = containerHeight / gridPixelHeight;

        this.zoomLevel = Math.max(widthFactor, heightFactor);
    }

    canFocus(index: number): boolean {
        const actualIndex = index % this.panelCount;
        return this.allowsFocus[actualIndex] === true;
    }

    async focusPanelByIndex(index: number): Promise<void> {
        const actualIndex = index % this.panelCount;
        if (this.canFocus(actualIndex)) {
            const element = this.container.getElementsByClassName("panel")[actualIndex];
            await this.focusPanel(element as HTMLDivElement);
        }
    }

    async focusPanel(element: HTMLDivElement): Promise<void> {
        await this.defocusPanel();

        const clone = element.cloneNode(true) as HTMLDivElement;
        const offsets = Quilt.fixedPanelOffsets(window, element);

        clone.style.display = "block";
        clone.style.position = "fixed";
        clone.style.left = `${offsets.x}px`;
        clone.style.top = `${offsets.y}px`;

        clone.addEventListener("click", (_: MouseEvent) => {
            this.defocusPanel();
        });

        document.body.append(clone);
        this.focusedElement = clone;
        this.originalElement = element;

        return new Promise<void>((resolve, _reject) => {
            setTimeout(() => {
                this.layoutFocusedPanel();
                resolve();
            }, 20);
        });
    }

    layoutAll(): void {
        this.layoutUnfocusedPanels();
        this.layoutFocusedPanel();
    }

    /**
     * Re-calculate the layout for the focused panel, if there is
     * one, when the container size changes. In most cases the
     * container will be the window.
     */
    private layoutFocusedPanel(): void {
        const clone = this.focusedElement;

        if (clone === null) {
            return;
        }

        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const smallerDim = Math.min(viewportHeight, viewportWidth);
        const cloneSize = smallerDim - smallerDim * 0.3;

        const leftOffset = 0.5 * (viewportWidth - cloneSize);
        const topOffset = 0.5 * (viewportHeight - cloneSize);

        clone.style.left = `${leftOffset}px`;
        clone.style.top = `${topOffset}px`;
        clone.style.width = `${cloneSize}px`;
        clone.style.height = `${cloneSize}px`;

        const cloneClasses = clone.classList;
        cloneClasses.add("zoomed");
    }

    private layoutUnfocusedPanels(): void {
        this.fitToWindow();
        this.currentPanelSize = this.basePanelSize * this.zoomLevel;

        const panels = this.container.getElementsByClassName("panel");
        for (let i = 0; i < panels.length; i++) {
            const panel = panels[i] as HTMLDivElement;
            panel.style.height = `${this.currentPanelSize}px`;
            panel.style.width = `${this.currentPanelSize}px`;
        }
    }

    getPanelCount(): number {
        return this.panelCount;
    }

    getWeightTotal(): number {
        return this.weightedIndices.length;
    }

    getWeightedIndex(index: number): number {
        const wrappedIndex = index % this.weightedIndices.length;
        return this.weightedIndices[wrappedIndex];
    }
}

interface QuiltConstructorParams {
    basePanelSize?: number,
    panelsPerRow?: number,
}
