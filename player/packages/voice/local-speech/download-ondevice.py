"""Provision the iPhone POC's speech models for the official desktop runtimes."""
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile
from huggingface_hub import hf_hub_download

root = Path(__file__).resolve().parent
models = root / "models"
lock = json.loads((root / "ondevice-models.lock.json").read_text())
for item in lock["files"]:
    if not item["path"].startswith("moonshine/"):
        continue
    path = models / item["path"]
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        url = "https://download.moonshine.ai/model/small-streaming-en/quantized_26_08_21/" + path.name
        part = path.with_suffix(path.suffix + ".part")
        print("Downloading", path.name, flush=True)
        subprocess.run(["curl", "-fL", "--retry", "3", "--max-time", "180", "--silent", "--show-error", url, "-o", str(part)], check=True)
        part.replace(path)
    if hashlib.file_digest(path.open("rb"), "sha256").hexdigest() != item["sha256"]:
        raise RuntimeError("Moonshine checksum mismatch: " + path.name)

revision = "8acf8881a96315724c72ed3aad2a0900d1b230ba"
for name in ["config.json", "tokenizer.json", "model.q8.gguf", "default-voice.safetensors", "README.md"]:
    hf_hub_download("gradium/phonon-31m-en", name, revision=revision, local_dir=models / "phonon")
model_sha = "a7d9aad2cd6dc66473f24a08bc6d2939030ef4d751ef82349361fbef3272dbae"
if hashlib.file_digest((models / "phonon/model.q8.gguf").open("rb"), "sha256").hexdigest() != model_sha:
    raise RuntimeError("Phonon Q8 checkpoint checksum mismatch")
voice_revision = "xn-ptts/v0.4.0"
archive = models / "phonon-31m-en-coreml.zip"
if not archive.exists():
    subprocess.run(["curl", "-fL", "--retry", "3", "--max-time", "180", "--silent", "--show-error", "https://github.com/gradium-ai/xn-ptts/releases/download/v0.4.0/phonon-31m-en-coreml.zip", "-o", str(archive)], check=True)
if hashlib.file_digest(archive.open("rb"), "sha256").hexdigest() != "10f3a99fd39256db44f826267ef21d78cca959b16c0554926344c09fde27b436":
    raise RuntimeError("Original Phonon release checksum mismatch")
destination = models / "phonon/voices/Freya.safetensors"
destination.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(archive) as bundle:
    name = next(n for n in bundle.namelist() if n.endswith("/voices/Freya.safetensors"))
    destination.write_bytes(bundle.read(name))
expected = next(f for f in lock["files"] if f["path"] == "phonon/voices/Freya.safetensors")["sha256"]
actual = hashlib.file_digest(destination.open("rb"), "sha256").hexdigest()
if actual != expected:
    raise RuntimeError("Freya conditioning differs from the iPhone POC")
(models / "ondevice-manifest.json").write_text(json.dumps({"moonshine": "small-streaming-en/quantized_26_08_21", "phonon": {"repo": "gradium/phonon-31m-en", "revision": revision, "format": "q8", "sha256": model_sha}, "voice": {"name": "Freya", "revision": voice_revision, "sha256": actual}, "iphoneChecksumsVerified": True}, indent=2) + "\n")
print("Moonshine and Phonon/Freya provisioned for offline desktop use.")
