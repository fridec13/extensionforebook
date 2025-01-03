from cairosvg import svg2png
import os

# icons 디렉토리가 없으면 생성
if not os.path.exists('icons'):
    os.makedirs('icons')

# SVG 파일 읽기
with open('icons/icon.svg', 'r') as f:
    svg_data = f.read()

# 각 크기별로 PNG 생성
sizes = [16, 48, 128]
for size in sizes:
    svg2png(bytestring=svg_data,
            write_to=f'icons/icon{size}.png',
            output_width=size,
            output_height=size)

print("Icons generated successfully!") 