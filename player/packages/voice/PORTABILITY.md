# Moonshine / Phonon portability

The default player now uses browser speech workers. See [browser speech](../../docs/browser-speech.md)
for the current implementation and measured checks. The native/Python details
below describe the retained legacy implementation only; they are not setup
requirements for the app.

The scene and teaching runtime keep the same provider-neutral ports. The browser
owns microphone capture and playback; the desktop server exchanges PCM/text with
persistent speech workers. No experience or lesson code needs to change per OS.

## Current status

| Platform | Pinned runtime availability | Status here |
|---|---|---|
| Linux x86-64 | Moonshine 0.1.5 manylinux glibc 2.34+; Phonon ptts 0.5.0 x86-64-v3 CPU wheel | Real models and Moon end to end tested on Ryzen AI 9 HX 370 |
| Apple Silicon Mac | Moonshine 0.1.5 macOS 15+ ARM64; Phonon 0.5.0 macOS 11+ ARM64 | Wheels published; application untested on Mac |
| Windows x64 | Both wheels published; Phonon requires AVX2/FMA/F16C | Wheels published; application untested on Windows |
| Intel Mac | Phonon wheel published; no Moonshine 0.1.5 Intel Mac wheel | Moonshine source build or another qualified runtime build needed |
| Windows ARM64 | Phonon wheel published; no Moonshine 0.1.5 native ARM64 wheel | Moonshine source build/qualification needed; emulation not tested |
| Linux ARM64 | Both wheels published; Moonshine has glibc 2.31/2.34 variants | Application and hardware untested |

Availability was checked against the actual versioned PyPI wheel files, not just
an upstream claim of platform support. Old x86 CPUs or older glibc versions may
need source builds; they are outside the tested binary path. One Python wheel
set cannot be copied unchanged across operating systems.

## Linux implementation

Already implemented: pinned provisioning and model hashes, local-only loading,
native streaming Moonshine capture, Phonon frame streaming with the original
Freya conditioning, cancel/drop semantics and shared sample-rate negotiation.
A synthetic offline speech test runs with external network access unavailable.
The browser test also passes with scripted inference, and the hybrid test uses
real Haiku inference without any cloud speech API calls.

The native runtimes run on CPU. This does not require CUDA, an Apple GPU or a
model conversion. The Linux Phonon representation is Q8 GGUF, not a Core ML
`.mlpackage`; the checkpoint identity and Freya checksum are preserved.

## Mac next

1. Start on Apple Silicon/macOS 15+, the intersection of the pinned wheels.
2. Install Node 24+, uv and curl; run the same setup and launch commands.
3. Run native speech tests and the Moon browser test in Chrome. Then test actual
   microphone permission, hold/release, cancellation, sleep/wake and output devices.
4. Measure latency and sustained memory on the target Mac. Do not infer these
   from the Linux timings or vendor benchmarks.

The scripts now select `.venv/bin/python` and use the OS temp directory. For
initial parity, keep Phonon's CPU runtime. Core ML acceleration can later replace
only its backend, reusing the existing iPhone export; that is an optional
optimization with its own test gate. Intel Mac requires resolving the Moonshine
build first. Safari needs separate AudioWorklet, capture-rate and permission
validation; cross-platform browser claims currently target Chromium.

## Windows next

1. Start on a modern Windows x64 CPU with AVX2, FMA and F16C.
2. Install Node 24+, uv and curl, then run the same npm commands in PowerShell.
3. Run the native speech test, then Moon with Chrome/Edge and a real microphone.
4. Test process shutdown, interruption, microphone privacy settings, device changes,
   paths containing spaces/non-ASCII characters, sleep/wake and sustained latency.

The launcher now selects `.venv/Scripts/python.exe`, preserves Windows system/temp
variables without forwarding API credentials, and uses argument arrays rather
than shell-quoted paths. Actual Windows execution is still required to validate
native DLL dependencies and the complete capture/playback path. No Windows
installer or signing work has been completed.

## From developer setup to distribution

For a packaged desktop app, bundle a matching runtime/Python environment per
OS/architecture and provision the checksummed models into app-managed storage.
Keep one PCM/text protocol so later native sidecars can replace Python without
changing scenes or pedagogy. Provide microphone permission handling, worker
lifecycle/recovery and model integrity checks. Add Windows signing and Mac
signing/notarization, and run the same synthetic + hardware tests in a platform
matrix. The model setup can happen at installation, rather than first runtime.

This prototype supplies the developer setup and Linux proof. It is not yet a
signed, self-contained desktop distribution. The teaching LLM remains an
independent choice; the current running reference uses Haiku in the cloud.

Sources: [Moonshine 0.1.5 files](https://pypi.org/project/moonshine-voice/0.1.5/#files),
[ptts 0.5.0 files](https://pypi.org/project/ptts/0.5.0/#files),
[Phonon runtime and wheel requirements](https://github.com/gradium-ai/xn-ptts/tree/main/ptts-pyo3),
[Moonshine platforms](https://github.com/moonshine-ai/moonshine).
