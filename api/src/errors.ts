/**
 * Invalid input sent by the client. Its message is safe to show to API consumers;
 * every other error is masked before reaching them.
 */
export class InputError extends Error {
  override readonly name = 'InputError';
}
