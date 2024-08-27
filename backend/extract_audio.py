import sys
import os
from moviepy.video.io.VideoFileClip import VideoFileClip

def extract_audio(video_path, output_audio_path):
    # Check if the video file exists
    if not os.path.exists(video_path):
        print(f"Error: Video file {video_path} does not exist.")
        return

    try:
        # Load the video clip
        video_clip = VideoFileClip(video_path)

        # Extract audio
        audio_clip = video_clip.audio

        if audio_clip is None:
            print("Error: Audio extraction failed. No audio found in the video.")
            return

        # Save the audio file
        audio_clip.write_audiofile(output_audio_path)

        # Close the video and audio clips
        video_clip.close()
        audio_clip.close()
    except Exception as e:
        print(f"Error during audio extraction: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python extract_audio.py <video_path> <output_audio_path>")
        sys.exit(1)

    video_path = sys.argv[1]
    output_audio_path = sys.argv[2]

    extract_audio(video_path, output_audio_path)
