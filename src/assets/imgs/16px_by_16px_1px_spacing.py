#!/usr/bin/env python3
# 16px by 16px tilesheet, separated by 1px

from PIL import Image

im = Image.open(input('img path: '))

# copy 16px by max height pixels in intervals of 1px
col_block = 0
col_gap = 0
while col_block * 16 < im.width:
    box = (col_block * 16 + col_gap, 0,
           col_block * 16 + col_gap + 16, im.height)
    region = im.crop(box)
    im.paste(region, (col_block * 16, 0, col_block * 16 + 16, im.height))
    col_block += 1
    col_gap += 1

# copy max width by 16px pixels in intervals of 1px
row_block = 0
row_gap = 0
while row_block * 16 < im.height:
    box = (0, row_block * 16 + row_gap, im.width,
           row_block * 16 + row_gap + 16)
    region = im.crop(box)
    im.paste(region, (0, row_block * 16, im.width, row_block * 16 + 16))
    row_block += 1
    row_gap += 1

# delete the remainder of the image
# why -3 or - 2? I have no idea. It just works, so we'll just let that slide
out = im.crop((0, 0, (col_block - 3) * 16, (row_block - 2) * 16))
out.save(input('output path: '))
