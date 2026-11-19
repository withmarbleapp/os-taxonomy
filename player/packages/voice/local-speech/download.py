"""Explicit one-time model download. Runtime never downloads models."""
import json
from pathlib import Path
from huggingface_hub import hf_hub_download, snapshot_download

root = Path(__file__).resolve().parent / "models"
root.mkdir(parents=True, exist_ok=True)
manifest_path = root / "manifest.json"
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
for key, repo, revision in [("stt", "Systran/faster-whisper-base.en", "3d3d5dee26484f91867d81cb899cfcf72b96be6c"), ("tts", "rhasspy/piper-voices", "5041a7a49ae5b3a0f30e6837769eb03fdbb231bd")]:
    manifest[key] = {"repo": repo, "revision": revision}
    if key == "stt":
        snapshot_download(repo, revision=revision, local_dir=root / "base.en", allow_patterns=["model.bin", "config.json", "tokenizer.json", "vocabulary.*", "preprocessor_config.json", "README.md"])
    else:
        prefix = "en/en_US/lessac/medium/"
        for name in ["en_US-lessac-medium.onnx", "en_US-lessac-medium.onnx.json", "MODEL_CARD"]:
            hf_hub_download(repo, prefix + name, revision=revision, local_dir=root / "piper")
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
print("Local speech models downloaded. Runtime can now run offline.")
