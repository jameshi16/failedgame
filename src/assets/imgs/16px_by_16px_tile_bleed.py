#!/usr/bin/env python3
# 16px by 16px tilesheet (no spacing), which will become 18px by 18px
# Fixes some rendering issues caused due to tile bleed

from PIL import Image

im = Image.open(input('img path: '))

vertical_tile_no = int(im.height / 16)
horizontal_tile_no = int(im.width / 16)

new_im = Image.new('RGBA', (horizontal_tile_no * 18, vertical_tile_no * 18))

# copy the original tile into the middle of the 18px by 18px tile
# copy top pixels once upwards, and bottom pixels once downwards
# copy left pixels once leftwards, and right pixels once rightwards
for i in range(horizontal_tile_no):
    for j in range(vertical_tile_no):
        left = i * 16
        upper = j * 16
        left_new = i * 18
        upper_new = j * 18
        region = im.crop((left, upper, left + 16, upper + 16))
        new_im.paste(region, (left_new + 1, upper_new + 1, left_new + 17, upper_new + 17))

        region_upper = im.crop((left, upper, left + 16, upper + 1))
        region_lower = im.crop((left, upper + 15, left + 16, upper + 16))
        new_im.paste(region_upper, (left_new + 1, upper_new, left_new + 17, upper_new + 1))
        new_im.paste(region_lower, (left_new + 1, upper_new + 17, left_new + 17, upper_new + 18))

        region_left = new_im.crop((left_new + 1, upper_new, left_new + 2, upper_new + 18))
        region_right = new_im.crop((left_new + 16, upper_new, left_new + 17, upper_new + 18))
        new_im.paste(region_left, (left_new, upper_new, left_new + 1, upper_new + 18))
        new_im.paste(region_right, (left_new + 17, upper_new, left_new + 18, upper_new + 18))

# save image
new_im.save(input('output path: '))
