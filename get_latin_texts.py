#!/usr/bin/env python3
import os
import re

from shutil import copyfile


# create an output directory
output_dir = "latin_texts"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

source_text_path = os.path.join("..", "LatinMarkovJS", "texts")

# get the list of files in the source directory
try:
    files = [
        filename
        for filename in os.listdir(source_text_path)
        if not filename.startswith(".")]
except FileNotFoundError:
    raise FileNotFoundError("Directory {} not found!".format(source_text_path))

# get the files currently contained in latin_texts
current_files = [
    filename
    for filename in os.listdir(output_dir)
    if not filename.startswith(".")]

# find out what files in the source directory are new
new_files = [filename for filename in files if filename not in current_files]

# copy the new texts over
print("Copying texts...")
if new_files:
    for filename in new_files:
        print(filename)
        copyfile(os.path.join(source_text_path, filename), os.path.join(output_dir, filename))
else:
    print("No new files!")

# read in game.html in order to update it with script tags for each of the new files added;
# each new script tag will have the class "training-text"
with open("game.html", "r") as gf:
    game_file = gf.read()

script_tags = "\n        ".join(
    ['<script class="training-text" src="latin_texts/{}"></script>'.format(filename)
     for filename in new_files]) + "\n        "
new_game_file = re.sub('(<script src="helper.js"></script>\n        )', "\\1{}".format(script_tags), game_file)

with open("game.html", "w") as gf:
    gf.write(new_game_file)
