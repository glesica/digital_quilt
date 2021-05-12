#!/usr/bin/env python3

from PIL import Image as image
from PIL.Image import Image

DEFAULT_DIM = 1000
DEFAULT_OUTPUT = "output.jpg"


def square_image(content: Image) -> Image:
    """
    Accept an image and "square" it, in other words crop it along its larger
    dimension so that it is square (same height and width).

    >>> c = image.new("RGB", (200, 100), "#ffffff")
    >>> r = square_image(c)
    >>> r.size
    (100, 100)
    """
    (w, h) = content.size
    box = None

    if h > w:
        diff = h - w
        top_offset = int(diff / 2)
        bottom_offset = diff - top_offset
        box = (0, top_offset, w, h - bottom_offset)
    if w > h:
        diff = w - h
        left_offset = int(diff / 2)
        right_offset = diff - left_offset
        box = (left_offset, 0, w - right_offset, h)

    if box is None:
        return content

    return content.crop(box)


def downsize_image(content: Image, dim: int) -> Image:
    (w, h) = content.size

    if h != w:
        raise ValueError("image is not square")

    if h <= dim:
        return content.copy()

    return content.resize((dim, dim))


def _main():
    from argparse import ArgumentParser
    from sys import argv

    parser = ArgumentParser(
        "resize.py",
        description="Resize and square an image.")
    parser.add_argument("image", type=str, metavar="IMAGE",
                        help="path to the image to resize")
    parser.add_argument("-d", "--dim", type=int, default=DEFAULT_DIM,
                        metavar="DIM",
                        help="desired square dimension for the image")
    parser.add_argument("-o", "--output", type=str, default=DEFAULT_OUTPUT,
                        metavar="PATH",
                        help="path to the desired output file")
    args = parser.parse_args(argv[1:])

    dim_value = args.dim if args.dim else DEFAULT_DIM
    output_value = args.output if args.output else DEFAULT_OUTPUT

    content_image = image.open(args.image)

    squared_image = square_image(content_image)
    resized_image = downsize_image(squared_image, dim_value)
    resized_image.save(output_value)


if __name__ == "__main__":
    _main()
