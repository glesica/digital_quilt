#!/usr/bin/env python3

from csv import reader
from typing import TextIO, List, Optional

from PIL import Image

DEFAULT_IMAGE_SRC = "."
DEFAULT_IMAGE_DST = "quilt_data/"
METADATA_NAME = "metadata.json"


def load_color_table(in_file: TextIO) -> List[List[str]]:
    """
    Load cell color assignments from a CSV file. Each color is a hex code
    represented as a string (like "#ababab).
    """
    table_reader = reader(in_file)
    return [row for row in table_reader]


def load_image_table(in_file: TextIO) -> List[List[Optional[str]]]:
    """
    Load image assignments from a CSV file. Each cell in the file contains
    either a filename or the empty string to represent patches on the digital
    quilt that should only contain a color.
    """
    table_reader = reader(in_file)
    return [row for row in table_reader]


def load_weight_table(in_file: TextIO) -> List[List[int]]:
    """
    Load panel weights from a CSV file. These are integers that indicate
    how often a panel should be "focused". Default is 1. A value of 2, for
    example, will cause the panel to be focused, on average, twice as often
    as it would ordinarily.
    """
    table_reader = reader(in_file)

    def parse_weight(v):
        if v == "":
            return 1
        try:
            return int(float(v))
        except ValueError:
            return 1

    return [[parse_weight(v) for v in row] for row in table_reader]


def _error(msg: str):
    from sys import stderr
    stderr.write(f"[ERROR] {msg}\n")


def _info(msg: str):
    from sys import stderr
    stderr.write(f"[INFO] {msg}\n")


def _warning(msg: str):
    from sys import stderr
    stderr.write(f"[WARNING] {msg}\n")


def _main():
    from argparse import ArgumentParser
    import json
    from os import mkdir
    from os.path import join
    from sys import argv

    parser = ArgumentParser(
        "quilt.py",
        description="Create a quilt from a layout defined by CSV files.")
    parser.add_argument("colors", type=str, metavar="COLORS",
                        help="path to the colors table")
    parser.add_argument("images", type=str, metavar="IMAGES",
                        help="path to the images table")
    parser.add_argument("-s", "--src", type=str, default=DEFAULT_IMAGE_SRC,
                        metavar="DIR",
                        help="directory to load images from")
    parser.add_argument("-d", "--dst", type=str, default=DEFAULT_IMAGE_DST,
                        metavar="DIR",
                        help="directory to write images to")
    parser.add_argument("-w", "--weights", type=str, default=None,
                        metavar="WEIGHTS",
                        help="path to the weights table")
    args = parser.parse_args(argv[1:])

    with open(args.colors, "r") as colors_file:
        colors = load_color_table(colors_file)
    with open(args.images, "r") as images_file:
        images = load_image_table(images_file)

    src_value = args.src if args.src else DEFAULT_IMAGE_SRC
    dst_value = args.dst if args.dst else DEFAULT_IMAGE_DST
    meta_value = join(dst_value, METADATA_NAME)
    weights_value = args.weights if args.weights else None

    if weights_value:
        with open(args.weights, "r") as weights_file:
            weights = load_weight_table(weights_file)
    else:
        weights =[[1 for _ in colors[0]] for _ in colors]

    focusable: List[List[bool]] = [[True for _ in colors[0]] for _ in colors]

    try:
        mkdir(dst_value)
    except FileExistsError:
        _warning("output directory already exists")

    from .blank import create_blank_image, DEFAULT_SIZE
    from .overlay import create_color_overlay_image, DEFAULT_ALPHA
    from .resize import downsize_image, square_image, DEFAULT_DIM

    metadata = {
        "row_count": len(colors),
        "col_count": len(colors[0]),
        "paths": [["" for _ in colors[0]] for _ in colors],
        "weights": weights,
        "focusable": focusable,
    }

    for row_index, color_row in enumerate(colors):
        if row_index < len(images):
            image_row = images[row_index]
        else:
            image_row = ["" for _ in color_row]

        for col_index, color in enumerate(color_row):
            if col_index < len(image_row):
                image = image_row[col_index]
            else:
                image = ""

            if image:
                # we have an image
                output_file = Image.open(join(src_value, image))

                try:
                    output_file = create_color_overlay_image(output_file,
                                                             color,
                                                             DEFAULT_ALPHA)
                except Exception as e:
                    _error(f"failed to create overlay for {image}")
                    raise e

                try:
                    output_file = square_image(output_file)
                except Exception as e:
                    _error(f"failed to square {image}")
                    raise e

                try:
                    output_file = downsize_image(output_file, DEFAULT_DIM)
                except Exception as e:
                    _error(f"failed to downsize {image}")
                    raise e
            else:
                # blank color cell
                output_file = create_blank_image(color, DEFAULT_SIZE)
                focusable[row_index][col_index] = False

            output_filename = f"row{row_index}-col{col_index}.jpg"

            metadata["paths"][row_index][col_index] = output_filename
            output_file.save(join(dst_value, output_filename))

    with open(meta_value, "w") as meta_file:
        _info("writing metadata file")
        json.dump(metadata, meta_file)


if __name__ == "__main__":
    _main()
