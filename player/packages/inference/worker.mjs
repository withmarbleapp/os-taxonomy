import { getLlama, LlamaChatSession, QwenChatWrapper } from 'node-llama-cpp';
import { ollamaDecisionSchema } from '../providers/index.mjs';
import { validate } from '../lesson-contract/contracts.mjs';
import { partialSayText, createSentenceEmitter } from '../teaching-runtime/speech-stream.mjs';
let llama,
  model,
  context,
  sequence,
  session,
  sessionKey,
  previousMessages = [];
let grammar, grammarKey;
process.on('message', async (input) => {
  const started = performance.now();
  try {
    llama ??= await getLlama({ build: 'never', skipDownload: true });
    model ??= await llama.loadModel({ modelPath: input.modelPath });
    context ??= await model.createContext({ contextSize: 16384, sequences: 1 });
    // Qwen3.5 is hybrid: checkpoint its recurrent state as well as retaining KV.
    sequence ??= context.getSequence({
      checkpoints: { interval: 1024, max: 8, maxMemory: 256 * 1024 * 1024 },
    });
    const systemPrompt =
      input.system.replace(
        'Return one decision as JSON: {tool:string,arguments:string}, where arguments is a JSON object encoded as a string.',
        'Return one decision as JSON: {tool:string,arguments:object}.',
      ) +
      '\nReturn only JSON. Arguments must be an object matching the selected tool schema, not a string. Example: {"tool":"say","arguments":{"text":"Ready."}}';
    const standing =
      systemPrompt + '\nTool reference:\n' + JSON.stringify(input.standingTools ?? input.tools);
    const key = JSON.stringify([input.context?.snapshot?.sessionId ?? 'probe', standing]);
    const messages = input.messages ?? [];
    const extendsHistory =
      previousMessages.length <= messages.length &&
      previousMessages.every((m, i) => m === JSON.stringify(messages[i]));
    const reused = !!session && sessionKey === key && extendsHistory;
    if (!reused) {
      session?.dispose();
      await sequence.clearHistory();
      session = new LlamaChatSession({
        contextSequence: sequence,
        systemPrompt: standing,
        // Forced empty thoughts disappear when history is re-rendered, invalidating
        // the cached prefix. Keep formatting stable; grammar + zero budget bound output.
        chatWrapper: new QwenChatWrapper({
          variation: '3.5',
          thoughts: 'modelInitiated',
          keepOnlyLastThought: false,
        }),
      });
      sessionKey = key;
      previousMessages = [];
    }
    const nextGrammarKey = JSON.stringify(input.tools);
    if (grammarKey !== nextGrammarKey) {
      grammar = await llama.createGrammarForJsonSchema({
        oneOf: ollamaDecisionSchema(input.tools).anyOf,
      });
      grammarKey = nextGrammarKey;
    }
    const meter = sequence.tokenMeter.getState();
    let generated = '',
      firstTokenMs;
    const sentences = createSentenceEmitter((text) =>
      process.send({ event: { type: 'speech', text } }),
    );
    const prompt = JSON.stringify({
      availableTools: input.tools.map((t) => t.name),
      newMessages: messages.slice(previousMessages.length),
      context: input.context,
    });
    const result = await session.prompt(prompt, {
      grammar,
      maxTokens: 1200,
      temperature: 0.2,
      budgets: { thoughtTokens: 0 },
      onTextChunk(text) {
        firstTokenMs ??= performance.now() - started;
        generated += text;
        sentences.push(partialSayText(generated));
      },
    });
    previousMessages = messages.map((m) => JSON.stringify(m));
    process.send({
      event: {
        type: 'inference_metrics',
        cacheSessionReused: reused,
        firstTokenMs,
        totalMs: performance.now() - started,
        ...sequence.tokenMeter.diff(meter),
      },
    });
    const decision = JSON.parse(result);
    const tool = input.tools.find((t) => t.name === decision.tool);
    if (!tool) throw Error('Unknown tool');
    validate(tool.inputSchema, decision.arguments);
    process.send({
      result: { tool: decision.tool, arguments: JSON.stringify(decision.arguments) },
    });
  } catch (error) {
    session?.dispose();
    session = null;
    previousMessages = [];
    console.error(error);
    process.send({
      error:
        'The on-device tutor could not finish this reply. Please retry or choose Claude or Codex.',
    });
  }
});
process.on('disconnect', () => process.exit(0));
