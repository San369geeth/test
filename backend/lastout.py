from moviepy.editor import VideoFileClip, AudioFileClip
import sys
def merge_audio_to_video(input_video_path, input_audio_path, output_video_path):
    video = VideoFileClip(input_video_path)
    audio = AudioFileClip(input_audio_path)

    # Set the audio of the video file
    video = video.set_audio(audio)

    # Write the result to a new file
    video.write_videofile(output_video_path, codec='libx264', audio_codec='aac', temp_audiofile='temp-audio.m4a', remove_temp=True)

    # Close the files
    video.close()
    audio.close()

if __name__ == "__main__":

    # Extract command-line arguments
    input_video_path = sys.argv[1]
    input_audio_path = sys.argv[2]
    output_video_path=sys.argv[3]

    merge_audio_to_video(input_video_path, input_audio_path, output_video_path)