with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add voice-mobile.js after share.js
if 'voice-mobile.js' not in content:
    content = content.replace('share.js"></script>', 'share.js"></script>\n<script src="voice-mobile.js"></script>')
    print('Mobile voice support added!')
else:
    print('Mobile voice support already exists')

with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
