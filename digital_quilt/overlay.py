#!/usr/bin/env python3

from PIL import Image

DEFAULT_ALPHA = 0.5
DEFAULT_COLOR = "#000000"
DEFAULT_OUTPUT = "output.jpg"


def create_color_overlay_image(content_image: Image, color: str,
                               alpha: float) -> Image:
    """
    Accept a content image, in other words an image of something or someone, and
    overlay it on to a solid color with the given level of transparency (alpha).

    >>> c = Image.new("RGB", (100, 100), "#ffffff")
    >>> r = create_color_overlay_image(c, "#000000", 0.5)
    >>> r.size
    (100, 100)
    >>> r.getpixel((0, 0))
    (127, 127, 127)
    """
    rgb_content_image = content_image if content_image.mode == "RGB" else content_image.convert("RGB")
    base_image = Image.new("RGB", content_image.size, color)
    return Image.blend(base_image, content_image.convert("RGB"), alpha)


def _main():
    from argparse import ArgumentParser
    from sys import argv

    parser = ArgumentParser(
        "overlay.py",
        description="Create an overlay image using the given color as a base.")
    parser.add_argument("image", type=str, metavar="IMAGE",
                        help="path to the image to overlay")
    parser.add_argument("-a", "--alpha", type=float, default=DEFAULT_ALPHA,
                        help="transparency level for overlay")
    parser.add_argument("-c", "--color", type=str, default=DEFAULT_COLOR,
                        help="background color for final image")
    parser.add_argument("-o", "--output", type=str, default=DEFAULT_OUTPUT,
                        metavar="PATH",
                        help="path to the desired output file")
    args = parser.parse_args(argv[1:])

    alpha_value = args.alpha if args.alpha else DEFAULT_ALPHA
    color_value = args.color if args.color else DEFAULT_COLOR
    output_value = args.output if args.output else DEFAULT_OUTPUT

    content_image = Image.open(args.image)
    overlay_image = create_color_overlay_image(content_image, color_value, alpha_value)

    overlay_image.save(output_value)


if __name__ == "__main__":
    _main()
