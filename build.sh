#!/usr/bin/env sh

# Usage: ./build.sh <DATA DIR>

DATA_DIR=$1

python3 -m digital_quilt \
    -s $DATA_DIR \
    -d quilt_data \
    $DATA_DIR/colors.csv \
    $DATA_DIR/images.csv

