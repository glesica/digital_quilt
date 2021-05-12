#!/usr/bin/env python3

from typing import Tuple

from PIL import Image

DEFAULT_OUTPUT = "output.jpg"
DEFAULT_SIZE = (100, 100)


def create_blank_image(color: str, size: Tuple[int, int]) -> Image:
    """
    Accept a color and size and create a blank image, totally filled with the
    given color.

    >>> b = create_blank_image("#ffffff", (100, 100))
    >>> b.size
    (100, 100)
    >>> b.getpixel((0, 0))
    (255, 255, 255)
    """
    return Image.new("RGB", size, color)


def _main():
    from argparse import ArgumentParser
    from sys import argv

    parser = ArgumentParser(
        "blank.py",
        description="Create a blank image filled with a solid color.")
    parser.add_argument("color", type=str, metavar="COLOR",
                        help="path to the image to overlay")
    parser.add_argument("-o", "--output", type=str, default=DEFAULT_OUTPUT,
                        metavar="PATH",
                        help="path to the desired output file")
    args = parser.parse_args(argv[1:])

    output_value = args.output if args.output else DEFAULT_OUTPUT

    blank_image = create_blank_image(args.color, DEFAULT_SIZE)
    blank_image.save(output_value)


if __name__ == "__main__":
    _main()
