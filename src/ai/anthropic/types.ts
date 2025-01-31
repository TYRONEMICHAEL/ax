import type { TextModelConfig } from '../types.js';

/**
 * Anthropic: Models for text generation
 * @export
 */
export enum AnthropicModel {
  Claude3Opus = 'claude-3-opus-20240229',
  Claude3Sonnet = 'claude-3-sonnet-20240229',
  Claude3Haiku = 'claude-3-haiku-20240307',
  Claude21 = 'claude-2.1',
  ClaudeInstant12 = 'claude-instant-1.2'
}

/**
 * Anthropic: Model options for text generation
 * @export
 */
export type AnthropicConfig = TextModelConfig & {
  model: AnthropicModel;
};

// Type for the request to create a message using Anthropic's Messages API
export type AnthropicChatRequest = {
  model: string;
  messages: {
    role: 'user' | 'assistant' | 'system';
    content:
      | string
      | {
          type: 'text' | 'image' | 'tool_result';
          text?: string; // Text content (if type is 'text')
          tool_use_id?: string;
          content?: string;
          source?: {
            type: 'base64';
            media_type: string;
            data: string;
          };
        }[];
  }[];
  tools?: {
    name: string;
    description: string;
    input_schema?: object;
  }[];
  max_tokens?: number; // Maximum number of tokens to generate
  // Optional metadata about the request
  stop_sequences?: string[]; // Custom sequences that trigger the end of generation
  stream?: boolean; // Whether to stream the response incrementally
  temperature?: number; // Randomness of the response
  top_p?: number; // Nucleus sampling probability
  top_k?: number; // Sample from the top K options
  metadata?: {
    user_id: string;
  };
};

export type AnthropicChatResponse = {
  id: string; // Unique identifier for the response
  type: 'message'; // Object type, always 'message' for this API
  role: 'assistant'; // Conversational role of the generated message, always 'assistant'
  content: {
    id?: string;
    name?: string;
    type: 'text' | 'tool_use';
    text: string;
    input?: string;
  }[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};

export type AnthropicChatError = {
  type: 'error';
  error: {
    type: 'authentication_error';
    message: string;
  };
};

// Base interface for all event types in the stream
export interface AnthropicStreamEvent {
  type: string;
}

// Represents the start of a message with an empty content array
export interface AnthropicMessageStartEvent extends AnthropicStreamEvent {
  message: {
    id: string;
    type: 'message';
    role: 'assistant';
    content: [];
    model: string;
    stop_reason: null | string;
    stop_sequence: null | string;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
}

// Indicates the start of a content block within a message
export interface AnthropicContentBlockStartEvent extends AnthropicStreamEvent {
  index: number;
  content_block: {
    type: 'text';
    text: string;
  };
}

// Represents incremental updates to a content block
export interface AnthropicContentBlockDeltaEvent extends AnthropicStreamEvent {
  index: number;
  delta: {
    type: 'text_delta';
    text: string;
  };
}

// Marks the end of a content block within a message
export interface AnthropicContentBlockStopEvent extends AnthropicStreamEvent {
  index: number;
}

// Indicates top-level changes to the final message object
export interface AnthropicMessageDeltaEvent extends AnthropicStreamEvent {
  delta: {
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
    stop_sequence: string | null;
    usage: {
      output_tokens: number;
    };
  };
}

// Marks the end of a message
export type AnthropicMessageStopEvent = AnthropicStreamEvent;

// Represents a ping event, which can occur any number of times
export type AnthropicPingEvent = AnthropicStreamEvent;

// Represents an error event
export interface AnthropicErrorEvent extends AnthropicStreamEvent {
  error: {
    type: 'overloaded_error' | string;
    message: string;
  };
}

// Union type for all possible event types in the stream
export type AnthropicStreamEventType =
  | AnthropicMessageStartEvent
  | AnthropicContentBlockStartEvent
  | AnthropicContentBlockDeltaEvent
  | AnthropicContentBlockStopEvent
  | AnthropicMessageDeltaEvent
  | AnthropicMessageStopEvent
  | AnthropicPingEvent
  | AnthropicErrorEvent;

// Type for the response delta in streaming mode, using generic to allow flexibility
export interface AnthropicResponseDelta<T> {
  id: string;
  object: 'message';
  model: string;
  events: T[]; // Array of all event types that can occur in the stream
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Specific type for handling text deltas in the streaming response
export type AnthropicChatResponseDelta =
  AnthropicResponseDelta<AnthropicStreamEventType>;
