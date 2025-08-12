# Video Assets Directory

This directory contains video files for the video preloader feature.

## Supported Video Formats

The video preloader will try to load videos in the following order:
1. `intro.mp4` - Main intro video (MP4 format)
2. `intro.webm` - WebM format (better compression)
3. `intro.mov` - QuickTime format
4. `video.mp4` - Alternative MP4 video
5. `video.webm` - Alternative WebM video

## Recommended Video Specifications

For optimal performance and compatibility:

### Format: MP4 (H.264)
- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Frame Rate**: 24-30 fps
- **Bitrate**: 2-5 Mbps for 1080p, 1-2 Mbps for 720p
- **Duration**: 10-30 seconds for intro videos
- **File Size**: Keep under 10MB for fast loading

### Format: WebM (VP9)
- **Resolution**: Same as MP4
- **Frame Rate**: 24-30 fps
- **Bitrate**: 1-3 Mbps for 1080p, 0.5-1.5 Mbps for 720p
- **Better compression** than MP4

## How to Add Your Video

1. **Place your video file** in this directory
2. **Rename it** to one of the supported names (e.g., `intro.mp4`)
3. **Optimize the video** using tools like:
   - HandBrake (free, cross-platform)
   - FFmpeg (command line)
   - Online converters

## Video Optimization Tips

### For Web Performance:
- Use **WebM** format when possible (smaller file size)
- **Compress** videos to reduce file size
- **Trim** unnecessary parts
- **Lower resolution** for mobile devices
- **Use CDN** for large video files

### FFmpeg Commands:
```bash
# Convert to WebM (VP9)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm

# Convert to MP4 (H.264)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac output.mp4

# Resize to 720p
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 output_720p.mp4
```

## Current Status

- [x] `intro.mp4` - Main intro video (currently available)
- [ ] `intro.webm` - Add WebM version here
- [ ] `video.mp4` - Add alternative video here

## Testing

After adding videos:
1. Start the development server: `ng serve`
2. Open the application
3. Check browser console for video loading status
4. Verify the video preloader works correctly

## Troubleshooting

### Video Not Loading:
- Check file path and name
- Verify video format is supported
- Check browser console for errors
- Ensure video file is not corrupted

### Performance Issues:
- Reduce video file size
- Use WebM format
- Lower video resolution
- Optimize video bitrate
