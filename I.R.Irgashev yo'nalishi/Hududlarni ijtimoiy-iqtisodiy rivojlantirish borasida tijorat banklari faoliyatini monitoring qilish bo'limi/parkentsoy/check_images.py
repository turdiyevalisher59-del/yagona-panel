import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\Lenovo\Desktop\hudud\parkentsoy_voice.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find img tags with surrounding context
pattern = r'<img[^>]+src=["\']images/bank[^>]+>'
matches = re.findall(pattern, content[:150000])
print('Found image tags:')
for i, m in enumerate(matches):
    # Replace non-ASCII chars
    m_clean = m.encode('ascii', 'replace').decode('ascii')
    print(f'{i+1}. {m_clean}')

# Look for bank-card and related classes
print('\n\nBank card structure:')
card_match = re.search(r'<div[^>]+class="[^"]*bank-card[^"]*"[^>]*>[\s\S]*?</div>\s*</div>\s*</div>', content[:150000])
if card_match:
    print(card_match.group(0)[:500])
