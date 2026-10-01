import os
from PIL import Image

def remove_background(image_path):
    try:
        img = Image.open(image_path).convert("RGBA")
        datas = img.getdata()

        # Get the color of the top-left pixel as the background color
        bg_color = datas[0]
        
        # We want to remove all pixels that are similar to the bg_color.
        # It's usually a dark grey/black. We define a tolerance.
        tolerance = 40
        
        new_data = []
        for item in datas:
            # Check if the pixel is close to the background color
            if (abs(item[0] - bg_color[0]) < tolerance and
                abs(item[1] - bg_color[1]) < tolerance and
                abs(item[2] - bg_color[2]) < tolerance):
                # Replace it with a transparent pixel
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(image_path, "PNG")
        print(f"Processed {image_path}")
    except Exception as e:
        print(f"Failed to process {image_path}: {e}")

assets_dir = 'assets'
if os.path.exists(assets_dir):
    for filename in os.listdir(assets_dir):
        if filename.endswith(".png"):
            # Don't process coin or steam maybe? Let's just process plant, pots, brewers, cups
            if any(x in filename for x in ['plant_', 'pot_', 'brewer_', 'cup_']):
                remove_background(os.path.join(assets_dir, filename))
