"""Make numbered review sheets from a campaign's ordered visual checkpoints."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

folder = Path(sys.argv[1])
records = [json.loads(line) for line in (folder / 'visual.jsonl').read_text().splitlines()]
for start in range(0, len(records), 24):
    batch = records[start:start + 24]
    sheet = Image.new('RGB', (1600, 1740), '#15151a')
    draw = ImageDraw.Draw(sheet)
    for offset, record in enumerate(batch):
        picture = Image.open(folder / record['filename']).convert('RGB')
        picture.thumbnail((400, 260))
        x, y = (offset % 4) * 400, (offset // 4) * 290
        sheet.paste(picture, (x + (400 - picture.width) // 2, y))
        draw.text((x + 6, y + 263), f"{start + offset + 1}: step {record['step']} {record['action']} / {record['stage']}", fill='white')
    sheet.save(folder / f'review-{start // 24 + 1:02d}.jpg', quality=90)
