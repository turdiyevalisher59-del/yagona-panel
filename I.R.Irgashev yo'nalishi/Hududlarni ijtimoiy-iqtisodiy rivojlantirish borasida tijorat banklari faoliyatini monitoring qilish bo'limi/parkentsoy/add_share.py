with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add share.js before </body>
if 'share.js' not in content:
    content = content.replace('voice-assistant-ext.js"></script>', 'voice-assistant-ext.js"></script>\n<script src="share.js"></script>')

with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Share script added!')
