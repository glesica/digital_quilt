/**
 * An abstraction around a grid of div elements representing a
 * "digital quilt". Clicking on a quilt panel will focus it,
 * making it bigger and optionally presenting additional information
 * about the panel.
 */
class Quilt {
    private classPrefix: string;

    private readonly container: HTMLElement;

    private focusedElement?: HTMLDivElement = null;

    private originalElement?: HTMLDivElement = null;

    private panelCount: number = 0;

    private readonly panelsPerRow: number;

    constructor(container: HTMLElement, options: {
        classPrefix: string,
        panelsPerRow: number,
    }) {
        this.container = container;

        this.classPrefix = options.classPrefix;
        this.panelsPerRow = options.panelsPerRow;

        window.addEventListener("resize", this.layoutFocusedPanel.bind(this));
    }

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
        element.addEventListener("click", (e: MouseEvent) => {
            if (this.focusedElement !== null) {
                return;
            }
            this.focusPanel(element);
        });

        element.classList.add("panel");
        element.classList.add(`panel-${this.panelCount}`);

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
        clone.style.width = "";
        clone.style.height = "";

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

        document.body.append(clone);
        this.focusedElement = clone;
        this.originalElement = element;

        setTimeout(this.layoutFocusedPanel.bind(this), 20);
    }

    layoutFocusedPanel(): void {
        const clone = this.focusedElement;

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
}

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
    panelsPerRow: 25,
    classPrefix: "panel",
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
