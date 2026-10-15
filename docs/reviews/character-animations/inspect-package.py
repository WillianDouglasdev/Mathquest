from pathlib import Path
from PIL import Image
import hashlib
import json

root = Path(__file__).resolve().parents[3]
rows = []
for folder in ('art/characters', 'art/previews', 'characters', 'previews', 'public/assets/characters'):
    for path in sorted((root / folder).glob('*')):
        if not path.is_file():
            continue
        image = Image.open(path)
        durations, transparent_frames, hashes = [], 0, set()
        for index in range(getattr(image, 'n_frames', 1)):
            image.seek(index)
            image.load()
            durations.append(image.info.get('duration', 0))
            transparent_frames += image.convert('RGBA').getchannel('A').getextrema()[0] == 0
            hashes.add(hashlib.sha256(image.convert('RGBA').tobytes()).hexdigest())
        rows.append(dict(
            path=path.relative_to(root).as_posix(), bytes=path.stat().st_size,
            sha256=hashlib.sha256(path.read_bytes()).hexdigest(), format=image.format,
            width=image.width, height=image.height, mode=image.mode,
            animated=getattr(image, 'is_animated', False), frames=getattr(image, 'n_frames', 1),
            durationMs=sum(durations), frameDurations=sorted(set(durations)),
            loop=image.info.get('loop'), transparentFrames=transparent_frames,
            uniqueFrames=len(hashes),
        ))
groups = {}
for row in rows:
    groups.setdefault(row['sha256'], []).append(row['path'])
report = dict(files=rows, duplicateGroups=[group for group in groups.values() if len(group) > 1])
Path(__file__).with_name('inventory.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(dict(files=len(rows), duplicateGroups=len(report['duplicateGroups'])), indent=2))
