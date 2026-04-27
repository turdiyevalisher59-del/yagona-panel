import re

# First, revert to original file without insertion problems
with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_updated (19).html', 'r', encoding='utf-8') as f:
    html = f.read()

# Create images folder
import os
os.makedirs(r'C:\Users\Lenovo\Desktop\hudud\images', exist_ok=True)
import base64

# Find all base64 images
pattern = r'data:image/([^;]+);base64,([A-Za-z0-9+/=]+)'
matches = list(re.finditer(pattern, html))

print(f'Found {len(matches)} base64 images')

# Extract and save each image
new_html = html
for i, match in enumerate(matches):
    img_type = match.group(1)
    b64_data = match.group(2)
    
    ext = 'jpg' if img_type == 'jpeg' else img_type
    filename = f'bank_image_{i+1}.{ext}'
    filepath = rf'C:\Users\Lenovo\Desktop\hudud\images\{filename}'
    
    try:
        img_data = base64.b64decode(b64_data)
        with open(filepath, 'wb') as img_file:
            img_file.write(img_data)
        print(f'Saved: {filename} ({len(img_data)} bytes)')
        
        old_src = match.group(0)
        new_src = f'images/{filename}'
        new_html = new_html.replace(old_src, new_src, 1)
    except Exception as e:
        print(f'Error saving {filename}: {e}')

# Add script tag ONLY before the LAST </body> in the file
last_body_index = new_html.rfind('</body>')
if last_body_index != -1:
    script_tag = '<script src="voice-assistant-ext.js"></script>\n'
    new_html = new_html[:last_body_index] + script_tag + new_html[last_body_index:]
    print(f'Script tag added at position {last_body_index}')
else:
    print('ERROR: </body> not found!')

# Save new HTML
new_filepath = r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html'
with open(new_filepath, 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f'\nNew HTML saved: parkentsoy_voice.html')
print(f'Original size: {len(html)} bytes')
print(f'New size: {len(new_html)} bytes')
print(f'Saved: {len(html) - len(new_html)} bytes')

# Verify script is at correct position
script_pos = new_html.rfind('voice-assistant-ext.js')
body_pos = new_html.rfind('</body>')
print(f'\nVerification:')  
print(f'Script position: {script_pos}')
print(f'</body> position: {body_pos}')
print(f'Script is before </body>: {script_pos < body_pos}')
