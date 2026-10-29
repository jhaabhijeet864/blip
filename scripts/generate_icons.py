"""
Generate raster icons (.png and .ico) for Blip desktop application.
Uses Pillow to create a high-DPI squircle logo with gradient bolt.
"""

from pathlib import Path

from PIL import Image, ImageDraw


def generate_icons():
    root = Path(__file__).parent.parent
    assets_dir = root / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)

    size = 256
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Dark background squircle
    draw.rounded_rectangle([8, 8, size - 8, size - 8], radius=64, fill=(9, 9, 11, 255))

    # Floating particles (cyan, purple, pink)
    draw.ellipse([60, 80, 76, 96], fill=(96, 165, 250, 180))
    draw.ellipse([85, 60, 97, 72], fill=(167, 139, 250, 210))
    draw.ellipse([180, 70, 198, 88], fill=(244, 114, 182, 190))
    draw.ellipse([195, 110, 207, 122], fill=(96, 165, 250, 160))
    draw.ellipse([170, 185, 184, 199], fill=(192, 132, 252, 180))

    # Energy lightning bolt coordinates scaled to 256
    # Original SVG: M280 64 L144 288 h96 l-48 160 176-224 h-96 z
    pts = [
        (int(280 * size / 512), int(64 * size / 512)),
        (int(144 * size / 512), int(288 * size / 512)),
        (int(240 * size / 512), int(288 * size / 512)),
        (int(192 * size / 512), int(448 * size / 512)),
        (int(368 * size / 512), int(224 * size / 512)),
        (int(272 * size / 512), int(224 * size / 512))
    ]
    draw.polygon(pts, fill=(139, 92, 246, 255))

    # Save PNG
    png_path = assets_dir / "icon.png"
    img.save(png_path, format="PNG")
    print(f"Generated {png_path}")

    # Save multi-size Windows ICO
    ico_path = assets_dir / "icon.ico"
    img.save(ico_path, format="ICO", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    print(f"Generated {ico_path}")


if __name__ == "__main__":
    generate_icons()
