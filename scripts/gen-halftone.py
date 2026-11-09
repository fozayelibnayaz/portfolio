#!/usr/bin/env python3
"""Build the hero's halftone portrait from the real photograph.

Output is *transparent*: white dots whose alpha carries the tone, so the
figure composites onto any surface. An earlier version baked the black
background into the PNG, which looked right on the dark theme and showed up
as a green rectangle on the light one.

Dots are drawn at 3x and downsampled, then the whole alpha channel is
multiplied by a smooth head-centred falloff so the figure dissolves into the
page with no edge to find.

    python3 scripts/gen-halftone.py
    node scripts/encode-portraits.mjs   # -> avif/webp at 400/560
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SRC = Path("src/assets/avatar.jpg")

OUT = Path("public/img/portrait-halftone.png")
SIZE = 640          # final size, kept small: it is a background figure
SS = 3              # supersample factor for round dots
CELL = 6            # dot grid pitch at final size


def main() -> None:
    src = Image.open(SRC).convert("L")

    # Square crop, biased to the face. The photograph is a head shot, so a
    # little zoom reads better at background scale than the full frame.
    w, h = src.size
    side = int(min(w, h) * 0.92)
    left = (w - side) // 2
    top = int((h - side) * 0.34)
    src = src.crop((left, top, left + side, top + side)).resize(
        (SIZE * SS, SIZE * SS), Image.LANCZOS
    )

    # Contrast: a halftone needs a hard black point or the face turns to mush.
    src = src.point(lambda v: max(0, min(255, int((v - 26) * 1.55))))

    big = SIZE * SS
    dots = Image.new("L", (big, big), 0)
    draw = ImageDraw.Draw(dots)

    pitch = CELL * SS
    steps = big // pitch
    for gy in range(steps):
        for gx in range(steps):
            box = (gx * pitch, gy * pitch, (gx + 1) * pitch, (gy + 1) * pitch)
            tone = 255 - src.crop(box).resize((1, 1), Image.BOX).getpixel((0, 0))
            if tone < 12:
                continue
            # Dots must never merge into a solid mass: a black blazer would
            # otherwise halftone to one big rectangle. Cap the radius just
            # under half a pitch so the screen stays visible everywhere.
            coverage = 0.9 * (tone / 255) ** 1.04
            r = (pitch * 0.48) * (coverage ** 0.6)
            cx = box[0] + pitch / 2
            cy = box[1] + pitch / 2
            draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)

    dots = dots.resize((SIZE, SIZE), Image.LANCZOS)

    # Falloff: opaque over the head, gone well before any edge. Per pixel —
    # sampling a mask per tile leaves visible rectangular banding.
    from PIL import ImageChops

    mask = Image.new("L", (SIZE, SIZE), 0)
    mdraw = ImageDraw.Draw(mask)
    cx, cy = SIZE * 0.5, SIZE * 0.44
    rx, ry = SIZE * 0.39, SIZE * 0.44
    mdraw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(SIZE * 0.07))

    fade = Image.new("L", (SIZE, SIZE), 255)
    fdraw = ImageDraw.Draw(fade)
    for y in range(SIZE):
        t = y / (SIZE - 1)
        v = 255 if t < 0.6 else int(255 * max(0.0, 1 - ((t - 0.6) / 0.38) ** 1.3))
        fdraw.line((0, y, SIZE, y), fill=v)

    alpha = ImageChops.multiply(ImageChops.multiply(dots, mask), fade)

    # One screen, two inks.
    #
    # Tone lives in alpha: dots are thick where the photograph is dark. On the
    # dark theme they read as printed light; on the pale studio theme CSS
    # drops them to near-black so they read as ink on paper. One file, one
    # filter — no inverted face, no second download.
    OUT.parent.mkdir(parents=True, exist_ok=True)

    # White, not mint: colour costs 2x in AVIF for a pattern this dense, and
    # CSS can ink it. The reference hero is a light halftone on black anyway.
    out = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    out.putalpha(alpha)
    out.save(OUT)
    print(f"{OUT} {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
