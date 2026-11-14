#!/usr/bin/env python3
# Population density map for the "Population" layer (PRD F-24), built once and committed.
#
# Source: GHSL GHS-POP R2023A, epoch 2025, 30 arc seconds (about 1 km), European Commission JRC, CC BY 4.0.
# Needs python3-gdal (with numpy). Reads the source row by row, so it fits in little memory. Usage:
#   python3 tools/build-population.py GHS_POP_E2025_GLOBE_R2023A_4326_30ss_V1_0.tif site/data/population.png
# Output: 4320 x 2160 equirectangular greyscale PNG (5 arc minutes per pixel),
# value = log10(people per km² + 1) / 5 * 255, so 255 means 100,000 people per km².
import sys, math
import numpy as np
from osgeo import gdal
gdal.UseExceptions()

src, out = sys.argv[1], sys.argv[2]
W, H = 4320, 2160
ds = gdal.Open(src)
band = ds.GetRasterBand(1)
x0, dx, _, y0, _, dy = ds.GetGeoTransform()
sw, sh = ds.RasterXSize, ds.RasterYSize
print('source', sw, sh, 'origin', x0, y0, 'step', dx, dy)
acc = np.zeros((H, W), dtype=np.float64)
# output column for every source column, output row for every source row (cell centres)
col = np.clip(((x0 + (np.arange(sw) + 0.5) * dx + 180) / 360 * W).astype(np.int64), 0, W - 1)
STEP = 64
for r0 in range(0, sh, STEP):
    n = min(STEP, sh - r0)
    a = band.ReadAsArray(0, r0, sw, n).astype(np.float64)
    a[~np.isfinite(a)] = 0; a[a < 0] = 0
    lat = y0 + (r0 + np.arange(n) + 0.5) * dy
    row = np.clip(((90 - lat) / 180 * H).astype(np.int64), 0, H - 1)
    for k in range(n):
        acc[row[k]] += np.bincount(col, weights=a[k], minlength=W)
print('total people', round(acc.sum() / 1e9, 2), 'billion')
R = 6371.0088
latc = 90 - (np.arange(H) + 0.5) * 180 / H
area = (2 * math.pi * R / W) * (math.pi * R / H) * np.cos(np.radians(latc))
dens = acc / area[:, None]
v = np.clip(np.log10(dens + 1) / 5 * 255, 0, 255).astype(np.uint8)
mem = gdal.GetDriverByName('MEM').Create('', W, H, 1, gdal.GDT_Byte)
mem.GetRasterBand(1).WriteArray(v)
gdal.GetDriverByName('PNG').CreateCopy(out, mem, options=['ZLEVEL=9'])
import os
print('written', out, os.path.getsize(out), 'bytes; max density', int(dens.max()), 'per km²')
