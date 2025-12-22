from PIL import Image, ImageDraw, ImageFont
import os

def create_pos_icon(size, filename):
    # Create a new image with a blue background
    img = Image.new('RGBA', (size, size), (41, 128, 185, 255))  # Professional blue
    draw = ImageDraw.Draw(img)
    
    # Calculate proportions
    margin = size // 8
    
    # Draw a cash register/cash drawer rectangle
    drawer_width = size - 2 * margin
    drawer_height = size // 3
    drawer_y = size - drawer_height - margin
    
    # Draw the cash drawer
    draw.rectangle(
        [margin, drawer_y, margin + drawer_width, drawer_y + drawer_height],
        fill=(255, 255, 255, 255),
        outline=(0, 0, 0, 255),
        width=max(1, size // 32)
    )
    
    # Draw cash drawer handle
    handle_width = drawer_width // 3
    handle_height = max(2, size // 16)
    handle_x = margin + drawer_width // 2 - handle_width // 2
    handle_y = drawer_y + drawer_height // 2 - handle_height // 2
    
    draw.rectangle(
        [handle_x, handle_y, handle_x + handle_width, handle_y + handle_height],
        fill=(41, 128, 185, 255)
    )
    
    # Draw a simple calculator/display area
    display_width = drawer_width // 2
    display_height = size // 6
    display_x = margin + drawer_width // 4
    display_y = margin
    
    draw.rectangle(
        [display_x, display_y, display_x + display_width, display_y + display_height],
        fill=(200, 200, 200, 255),
        outline=(0, 0, 0, 255),
        width=max(1, size // 32)
    )
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

# Create icons directory if it doesn't exist
os.makedirs('src-tauri/icons', exist_ok=True)

# Create the required icon sizes
create_pos_icon(32, 'src-tauri/icons/32x32.png')
create_pos_icon(128, 'src-tauri/icons/128x128.png')
create_pos_icon(256, 'src-tauri/icons/128x128@2x.png')

print("All icons created successfully!")