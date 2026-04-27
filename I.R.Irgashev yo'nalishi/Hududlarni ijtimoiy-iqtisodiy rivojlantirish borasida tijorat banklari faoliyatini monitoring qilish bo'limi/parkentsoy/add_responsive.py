with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add responsive.css before </head>
if 'responsive.css' not in content:
    content = content.replace('</head>', '<link rel="stylesheet" href="responsive.css">\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">\n</head>')
    print('Responsive CSS link added!')
else:
    print('Responsive CSS already linked')

# Also ensure viewport meta tag exists
if 'viewport' not in content:
    content = content.replace('<head>', '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    print('Viewport meta added!')

with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
