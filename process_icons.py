
import os
import sys

try:
    from PIL import Image, ImageOps, ImageFilter
except ImportError:
    print("PIL not found. Please install Pillow.")
    sys.exit(1)

def process_icon(input_path, output_dir):
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        print(f"Processing {input_path}...")
        
        # Open the image
        img = Image.open(input_path).convert("RGBA")
        
        # 1. Create a Mask from the White Pixels
        gray = img.convert("L")
        threshold_val = 220
        mask = gray.point(lambda p: 255 if p > threshold_val else 0)
        
        # 2. Crop to Content (Bounding Box)
        bbox = mask.getbbox()
        if bbox:
            mask_c = mask.crop(bbox)
        else:
            print("No white content found! Using full image.")
            mask_c = mask
            
        # 3. Resize Logic with Scaling Down
        canvas_size = 128
        scale_factor = 0.7 # Kept the reduced size
        content_size = int(canvas_size * scale_factor)
        
        mask_resized = mask_c.resize((content_size, content_size), Image.Resampling.LANCZOS)
        
        final_mask = Image.new('L', (canvas_size, canvas_size), 0)
        offset = (canvas_size - content_size) // 2
        final_mask.paste(mask_resized, (offset, offset))
        
        # 4. Generate Output Icons with Specific Colors
        
        # A. Light Mode Icon -> #6D6D6D (Same as previous step, user didn't ask to change this one)
        icon_light = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        color_day = (109, 109, 109, 255) # #6D6D6D
        fill_layer_light = Image.new("RGBA", (canvas_size, canvas_size), color_day)
        icon_light.paste(fill_layer_light, (0, 0), mask=final_mask)
        
        path_light = os.path.join(output_dir, "icon_theme_light.png")
        icon_light.save(path_light)
        print(f"Saved {path_light} (Color: #6D6D6D)")
        
        # B. Dark Mode Icon -> #CCCCCC (Updated from #9E9E9E)
        # RGB: (204, 204, 204)
        icon_dark = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0)) 
        color_night = (204, 204, 204, 255) # #CCCCCC
        fill_layer_dark = Image.new("RGBA", (canvas_size, canvas_size), color_night)
        icon_dark.paste(fill_layer_dark, (0, 0), mask=final_mask)
        
        path_dark = os.path.join(output_dir, "icon_theme_dark.png")
        icon_dark.save(path_dark)
        print(f"Saved {path_dark} (Color: #CCCCCC)")
        
    except Exception as e:
        print(f"Error processing image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    input_file = "/Users/kahlilhazel/.gemini/antigravity/brain/272072e4-4fdf-4db0-8625-77453a8c6f01/uploaded_media_1769275147963.jpg"
    out_dir = "/Users/kahlilhazel/Documents/700-AI tools/710-AI-Kahlils/AI-分身/共享工作区/项目文档/Kahlil_Portfolio/images"
    process_icon(input_file, out_dir)
