#!/usr/bin/env python3
import os

# create an output directory
output_dir = "latin_texts"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

source_text_path = os.path.join("..", "LatinMarkovJS", "texts")

try:
    files = [
        filename
        for filename in os.listdir(source_text_path)
        if not filename.startswith(".")]
except FileNotFoundError:
    raise FileNotFoundError("Directory {} not found!".format(source_text_path))

for filename in files:
    print(filename)
    os.rename(os.path.join(source_text_path, filename), os.path.join(output_dir, filename))
