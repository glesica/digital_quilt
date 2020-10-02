/**
 * An abstraction around a grid of div elements representing a
 * "digital quilt". Clicking on a quilt panel will focus it,
 * making it bigger and optionally presenting additional information
 * about the panel.
 */
export class Quilt {
    private readonly allowsFocus: Map<number, boolean> = new Map<number, boolean>();

    private readonly basePanelSize: number;

    private classPrefix: string;

    private readonly container: HTMLElement;

    private currentPanelSize: number;

    private didDrag: boolean = false;

    private focusedElement?: HTMLDivElement = null;

    private originalElement?: HTMLDivElement = null;

    private isDraggingOrClicking: boolean = false;

    private panelCount: number = 0;

    private readonly panelsPerRow: number;

    private zoomLevel: number = 1;

    constructor(container: HTMLElement, {
        basePanelSize = 200,
        classPrefix = "dq",
        panelsPerRow = 10,
    }: QuiltConstructorParams) {
        this.container = container;

        this.basePanelSize = basePanelSize * this.zoomLevel;
        this.currentPanelSize = this.basePanelSize;
        this.classPrefix = classPrefix;
        this.panelsPerRow = panelsPerRow;

        window.addEventListener("resize", this.layoutFocusedPanel.bind(this));
        window.addEventListener("keypress", (e: KeyboardEvent) => {
            // All keyboard shortcuts start with "ctrl"
            if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
                return;
            }

            if (e.key == "b" || e.key == "B") {
                this.fitToWindow({fitBoth: true});
            }

            if (e.key == "f" || e.key == "F") {
                this.fitToWindow({fitBoth: false});
            }

            if (e.key == "i" || e.key == "I") {
                this.zoom(0.1);
            }

            if (e.key == "o" || e.key == "O") {
                this.zoom(-0.1);
            }

            if (e.key == "p" || e.key == "P") {
                this.resetZoom();
            }

            e.preventDefault();
            e.stopPropagation();
        });

        const uiElements = document.getElementsByClassName("ui");
        for (let i = 0; i < uiElements.length; i++) {
            uiElements[i].addEventListener("mousemove", this.dragQuilt.bind(this));
        }
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

        element.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();
            this.isDraggingOrClicking = true;
        });

        element.addEventListener("mousemove", this.dragQuilt.bind(this));

        element.addEventListener("mouseup", (_: MouseEvent) => {
            if (!this.isDraggingOrClicking) {
                return;
            }

            if (!this.didDrag) {
                if (panel.focusable) {
                    if (this.focusedElement !== null) {
                        this.defocusPanel();
                    }
                    this.focusPanel(element);
                }
            }

            this.didDrag = false;
            this.isDraggingOrClicking = false;
        });

        element.classList.add("panel");
        element.classList.add(`panel-${this.panelCount}`);

        if (!panel.focusable) {
            element.classList.add("fixed");
        }

        element.style.height = `${this.currentPanelSize}px`;
        element.style.width = `${this.currentPanelSize}px`;

        this.allowsFocus[this.panelCount] = panel.focusable;

        this.container.append(element);
        this.panelCount++;

        if (this.panelCount % this.panelsPerRow === 0) {
            this.container.append(document.createElement("br"));
        }
    }

    defocusPanel(): void {
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

        // TODO: This delay needs to sync with the animation duration
        setTimeout(() => {
            clone.remove();
        }, 1100);
    }

    dragQuilt(e: {movementX: number, movementY: number}): void {
        if (!this.isDraggingOrClicking) {
            return;
        }

        this.didDrag = true;
        window.scrollBy({
            left: -e.movementX,
            top: -e.movementY,
        });
    }

    // TODO: Make this agnostic toward the container (window or not)
    fitToWindow(options: {fitBoth: boolean}): void {
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

        if (options.fitBoth) {
            this.zoomLevel = Math.min(widthFactor, heightFactor);
        } else {
            this.zoomLevel = Math.max(widthFactor, heightFactor);
        }

        this.layoutUnfocusedPanels();
    }

    canFocus(index: number): boolean {
        const actualIndex = index % this.panelCount;
        return this.allowsFocus[actualIndex] === true;
    }

    focusPanelByIndex(index: number): void {
        const actualIndex = index % this.panelCount;
        if (this.canFocus(actualIndex)) {
            const element = this.container.getElementsByClassName("panel")[actualIndex];
            this.focusPanel(element as HTMLDivElement);
        }
    }

    focusPanel(element: HTMLDivElement): void {
        const clone = element.cloneNode(true) as HTMLDivElement;
        const offsets = Quilt.fixedPanelOffsets(window, element);

        clone.style.display = "block";
        clone.style.position = "fixed";
        clone.style.left = `${offsets.x}px`;
        clone.style.top = `${offsets.y}px`;

        clone.addEventListener("click", (_: MouseEvent) => {
            this.defocusPanel();
        });

        clone.addEventListener("mousemove", this.dragQuilt.bind(this));

        document.body.append(clone);
        this.focusedElement = clone;
        this.originalElement = element;

        setTimeout(this.layoutFocusedPanel.bind(this), 20);
    }

    /**
     * Re-calculate the layout for the focused panel, if there is
     * one, when the container size changes. In most cases the
     * container will be the window.
     */
    layoutFocusedPanel(): void {
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

    layoutUnfocusedPanels(): void {
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

    resetZoom(): void {
        if (this.zoomLevel === 1) {
            return;
        }

        this.zoomLevel = 1;
        this.layoutUnfocusedPanels();
    }

    zoom(delta: number): void {
        const newZoomLevel = this.zoomLevel + delta;
        if (newZoomLevel === this.zoomLevel) {
            return;
        }
        this.zoomLevel = newZoomLevel;
        this.layoutUnfocusedPanels();
    }
}

interface QuiltConstructorParams {
    basePanelSize?: number,
    classPrefix?: string,
    panelsPerRow?: number,
}
