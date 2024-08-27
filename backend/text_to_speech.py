from gtts import gTTS
from pydub import AudioSegment
import sys

def text_to_speech(input_text_path, output_audio_path,language_code):
    # Initialize gTTS with text
   
    with open(input_text_path, "r", encoding="utf-8") as file:
        text = file.read()

    tts = gTTS(text=text, lang=language_code)
    # Save speech to a temporary file
    tts.save("temp.mp3")

    # Load the saved audio file
    sound = AudioSegment.from_mp3("temp.mp3")
    # Export the audio to the specified output file
    sound.export(output_audio_path, format="mp3")
    
    # Delete the temporary file
    import os
    os.remove("temp.mp3")

if __name__ == "__main__":

    # Extract command-line arguments
    input_text_path = sys.argv[1]
    output_audio_path = sys.argv[2]
    language_code=sys.argv[3]
    print(input_text_path)
text_to_speech(input_text_path,output_audio_path,language_code)