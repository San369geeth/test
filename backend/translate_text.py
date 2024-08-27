import sys
from googletrans import Translator

def translate_text(input_text_path, output_translated_text_path, target_language):
    try:
        with open(input_text_path, 'r', encoding='utf-8', errors='ignore') as file:
            text = file.read()
        
        translator = Translator()
        translation = translator.translate(text, dest=target_language)

        # Output translated text into file
        with open(output_translated_text_path, 'w', encoding='utf-8') as file:
            file.write(translation.text)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    input_text_path = sys.argv[1]
    output_translated_text_path = sys.argv[2]
    target_language = sys.argv[3]

    translate_text(input_text_path, output_translated_text_path, target_language)
