# Digital Quilt

A little web app, along with some supporting scripts, that displays a "digital
quilt" in a browser and allows the user to zoom in on each panel in the quilt to
see more detail.

## Project Layout

The `digital_quilt` subdirectory contains a Python tool that can be used to
assemble the assets required by the web app to display a "quilt".

The main directory contains a simple web app that can use the output of the
Python tool to display a "quilt" and provide some interactivity.

## Installation

The following are required:

  - Python 3
  - Pandoc

## Using the Site

The following interactions are supported:

  - `a` sequential auto select mode
  - `b` fit both dimensions to window
  - `f` fit smallest dimension to window
  - `i` zoom in
  - `o` zoom out
  - `p` reset zoom
  - `r` random auto select mode
  - mouse drag scrolls the quilt
  - clicking a panel focuses it
  - clicking the focused panel un-focuses it
