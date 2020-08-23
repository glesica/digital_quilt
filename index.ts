/**
 * An abstraction around a grid of div elements representing a
 * "digital quilt". Clicking on a quilt panel will focus it,
 * making it bigger and optionally presenting additional information
 * about the panel.
 */
class Quilt {
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

    constructor(container: HTMLElement, options: {
        basePanelSize: number,
        classPrefix: string,
        panelsPerRow: number,
    }) {
        this.container = container;

        this.basePanelSize = options.basePanelSize * this.zoomLevel;
        this.currentPanelSize = this.basePanelSize;
        this.classPrefix = options.classPrefix;
        this.panelsPerRow = options.panelsPerRow;

        window.addEventListener("resize", this.layoutFocusedPanel.bind(this));
        window.addEventListener("keypress", (e: KeyboardEvent) => {
            // All keyboard shortcuts start with "ctrl"
            if (!e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
                return;
            }

            if (e.key === "i") {
                this.zoom(0.1);
            }

            if (e.key === "o") {
                this.zoom(-0.1);
            }

            if (e.key === "p") {
                this.resetZoom();
            }
        });
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

    addPanel(element: HTMLDivElement): void {
        element.addEventListener("mousedown", (e: MouseEvent) => {
            this.isDraggingOrClicking = true;
            e.preventDefault();
        });

        element.addEventListener("mousemove", (e: MouseEvent) => {
            if (!this.isDraggingOrClicking) {
                return;
            }

            this.didDrag = true;
            window.scrollBy({
                left: -e.movementX,
                top: -e.movementY,
            });
        });

        element.addEventListener("mouseup", (e: MouseEvent) => {
            if (!this.isDraggingOrClicking) {
                return;
            }

            if (!this.didDrag) {
                if (this.focusedElement !== null) {
                    this.defocusPanel();
                }
                this.focusPanel(element);
            }

            this.didDrag = false;
            this.isDraggingOrClicking = false;
        });

        element.classList.add("panel");
        element.classList.add(`panel-${this.panelCount}`);

        element.style.height = `${this.currentPanelSize}px`;
        element.style.width = `${this.currentPanelSize}px`;

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

        setTimeout(() => {
            clone.remove();
        }, 600);
    }

    focusPanel(element: HTMLDivElement): void {
        const clone = element.cloneNode(true) as HTMLDivElement;
        const offsets = Quilt.fixedPanelOffsets(window, element);

        clone.style.display = "block";
        clone.style.position = "fixed";
        clone.style.left = `${offsets.x}px`;
        clone.style.top = `${offsets.y}px`;

        clone.addEventListener("click", (e: MouseEvent) => {
            this.defocusPanel();
        });

        clone.addEventListener("mousemove", (e: MouseEvent) => {
            if (!this.isDraggingOrClicking) {
                return;
            }

            this.didDrag = true;
            window.scrollBy({
                left: -e.movementX,
                top: -e.movementY,
            });
        });

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
        const cloneSize = smallerDim - smallerDim * 0.1;

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
        <div class="details">
            <div class="title">${options.title}</div>
            <div class="author">${options.author}</div>
            <div class="description">${options.description}</div>
        </div>
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
    quilt.addPanel(element);
}
