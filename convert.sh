#!/usr/bin/env sh

set -e

# Convert all .png files in the given directory to .jpg and remove the original.
# Requires Imagemagick.

TARGET=${1:-'.'}

for png in `ls ${TARGET}/*.png 2> /dev/null`; do
    echo "$png"
    jpg="${png%png}jpg"
    convert "$png" "$jpg"
    rm "$png"
done

for png in `ls ${TARGET}/*.PNG 2> /dev/null`; do
    echo "$png"
    jpg="${png%PNG}jpg"
    convert "$png" "$jpg"
    rm "$png"
done

