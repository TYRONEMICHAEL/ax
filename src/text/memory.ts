import type { TextResponseResult } from '../ai/types.js';
import type { AITextChatRequest } from '../types/index.js';

import type { AIMemory } from './types.js';

/**
 * A memory class to store ai interactions
 * @export
 */
export class Memory implements AIMemory {
  private data: AITextChatRequest['chatPrompt'] = [];
  private sdata = new Map<string, AITextChatRequest['chatPrompt']>();
  private limit: number;

  constructor(limit = 50) {
    if (limit <= 0) {
      throw Error("argument 'last' must be greater than 0");
    }
    this.limit = limit;
  }

  add(
    value: Readonly<
      AITextChatRequest['chatPrompt'][0] | AITextChatRequest['chatPrompt']
    >,
    sessionId?: string
  ): void {
    const d = this.get(sessionId);
    let n = 0;
    if (Array.isArray(value)) {
      n = d.push(...structuredClone(value));
    } else {
      n = d.push({
        ...structuredClone(value)
      } as AITextChatRequest['chatPrompt'][0]);
    }
    if (d.length > this.limit) {
      d.splice(0, this.limit + n - this.limit);
    }
  }

  addResult(
    { content, name, functionCalls }: Readonly<TextResponseResult>,
    sessionId?: string
  ): void {
    this.add({ content, name, role: 'assistant', functionCalls }, sessionId);
  }

  updateResult(
    { content, name, functionCalls }: Readonly<TextResponseResult>,
    sessionId?: string
  ): void {
    const item = this.get(sessionId);
    if ('content' in item && content) {
      item.content = content;
    }
    if ('name' in item && name) {
      item.name = name;
    }
    if ('functionCalls' in item && functionCalls) {
      item.functionCalls = functionCalls;
    }
  }

  history(sessionId?: string): AITextChatRequest['chatPrompt'] {
    return this.get(sessionId);
  }

  peek(sessionId?: string): AITextChatRequest['chatPrompt'] {
    return this.get(sessionId);
  }

  getLast(sessionId?: string): AITextChatRequest['chatPrompt'][0] | undefined {
    const d = this.get(sessionId);
    return d.at(-1);
  }

  reset(sessionId?: string) {
    if (!sessionId) {
      this.data = [];
    } else {
      this.sdata.set(sessionId, []);
    }
  }

  private get(sessionId?: string): AITextChatRequest['chatPrompt'] {
    if (!sessionId) {
      return this.data;
    }

    if (!this.sdata.has(sessionId)) {
      this.sdata.set(sessionId, []);
    }

    return this.sdata.get(sessionId) || [];
  }
}
