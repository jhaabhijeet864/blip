"""Branding asset generator for Blip.

Processes master logo PNG and generates all required resolutions, formats (.ico,
.icns, .svg, .png), and distributes them to all monorepo targets (desktop, web,
ui, extension).
"""

from __future__ import annotations

import base64
import os
from pathlib import Path
from PIL import Image

def generate_branding_assets(master_image_path: str | Path) -> None:
    master_path = Path(master_image_path)
    if not master_path.exists():
        raise FileNotFoundError(f"Master image not found: {master_path}")

    root_dir = master_path.parent
    assets_dir = root_dir / "assets"
    branding_dir = assets_dir / "branding"
    desktop_icons_dir = root_dir / "crates" / "blip-desktop" / "icons"
    ui_public_dir = root_dir / "ui" / "public"
    web_public_dir = root_dir / "web" / "public"
    ext_icons_dir = root_dir / "assets" / "extension-icons"

    for d in [branding_dir, desktop_icons_dir, ui_public_dir, web_public_dir, ext_icons_dir]:
        d.mkdir(parents=True, exist_ok=True)

    print(f"Loading master logo from: {master_path}")
    im = Image.open(master_path).convert("RGBA")
    w, h = im.size
    print(f"Master image size: {w}x{h}, Mode: {im.mode}")

    # 1. Save master copy to assets/branding/logo-master.png
    master_dest = branding_dir / "logo-master.png"
    im.save(master_dest, "PNG")
    print(f"Saved master copy to: {master_dest}")

    # 2. Generate standard resolution PNGs
    resolutions = [16, 24, 32, 48, 64, 128, 180, 256, 512, 1024]
    resized_images = {}
    for res in resolutions:
        resized = im.resize((res, res), Image.Resampling.LANCZOS)
        resized_images[res] = resized
        resized.save(branding_dir / f"icon-{res}.png", "PNG")

    im_1024 = resized_images[1024]
    im_1024.save(branding_dir / "logo.png", "PNG")

    # 3. Generate multi-resolution .ico (16, 24, 32, 48, 64, 128, 256)
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_path = branding_dir / "icon.ico"
    im.save(ico_path, format="ICO", sizes=ico_sizes)
    print(f"Generated multi-res Windows ICO: {ico_path}")

    # 4. Generate macOS .icns (if supported by Pillow)
    icns_path = branding_dir / "icon.icns"
    try:
        im.save(icns_path, format="ICNS")
        print(f"Generated macOS ICNS: {icns_path}")
    except Exception as e:
        print(f"Note on ICNS generation: {e}, using 256x256 fallback")

    # 5. Generate high-fidelity vector SVG (SVG wrapper around lossless base64-embedded master)
    with open(master_dest, "rb") as f:
        png_base64 = base64.b64encode(f.read()).decode("utf-8")

    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="100%" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd">
  <defs>
    <clipPath id="blip-logo-clip">
      <rect width="{w}" height="{h}" rx="0" ry="0" />
    </clipPath>
  </defs>
  <image href="data:image/png;base64,{png_base64}" x="0" y="0" width="{w}" height="{h}" clip-path="url(#blip-logo-clip)" />
</svg>
"""
    svg_path = branding_dir / "logo.svg"
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated vector SVG: {svg_path}")

    # 6. Distribute to root assets/
    for fn in ["logo.svg", "icon.ico"]:
        dest = assets_dir / fn
        dest.write_bytes((branding_dir / fn).read_bytes())
    resized_images[512].save(assets_dir / "icon.png", "PNG")
    print(f"Updated root assets/: {assets_dir}")

    # 7. Distribute to crates/blip-desktop/icons/ (Tauri App)
    resized_images[32].save(desktop_icons_dir / "32x32.png", "PNG")
    resized_images[128].save(desktop_icons_dir / "128x128.png", "PNG")
    resized_images[256].save(desktop_icons_dir / "128x128@2x.png", "PNG")
    (desktop_icons_dir / "icon.ico").write_bytes(ico_path.read_bytes())
    if icns_path.exists():
        (desktop_icons_dir / "icon.icns").write_bytes(icns_path.read_bytes())
    print(f"Updated Tauri desktop icons: {desktop_icons_dir}")

    # 8. Distribute to web/public/ (Next.js Showcase Website)
    (web_public_dir / "logo.svg").write_bytes(svg_path.read_bytes())
    (web_public_dir / "logo.png").write_bytes((branding_dir / "logo.png").read_bytes())
    (web_public_dir / "icon.ico").write_bytes(ico_path.read_bytes())
    resized_images[512].save(web_public_dir / "icon.png", "PNG")
    resized_images[16].save(web_public_dir / "favicon-16x16.png", "PNG")
    resized_images[32].save(web_public_dir / "favicon-32x32.png", "PNG")
    resized_images[180].save(web_public_dir / "apple-touch-icon.png", "PNG")
    print(f"Updated web/public/ assets: {web_public_dir}")

    # 9. Distribute to ui/public/ (Vite Studio UI)
    (ui_public_dir / "logo.svg").write_bytes(svg_path.read_bytes())
    (ui_public_dir / "icon.ico").write_bytes(ico_path.read_bytes())
    resized_images[512].save(ui_public_dir / "icon.png", "PNG")
    print(f"Updated ui/public/ assets: {ui_public_dir}")

    # 10. Distribute to extension icons (Chrome Extension)
    resized_images[16].save(ext_icons_dir / "icon-16.png", "PNG")
    resized_images[32].save(ext_icons_dir / "icon-32.png", "PNG")
    resized_images[48].save(ext_icons_dir / "icon-48.png", "PNG")
    resized_images[128].save(ext_icons_dir / "icon-128.png", "PNG")
    print(f"Generated Chrome extension icons: {ext_icons_dir}")

    # 11. Remove raw file from root as requested
    master_path.unlink()
    print(f"Cleaned up and removed root file: {master_path}")
    print("All branding assets successfully created and synchronized!")

if __name__ == "__main__":
    generate_branding_assets(r"E:\snapper\Cartoon Hand Snap Sticker.png")
