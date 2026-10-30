// Silent, local test audio. Never starts a real microphone or calls a provider.
const bytes = Buffer.alloc(1644);
bytes.write('RIFF');
bytes.writeUInt32LE(bytes.length - 8, 4);
bytes.write('WAVEfmt ', 8);
bytes.writeUInt32LE(16, 16);
bytes.writeUInt16LE(1, 20);
bytes.writeUInt16LE(1, 22);
bytes.writeUInt32LE(16000, 24);
bytes.writeUInt32LE(32000, 28);
bytes.writeUInt16LE(2, 32);
bytes.writeUInt16LE(16, 34);
bytes.write('data', 36);
bytes.writeUInt32LE(1600, 40);
export const fixtureSpeech = {
  synthesize: async () => ({ bytes, type: 'audio/wav' }),
  transcribe: async () => 'A fixture voice answer.',
  close() {},
};
