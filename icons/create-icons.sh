#!/bin/bash
# Create simple placeholder PNG icons using ImageMagick or convert
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    # Create a simple basketball-themed icon using convert (if available)
    if command -v convert &> /dev/null; then
        convert -size ${size}x${size} xc:orange \
                -fill white -stroke white -strokewidth 2 \
                -draw "circle $(($size/2)),$(($size/2)) $(($size/2)),$(($size/4))" \
                -draw "line $(($size/2)),$(($size/8)) $(($size/2)),$(($size*7/8))" \
                -draw "line $(($size/8)),$(($size/2)) $(($size*7/8)),$(($size/2))" \
                icon-${size}x${size}.png
        echo "Created icon-${size}x${size}.png"
    else
        echo "ImageMagick not available, skipping icon generation"
        break
    fi
done
