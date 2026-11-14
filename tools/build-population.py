#!/usr/bin/env python3
# Population density map for the "Population" layer (PRD F-24), built once and committed.
#
# Source: GHSL GHS-POP R2023A, epoch 2025, 30 arc seconds (about 1 km), European Commission JRC, CC BY 4.0.
# Needs gdal-bin and python3-gdal (numpy). Usage:
#   python3 tools/build-population.py GHS_POP_E2025_GLOBE_R2023A_4326_30ss_V1_0.tif site/data/population.png
# Output: 4096 x 2048 equirectangular greyscale PNG, value = log10(people per km² + 1) scaled so 255 = 100,000/km².
import sys, math, subprocess, tempfile, os
import numpy as np
from osgeo import gdal

src, out = sys.argv[1], sys.argv[2]
W, H = 4096, 2048
tmp = os.path.join(tempfile.mkdtemp(), 'sum.tif')
# people per output cell (the source covers -180..180, about -90..84; sum keeps the totals right)
gdal.Warp(tmp, src, width=W, height=H, outputBounds=(-180, -90, 180, 90), resampleAlg='sum', outputType=gdal.GDT_Float32, dstNodata=0)
a = gdal.Open(tmp).ReadAsArray().astype(np.float64)
a[~np.isfinite(a)] = 0; a[a < 0] = 0
print('total people', round(a.sum() / 1e9, 2), 'billion')
# cell area in km² by latitude
R = 6371.0088
lat = 90 - (np.arange(H) + 0.5) * 180 / H
area = (2 * math.pi * R / W) * (math.pi * R / H) * np.cos(np.radians(lat))
dens = a / area[:, None]
v = np.clip(np.log10(dens + 1) / 5 * 255, 0, 255).astype(np.uint8)
drv = gdal.GetDriverByName('MEM').Create('', W, H, 1, gdal.GDT_Byte)
drv.GetRasterBand(1).WriteArray(v)
gdal.GetDriverByName('PNG').CreateCopy(out, drv, options=['ZLEVEL=9'])
print('written', out, os.path.getsize(out), 'bytes; max density', int(dens.max()), '/km²')
