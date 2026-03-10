import re

with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all img tags in first 150000 chars (before audio data)
imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content[:150000])
print('Found images:')
for img in imgs:
    if not img.startswith('data:'):
        print(f'  - {img}')
    else:
        print(f'  - [base64 data, {len(img)} chars]')

# Also look for background-image in CSS
bg_imgs = re.findall(r'background-image:\s*url\(["\']?([^"\')\s]+)["\']?\)', content[:150000])
print('\nBackground images:')
for img in bg_imgs:
    if not img.startswith('data:'):
        print(f'  - {img}')
    else:
        print(f'  - [base64 data]')
