# Digital Quilt

A tool that can assemble a collection of images and a description of a "quilt"
(provided as a CSV file) into the assets required by the web app.

## Quilt Setup

You'll need a couple of things to generate the site:

1. a bunch of images that will make up some (or all) of the quilt panels
2. a spreadsheet that assigns images to locations on the quilt
3. another spreadsheet that assigns accent colors to locations on the quilt

Optionally, a third spreadsheet can be provided, in the same "shape" as first
two, with integer weights that control how often each of the images should be
highlighted in automation mode. The default weight is 1. A weight of 2
indicates, for example, that the corresponding image should be highlighted twice
as often as it would be by default.

The cells of the first spreadsheet should contain filenames. In the example
below the filenames reference the locations within the spreadsheet, but that is
not required. Cells that should not contain an image should be left blank.

```
A1.jpg | B1.jpg | C1.jpg
------------------------
A2.jpg |        | C2.jpg
------------------------
A3.jpg | B3.jpg | C3.jpg
```

The second spreadsheet should simply contain colors as hex strings, including
the "#" at the beginning. Every cell must have a color.

```
#febe10 | #b6797d | #eb1426
---------------------------
#b6797d | #eb1426 | #febe10
---------------------------
#eb1426 | #febe10 | #b6797d
```

Save both spreadsheets as plain CSV files, this is necessary to allow the Python
script to parse them reliably. Make sure that all the images referred to by the
first spreadsheet exist in a single directory. Now you're ready to generate the
site.

## Running the Generator

To build the quilt data, run `quilt.py`. See `--help` for options, but the only
required parameters are the color and image CSV files, passed as positional
arguments, in that order.

The default is to assume that the images to be used are in the current working
directory, but this is configurable.

By default, this will produce a directory called `quilt_data` that contains the
colored and resized images, along with a file called `metadata.json` that
provides the web application with the information it needs to render the quilt.
