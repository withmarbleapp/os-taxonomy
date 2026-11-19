// Structured explanations and questions have distinct slots. Compose them once,
// rather than reading a question embedded in both slots twice.
const sentences = (text) => text.match(/[^.!?]+[.!?]?/g) ?? [];
export function singleQuestion(text) {
  return (
    sentences(text)
      .find((s) => s.trim().endsWith('?'))
      ?.trim() ?? text.trim()
  );
}
export function composeExplanation(text, question) {
  const q = question.trim();
  if (!q) return text.trim();
  const body = sentences(text)
    .filter((s) => !s.trim().endsWith('?'))
    .map((s) => s.trim())
    .join(' ');
  return [body, singleQuestion(q)].filter(Boolean).join(' ');
}
