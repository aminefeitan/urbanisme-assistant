import os
from faster_whisper import WhisperModel

# Initialize model globally so it's loaded only once
model_size = "small"
device = "cpu"
compute_type = "int8"

print(f"Loading faster-whisper model ({model_size}) on {device}...")
model = WhisperModel(model_size, device=device, compute_type=compute_type)
print("faster-whisper model loaded successfully.")

def transcribe_audio(file_path: str) -> str:
    """
    Transcribes an audio file using faster-whisper.
    """
    segments, info = model.transcribe(file_path, beam_size=5)
    
    # Concatenate all segments
    transcribed_text = " ".join([segment.text for segment in segments])
    return transcribed_text.strip()
