#!/usr/bin/env python3
"""
批量压缩所有未优化的图片为 WebP，并更新 data.json 引用。
- 将 JPG/JPEG/PNG 转为 WebP (quality=80, max 1920px)
- 生成 _md (960px) 和 _sm (480px) 版本
- 更新 data.json 中的所有路径引用
- 删除原始文件
"""

import os
import json
import re
from PIL import Image

IMAGES_DIR = "images"
DATA_FILE = "data.json"
MAX_WIDTH = 1920
SIZES = {"md": 960, "sm": 480}
QUALITY_FULL = 80
QUALITY_SIZED = 75
EXTENSIONS = {".jpg", ".jpeg", ".png", ".tiff", ".bmp"}

def convert_image(filepath):
    """Convert a single image to WebP + generate sized variants."""
    name = os.path.splitext(os.path.basename(filepath))[0]
    ext = os.path.splitext(filepath)[1].lower()
    
    if ext not in EXTENSIONS:
        return None
    
    webp_filename = f"{name}.webp"
    webp_path = os.path.join(IMAGES_DIR, webp_filename)
    
    # Skip if WebP already exists
    if os.path.exists(webp_path):
        print(f"  ⏭  {webp_filename} already exists, skipping conversion")
        return webp_filename
    
    try:
        with Image.open(filepath) as img:
            # Convert mode
            if img.mode in ("RGBA", "P", "LA"):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")
            
            w, h = img.size
            original_size = os.path.getsize(filepath)
            
            # Resize if too large
            if w > MAX_WIDTH:
                ratio = MAX_WIDTH / w
                new_h = int(h * ratio)
                img = img.resize((MAX_WIDTH, new_h), Image.Resampling.LANCZOS)
                print(f"  📐 Resized: {w}x{h} → {MAX_WIDTH}x{new_h}")
            
            # Save full-size WebP
            img.save(webp_path, "WEBP", quality=QUALITY_FULL)
            webp_size = os.path.getsize(webp_path)
            savings = (1 - webp_size / original_size) * 100
            print(f"  ✅ {os.path.basename(filepath)} → {webp_filename} ({original_size//1024}KB → {webp_size//1024}KB, {savings:.0f}% saved)")
            
            # Generate sized variants
            cur_w, cur_h = img.size
            for suffix, max_w in SIZES.items():
                sized_filename = f"{name}_{suffix}.webp"
                sized_path = os.path.join(IMAGES_DIR, sized_filename)
                if cur_w > max_w:
                    ratio = max_w / cur_w
                    sized_img = img.resize((max_w, int(cur_h * ratio)), Image.Resampling.LANCZOS)
                else:
                    sized_img = img.copy()
                sized_img.save(sized_path, "WEBP", quality=QUALITY_SIZED)
            
            # Remove original
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"  ⚠️  Could not remove original: {e}")
            
            return webp_filename
    except Exception as e:
        print(f"  ❌ Error converting {filepath}: {e}")
        return None

def update_data_json(path_map):
    """Update all image paths in data.json."""
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    
    replacements = 0
    for old_path, new_path in path_map.items():
        if old_path in content:
            content = content.replace(old_path, new_path)
            replacements += 1
    
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"\n📝 data.json: {replacements} path(s) updated")

def main():
    print("🗜️  批量图片压缩 → WebP")
    print("=" * 50)
    
    # Find all non-WebP images
    files_to_convert = []
    for f in os.listdir(IMAGES_DIR):
        ext = os.path.splitext(f)[1].lower()
        if ext in EXTENSIONS:
            files_to_convert.append(os.path.join(IMAGES_DIR, f))
    
    if not files_to_convert:
        print("✨ No images to convert! All already optimized.")
        return
    
    print(f"Found {len(files_to_convert)} images to convert\n")
    
    # Convert all
    path_map = {}
    converted = 0
    for filepath in sorted(files_to_convert):
        basename = os.path.basename(filepath)
        webp_name = convert_image(filepath)
        if webp_name:
            # Map all possible reference formats
            old_ref = f"images/{basename}"
            new_ref = f"images/{webp_name}"
            if old_ref != new_ref:
                path_map[old_ref] = new_ref
            converted += 1
    
    # Update data.json
    if path_map:
        update_data_json(path_map)
    
    # Final stats
    print(f"\n{'=' * 50}")
    print(f"✅ Done! {converted}/{len(files_to_convert)} images converted")
    
    # Show new total size
    total = sum(os.path.getsize(os.path.join(IMAGES_DIR, f)) 
                for f in os.listdir(IMAGES_DIR) 
                if os.path.isfile(os.path.join(IMAGES_DIR, f)))
    print(f"📦 Images folder total: {total // (1024*1024)}MB")

if __name__ == "__main__":
    main()
