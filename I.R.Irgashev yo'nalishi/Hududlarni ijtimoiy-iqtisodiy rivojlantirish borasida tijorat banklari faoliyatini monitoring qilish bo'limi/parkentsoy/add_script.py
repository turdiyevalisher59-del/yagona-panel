import re

# Read optimized HTML
with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_optimized.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check if script already exists
if 'voice-assistant-ext.js' not in html:
    # Add script tag before </body>
    html = html.replace('</body>', '<script src="voice-assistant-ext.js"></script>\n</body>')
    
    # Save
    with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_optimized.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print('Script tag added successfully!')
else:
    print('Script tag already exists')

print(f'File size: {len(html)} bytes')
# Verify
if 'voice-assistant-ext.js' in html:
    print('Verification: OK - script found in file')
else:
    print('Verification: FAILED - script not found')
