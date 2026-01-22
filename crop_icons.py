from PIL import Image, ImageOps
import os

SOURCE_IMG = '/Users/kahlilhazel/.gemini/antigravity/brain/2aed3e24-3389-4831-8b9e-c7e893d2c397/icon_set_sketchy_1768909036610.png'
OUTPUT_DIR = '/Users/kahlilhazel/.gemini/antigravity/scratch/ueda-style-portfolio/images'

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def process_icons():
    img = Image.open(SOURCE_IMG).convert("RGBA")
    width, height = img.size
    
    # Binarize for detection (in memory list or just logic)
    # Get grayscale data
    gray = img.convert("L")
    pixels = list(gray.getdata()) # flattened
    
    # 1. Project to X
    # We want to identify columns that have ANY black ink.
    # Ink is dark (< 200).
    
    has_ink_x = [False] * width
    for x in range(width):
        for y in range(height):
            # Index in flattened array
            val = pixels[y * width + x]
            if val < 200: # Threshold for "ink"
                has_ink_x[x] = True
                break
                
    # 2. Find segments
    segments = []
    in_ink = False
    start = 0
    
    for x in range(width):
        is_ink = has_ink_x[x]
        if is_ink:
            if not in_ink:
                start = x
                in_ink = True
        else:
            if in_ink:
                segments.append((start, x))
                in_ink = False
    if in_ink:
        segments.append((start, width))
        
    print(f"Initial segments: {segments}")
    
    # Merge close segments
    merged = []
    if segments:
        curr_start, curr_end = segments[0]
        for i in range(1, len(segments)):
            next_start, next_end = segments[i]
            if next_start - curr_end < 30: # Merge gap < 30px
                curr_end = next_end
            else:
                merged.append((curr_start, curr_end))
                curr_start, curr_end = next_start, next_end
        merged.append((curr_start, curr_end))
        
    print(f"Merged segments: {merged}")
    
    # Find Global Y bounds across all merged segments
    global_y_min = height
    global_y_max = 0
    
    # First pass: find global Y bounds
    for x1, x2 in merged:
        for x in range(x1, x2):
            for y in range(height):
                val = pixels[y * width + x]
                if val < 200:
                    if y < global_y_min: global_y_min = y
                    if y > global_y_max: global_y_max = y
    
    # Add padding to global bounds
    global_pad = 10
    g_y1 = max(0, global_y_min - global_pad)
    g_y2 = min(height, global_y_max + global_pad)
    
    print(f"Global Y Bounds: {g_y1} to {g_y2}")
    
    names = ['icon_instagram.png', 'icon_link.png', 'icon_mail.png']
    final_crops = []
    
    for x1, x2 in merged:
        # Crop using local X bounds but GLOBAL Y bounds
        pad_x = 10
        cx1 = max(0, x1 - pad_x)
        cx2 = min(width, x2 + pad_x)
        
        crop = img.crop((cx1, g_y1, cx2, g_y2))
        
        # Make Transparent
        datas = crop.getdata()
        newData = []
        for item in datas:
             if item[0] > 200 and item[1] > 200 and item[2] > 200:
                 newData.append((255, 255, 255, 0))
             else:
                 newData.append(item)
        crop.putdata(newData)
        final_crops.append(crop)
            
    # Save
    for i, crop in enumerate(final_crops[:3]):
        if i < len(names):
            p = os.path.join(OUTPUT_DIR, names[i])
            crop.save(p, "PNG")
            print(f"Saved {names[i]}")

if __name__ == "__main__":
    process_icons()
