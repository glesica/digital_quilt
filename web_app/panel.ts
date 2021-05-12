/**
 * A Panel represents a single piece of the digital quilt. It can
 * contain an image or color. If the panel is focusable then it can
 * grow and reposition itself when clicked by the user or focused
 * by one of the automation algorithms.
 */
export class Panel {
    readonly backgroundColor: string;

    readonly isFocusable: boolean;

    readonly imageUrl: string;

    /**
     * The panel weight determines how often it should be featured or otherwise
     * displayed within the overall quilt. A weight of 2, for example, will make
     * it roughly twice as likely to be featured than it would normally be.
     *
     * Only integers are allowed.
     */
    readonly weight: number;

    constructor({
                    backgroundColor = "#ffffff",
                    focusable = true,
                    imageUrl = "",
                    weight = 1,
                }: PanelConstructorParams) {
        this.backgroundColor = backgroundColor;
        this.isFocusable = focusable;
        this.imageUrl = imageUrl;
        this.weight = weight;
    }

    /**
     * Create an HTML element suitable for use as an un-focused panel, a single
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

export interface PanelConstructorParams {
    backgroundColor?: string,
    focusable?: boolean,
    imageUrl?: string,
    weight?: number,
}
