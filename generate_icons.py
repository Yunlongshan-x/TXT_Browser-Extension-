#!/usr/bin/env python3
"""生成带有 TXT 文字的浏览器插件图标"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, text, bg_color, text_color, output_path):
    """创建一个带有文字的图标"""
    # 创建图片
    img = Image.new('RGBA', (size, size), bg_color)
    draw = ImageDraw.Draw(img)

    # 尝试使用系统字体
    try:
        # macOS 系统字体
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(size * 0.6))
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(size * 0.6))
        except:
            font = ImageFont.load_default()

    # 获取文字边界框
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # 计算文字位置（居中）
    x = (size - text_width) / 2
    y = (size - text_height) / 2

    # 绘制文字
    draw.text((x, y), text, fill=text_color, font=font)

    # 保存图片
    img.save(output_path)
    print(f"Created: {output_path}")

def main():
    icons_dir = "/Users/wenque/Downloads/network-request-saver/icons"

    # 定义图标尺寸
    sizes = [16, 48, 128]

    # 正常状态：蓝色背景，白色文字
    bg_normal = (70, 130, 180, 255)  # Steel Blue
    text_normal = (255, 255, 255, 255)  # White

    # 录制状态：红色背景，白色文字
    bg_recording = (220, 53, 69, 255)  # Red
    text_recording = (255, 255, 255, 255)  # White

    for size in sizes:
        # 正常状态图标
        create_icon(
            size,
            "TXT",
            bg_normal,
            text_normal,
            os.path.join(icons_dir, f"icon{size}.png")
        )

        # 录制状态图标
        create_icon(
            size,
            "TXT",
            bg_recording,
            text_recording,
            os.path.join(icons_dir, f"icon{size}-recording.png")
        )

    print("\nAll icons generated successfully!")

if __name__ == "__main__":
    main()
