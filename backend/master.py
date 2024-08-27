import subprocess
import sys
import socketio
import threading

# Connect to the Node.js server
sio = socketio.Client()
sio.connect('http://localhost:3000')

# The first argument is the file path, the second is the language
file_path = sys.argv[1]
language = sys.argv[2]
socket_id = sys.argv[3]

def send_progress(message):
    try:
        print(message)
        sys.stdout.flush()  # Flush the print buffer
        sio.emit('progress', {'socket_id': socket_id, 'message': message})
    except Exception as e:
        print(f"Error sending progress message: {e}")

def run_subprocess(command, progress_message):
    send_progress(progress_message)
    subprocess.run(command)

def extract_audio(video_path, output_audio_path):
    thread = threading.Thread(target=run_subprocess, args=(['python', 'C:/Users/skfog/OneDrive/Desktop/project/backend/extract_audio.py', video_path, output_audio_path], "Extracting audio..."))
    thread.start()
    thread.join()  # Wait for the thread to complete
    send_progress("Audio extracted successfully.")

def audio_to_text(audio_path, output_text_path):
    thread = threading.Thread(target=run_subprocess, args=(['python', 'C:/Users/skfog/OneDrive/Desktop/project/backend/audio_to_text.py', audio_path, output_text_path], "Converting audio to text..."))
    thread.start()
    thread.join()
    send_progress("Audio converted to text successfully.")

def translate_text(input_text_path, output_translated_text_path, target_language):
    thread = threading.Thread(target=run_subprocess, args=(['python', 'C:/Users/skfog/OneDrive/Desktop/project/backend/translate_text.py', input_text_path, output_translated_text_path, target_language], "Translating text..."))
    thread.start()
    thread.join()
    send_progress("Text translated successfully.")

def text_to_speech(input_text_path, output_audio_path, language_code):
    thread = threading.Thread(target=run_subprocess, args=(['python', 'C:/Users/skfog/OneDrive/Desktop/project/backend/text_to_speech.py', input_text_path, output_audio_path, language_code], "Converting text to speech..."))
    thread.start()
    thread.join()
    send_progress("Text converted to speech successfully.")

def merge_audio_to_video(input_video_path, translated_audio_path, output_video_path):
    thread = threading.Thread(target=run_subprocess, args=(['python', 'C:/Users/skfog/OneDrive/Desktop/project/backend/lastout.py', input_video_path, translated_audio_path, output_video_path], "Merging audio with video..."))
    thread.start()
    thread.join()
    send_progress("Audio merged with video successfully.")

if __name__ == "__main__":
    video_path = sys.argv[1]
    lang = sys.argv[2]
    socket_id = sys.argv[3]
    
    audio_path = 'C:/Users/skfog/OneDrive/Desktop/project/site/output/og_audio.wav'
    text_path = "C:/Users/skfog/OneDrive/Desktop/project/site/output/output_text.txt"
    translated_text_path = "C:/Users/skfog/OneDrive/Desktop/project/site/output/output_translated_text.txt"
    translated_audio_path = "C:/Users/skfog/OneDrive/Desktop/project/site/output/output_translated_audio.wav"
    final_video_path = "C:/Users/skfog/OneDrive/Desktop/project/site/output/output_video.mp4"
    

    extract_audio(video_path, audio_path)
    audio_to_text(audio_path, text_path)
    translate_text(text_path, translated_text_path, target_language=lang)
    text_to_speech(translated_text_path, translated_audio_path, language_code=lang)
    merge_audio_to_video(video_path, translated_audio_path, final_video_path)

    send_progress("Video conversion completed successfully!")
    sio.emit('completed', {'socket_id': socket_id})
    sio.disconnect()
