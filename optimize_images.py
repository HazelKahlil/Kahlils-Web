from PIL import Image
import os
import shutil

# Config
SOURCE_DIR = 'images'
DEST_DIR = 'images_optimized'
MAX_WIDTH = 1600  # Aggressive optimization for speed
QUALITY = 75      # Web standard, visually acceptable

if not os.path.exists(DEST_DIR):
    os.makedirs(DEST_DIR)

print(f"🔄 Optimizing images from '{SOURCE_DIR}' to '{DEST_DIR}'...")

total_saved = 0
count = 0

for filename in os.listdir(SOURCE_DIR):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        count += 1
        filepath = os.path.join(SOURCE_DIR, filename)
        dest_path = os.path.join(DEST_DIR, filename)
        
        try:
            with Image.open(filepath) as img:
                # Convert to RGB if necessary (e.g. RGBA png to jpg)
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too huge
                original_width, original_height = img.size
                if original_width > MAX_WIDTH:
                    ratio = MAX_WIDTH / original_width
                    new_height = int(original_height * ratio)
                    img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
                
                # Save optimized
                img.save(dest_path, 'JPEG', quality=QUALITY, optimize=True)
                
                # Stats
                original_size = os.path.getsize(filepath)
                new_size = os.path.getsize(dest_path)
                saved = original_size - new_size
                total_saved += saved
                
                print(f"✅ {filename}: {original_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB")
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
            # Identify copy original if fail
            shutil.copy2(filepath, dest_path)

print("-" * 30)
print(f"🎉 Processed {count} images.")
print(f"💾 Total space saved: {total_saved/1024/1024:.2f} MB")
