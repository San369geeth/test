import noisereduce as nr
import librosa
import soundfile as sf

# Load the extracted audio file
audio_data, rate = librosa.load("C:/Users/skfog/OneDrive/Desktop/project/site/output/og_audio.wav")

# Perform noise reduction
reduced_noise = nr.reduce_noise(y=audio_data, sr=rate)

# Save the cleaned audio to a new file
sf.write("cleaned_audio.wav", reduced_noise, rate)
