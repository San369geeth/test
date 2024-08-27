import whisper
import sys
def audio_to_text(audio_path, output_text_path):
    model=whisper.load_model("base")
    result=model.transcribe(audio_path,fp16=False)

    with open(output_text_path,"w") as f:
        f.write(result["text"])
if __name__ == "__main__":
    # Check if the correct number of arguments are provided
    if len(sys.argv) != 3:
        print("Usage: python audio_to_text.py <audio_path> <output_text_path>")
        sys.exit(1)

    # Extract command-line arguments
    audio_path=sys.argv[1]
    output_text_path=sys.argv[2]

    audio_to_text(audio_path, output_text_path)