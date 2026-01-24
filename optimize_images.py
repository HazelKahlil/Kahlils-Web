import os
import json
import shutil
import sys
import subprocess

def install_pillow():
    try:
        import PIL
        print("✅ Pillow is already installed.")
    except ImportError:
        print("📦 Pillow not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        print("✅ Pillow installed.")

install_pillow()

from PIL import Image

# Configuration
SOURCE_DIR = 'images'
BACKUP_DIR = 'images_backup'
DATA_FILE = 'data.json'
MAX_WIDTH = 1920
QUALITY = 80
EXCLUDED_KEYWORDS = ['favicon', 'icon', 'logo'] # Keep these as original PNGs usually

def is_excluded(filename):
    for keyword in EXCLUDED_KEYWORDS:
        if keyword in filename.lower():
            return True
    return False

def optimize_images():
    print(f"🚀 Starting Image Optimization Pipeline...")
    
    # 1. Safety Backup
    if not os.path.exists(BACKUP_DIR):
        print(f"📂 Creating backup directory: {BACKUP_DIR}")
        shutil.copytree(SOURCE_DIR, BACKUP_DIR)
    else:
        print(f"📂 Backup directory already exists. Skipping backup to avoid overwriting initial state.")

    optimized_count = 0
    total_saved_bytes = 0
    mapping = {} # Old filename -> New filename

    files = [f for f in os.listdir(SOURCE_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    for filename in files:
        if is_excluded(filename):
            print(f"⏩ Skipping excluded file: {filename}")
            continue

        filepath = os.path.join(SOURCE_DIR, filename)
        fname, ext = os.path.splitext(filename)
        new_filename = f"{fname}.webp"
        new_filepath = os.path.join(SOURCE_DIR, new_filename)
        
        try:
            with Image.open(filepath) as img:
                # Convert to RGB if needed (but WebP supports transparency, so RGBA is fine)
                # If RGB is needed (e.g. erratic png), handle it. WebP handles RGBA nicely.
                
                # Resize logic
                w, h = img.size
                if w > MAX_WIDTH:
                    ratio = MAX_WIDTH / w
                    new_h = int(h * ratio)
                    img = img.resize((MAX_WIDTH, new_h), Image.Resampling.LANCZOS)
                    print(f"   📉 Resized {filename}: {w}x{h} -> {MAX_WIDTH}x{new_h}")
                
                # Save as WebP
                img.save(new_filepath, 'WEBP', quality=QUALITY)
                
                # Calculate stats
                orig_size = os.path.getsize(filepath)
                new_size = os.path.getsize(new_filepath)
                saved = orig_size - new_size
                
                if saved > 0:
                    total_saved_bytes += saved
                    # If webp is smaller, we use it. We record the mapping.
                    mapping[filename] = new_filename
                    print(f"✅ Converted {filename} -> {new_filename} ({new_size/1024:.1f}KB, -{saved/orig_size*100:.1f}%)")
                    
                    # Optional: Remove original if you want to save space, 
                    # BUT for safety in this script we keep them. 
                    # The backup is already there, but let's keep directory clean?
                    # No, let's keep originals in place for now to avoid broken links if something goes wrong 
                    # before we update json.
                else:
                    print(f"⚠️ WebP was larger for {filename}? keeping original.")
                    # In rare cases, we might strictly prefer original. 
                    # But usually we want consistency. Let's stick with WebP for consistency 
                    # unless it's huge difference.
                    mapping[filename] = new_filename

                optimized_count += 1
                
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")

    print(f"✨ Optimization complete. {optimized_count} images processed.")
    print(f"💾 Total estimated bandwidth saved per full load: {total_saved_bytes/1024/1024:.2f} MB")
    
    return mapping

def update_data_json(mapping):
    print("🔄 Updating data.json references...")
    
    if not os.path.exists(DATA_FILE):
        print("❌ data.json not found!")
        return

    # Backup data.json
    shutil.copy(DATA_FILE, f"{DATA_FILE}.bak")
    
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Naive string replacement is risky if filenames are subsets of each other.
    # Better to parse JSON, traverse, and replace.
    try:
        data = json.loads(content)
        
        def recursive_replace(obj):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    obj[k] = recursive_replace(v)
            elif isinstance(obj, list):
                return [recursive_replace(i) for i in obj]
            elif isinstance(obj, str):
                # Check if this string looks like a path to an optimized image
                # We need to match exact filenames roughly
                for old_name, new_name in mapping.items():
                    # We look for "images/OldName" or just "OldName"
                    if old_name in obj:
                        # Be careful not to replace partial matches if names are short
                        # e.g. "1.jpg" vs "11.jpg".
                        # So we replace "images/1.jpg" with "images/1.webp" safely
                        # or "/1.jpg" with "/1.webp"
                        
                        # Simplest robust way: 
                        # if the string ENDS with the filename, replace it.
                        if obj.endswith(old_name):
                             return obj.replace(old_name, new_name)
            return obj

        new_data = recursive_replace(data)
        
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=2, ensure_ascii=False)
            
        print("✅ data.json updated successfully.")
        
    except json.JSONDecodeError:
        print("❌ Failed to parse data.json. Skipping update.")

if __name__ == "__main__":
    mapping = optimize_images()
    if mapping:
        update_data_json(mapping)
