/**
 * A Panel represents a single piece of the digital quilt. It can
 * contain an image or color. If the panel is focusable then it can
 * grow and reposition itself when clicked by the user or focused
 * by one of the automation algorithms.
 */
class Panel {
    readonly backgroundColor: string;

    readonly focusable: boolean;

    readonly imageUrl: string;

    constructor({
                    backgroundColor = "#ffffff",
                    focusable = true,
                    imageUrl = "",
                }: PanelConstructorParams) {
        this.backgroundColor = backgroundColor;
        this.focusable = focusable;
        this.imageUrl = imageUrl;
    }

    /**
     * Create an HTML element suitable for use as a panel, a single
     * piece of the digital quilt.
     */
    asDomElement(): HTMLDivElement {
        const tempContainer = document.createElement("div") as HTMLDivElement;

        // Set the image tag component
        let imageTagHtml = "";
        if (this.imageUrl !== "") {
            imageTagHtml = `<img alt="Panel ${this.imageUrl}" src="${this.imageUrl}">`;
        }

        // The outer tag must be a div to make the types work
        const htmlString = `
<div class="image" style="background-color: ${this.backgroundColor}">
    ${imageTagHtml}
</div>`;
        tempContainer.innerHTML = htmlString.trim();

        return tempContainer.firstChild as HTMLDivElement;
    }
}

interface PanelConstructorParams {
    backgroundColor?: string,
    focusable?: boolean,
    imageUrl?: string,
}
