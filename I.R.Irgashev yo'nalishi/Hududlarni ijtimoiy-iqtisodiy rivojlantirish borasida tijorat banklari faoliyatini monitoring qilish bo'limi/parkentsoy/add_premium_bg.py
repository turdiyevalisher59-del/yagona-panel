with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add premium-background.css after responsive.css
if 'premium-background.css' not in content:
    content = content.replace('responsive.css">', 'responsive.css">\n<link rel="stylesheet" href="premium-background.css">')
    print('Premium background CSS added!')
else:
    print('Premium background CSS already exists')

with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
