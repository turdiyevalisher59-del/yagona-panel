with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove premium-background.css link
content = content.replace('<link rel="stylesheet" href="premium-background.css">\n', '')
content = content.replace('<link rel="stylesheet" href="premium-background.css">', '')

with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Premium background CSS removed! Original design restored.')
