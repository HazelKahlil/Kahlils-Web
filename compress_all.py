#!/usr/bin/env python3
"""
二次压缩：将所有 WebP 重新压缩为更小体积
- 全尺寸：max 1440px, quality=60
- _md: max 960px, quality=55
- _sm: max 480px, quality=50
目标：每张图片 < 150KB
"""

import os
from PIL import Image

IMAGES_DIR = "images"
MAX_WIDTH = 1440
QUALITY_FULL = 60
SIZES = {"md": (960, 55), "sm": (480, 50)}
TARGET_MAX_KB = 150  # 目标：单张 < 150KB

def recompress(filepath):
    name_no_ext = os.path.splitext(os.path.basename(filepath))[0]
    
    # Skip sized variants (handled by parent)
    if name_no_ext.endswith("_md") or name_no_ext.endswith("_sm"):
        return
    
    original_size = os.path.getsize(filepath)
    
    try:
        with Image.open(filepath) as img:
            if img.mode in ("RGBA", "P", "LA"):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")
            
            w, h = img.size
            
            # Resize if over max
            if w > MAX_WIDTH:
                ratio = MAX_WIDTH / w
                new_h = int(h * ratio)
                img = img.resize((MAX_WIDTH, new_h), Image.Resampling.LANCZOS)
            
            # Save full-size with lower quality
            img.save(filepath, "WEBP", quality=QUALITY_FULL)
            new_size = os.path.getsize(filepath)
            
            # If still too large, try even lower quality
            if new_size > TARGET_MAX_KB * 1024:
                img.save(filepath, "WEBP", quality=45)
                new_size = os.path.getsize(filepath)
            
            savings = (1 - new_size / original_size) * 100 if original_size > 0 else 0
            status = "✅" if new_size <= TARGET_MAX_KB * 1024 else "⚠️"
            
            if savings > 1:  # Only print if actually changed
                print(f"  {status} {os.path.basename(filepath)}: {original_size//1024}KB → {new_size//1024}KB ({savings:.0f}%)")
            
            # Re-generate _md and _sm
            cur_w, cur_h = img.size
            for suffix, (max_w, quality) in SIZES.items():
                sized_filename = f"{name_no_ext}_{suffix}.webp"
                sized_path = os.path.join(IMAGES_DIR, sized_filename)
                if cur_w > max_w:
                    ratio = max_w / cur_w
                    sized_img = img.resize((max_w, int(cur_h * ratio)), Image.Resampling.LANCZOS)
                else:
                    sized_img = img.copy()
                sized_img.save(sized_path, "WEBP", quality=quality)
                
    except Exception as e:
        print(f"  ❌ Error: {filepath}: {e}")

def main():
    print("🗜️  二次压缩 — 目标 < 150KB/张")
    print("=" * 50)
    
    # Find all full-size WebP (not _md, _sm)
    files = sorted([
        os.path.join(IMAGES_DIR, f) 
        for f in os.listdir(IMAGES_DIR) 
        if f.endswith(".webp") and not f.endswith("_md.webp") and not f.endswith("_sm.webp")
    ])
    
    print(f"Processing {len(files)} full-size WebP files...\n")
    
    for f in files:
        recompress(f)
    
    # Stats
    total = sum(
        os.path.getsize(os.path.join(IMAGES_DIR, f))
        for f in os.listdir(IMAGES_DIR)
        if os.path.isfile(os.path.join(IMAGES_DIR, f))
    )
    
    over_limit = [
        f for f in os.listdir(IMAGES_DIR)
        if f.endswith(".webp") and not f.endswith("_md.webp") and not f.endswith("_sm.webp")
        and os.path.getsize(os.path.join(IMAGES_DIR, f)) > TARGET_MAX_KB * 1024
    ]
    
    print(f"\n{'=' * 50}")
    print(f"📦 Images total: {total // (1024*1024)}MB")
    if over_limit:
        print(f"⚠️  {len(over_limit)} files still > {TARGET_MAX_KB}KB:")
        for f in sorted(over_limit):
            sz = os.path.getsize(os.path.join(IMAGES_DIR, f))
            print(f"    {f}: {sz//1024}KB")
    else:
        print(f"✅ All files under {TARGET_MAX_KB}KB!")

if __name__ == "__main__":
    main()
