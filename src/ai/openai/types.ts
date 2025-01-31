import type { TextModelConfig } from '../types.js';

// Transcribe = '/v1/audio/transcriptions',

/**
 * OpenAI: Models for text generation
 * @export
 */
export enum OpenAIModel {
  GPT4 = 'gpt-4',
  GPT4O = 'gpt-4o',
  GPT4Turbo = 'gpt-4-turbo',
  GPT35Turbo = 'gpt-3.5-turbo',
  GPT35TurboInstruct = 'gpt-3.5-turbo-instruct',
  GPT35TextDavinci002 = 'text-davinci-002',
  GPT3TextBabbage002 = 'text-babbage-002',
  GPT3TextAda001 = 'text-ada-001'
}

/**
 * OpenAI: Models for use in embeddings
 * @export
 */
export enum OpenAIEmbedModels {
  TextEmbeddingAda002 = 'text-embedding-ada-002',
  TextEmbedding3Small = 'text-embedding-3-small',
  TextEmbedding3Large = 'text-embedding-3-large'
}

/**
 * OpenAI: Models for for audio transcription
 * @export
 */
export enum OpenAIAudioModel {
  Whisper1 = 'whisper-1'
}

/**
 * OpenAI: Model options for text generation
 * @export
 */
export type OpenAIConfig = Omit<TextModelConfig, 'topK'> & {
  model: OpenAIModel | string;
  embedModel?: OpenAIEmbedModels | string;
  audioModel?: OpenAIAudioModel | string;
  user?: string;
  responseFormat?: 'json_object';
  bestOf?: number;
  logitBias?: Map<string, number>;
  suffix?: string | null;
  stop?: string[];
  logprobs?: number;
  echo?: boolean;
};

export type OpenAILogprob = {
  tokens: string[];
  token_logprobs: number[];
  top_logprobs: Map<string, number>;
  text_offset: number[];
};

export type OpenAIUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export interface OpenAIResponseDelta<T> {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: T;
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  }[];
  usage?: OpenAIUsage;
  system_fingerprint: string;
}

export type OpenAIChatRequest = {
  model: string;
  messages: (
    | { role: 'system'; content: string }
    | { role: 'user'; content: string; name?: string }
    | {
        role: 'assistant';
        content: string | null;
        name?: string;
        tool_calls?: {
          type: 'function';
          function: {
            name: string;
            // eslint-disable-next-line functional/functional-parameters
            arguments?: string;
          };
        }[];
      }
    | { role: 'tool'; content: string; tool_call_id: string }
  )[];
  tools?: {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters?: object;
    };
  }[];
  tool_choice?:
    | 'none'
    | 'auto'
    | 'required'
    | { type: 'function'; function: { name: string } };
  response_format?: { type: string };
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: readonly string[];
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Map<string, number>;
  user?: string;
  organization?: string;
};

export type OpenAIChatResponse = {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: {
        id: string;
        type: 'function';
        // eslint-disable-next-line functional/functional-parameters
        function: { name: string; arguments: string };
      }[];
    };
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  }[];
  usage?: OpenAIUsage;
  error?: {
    message: string;
    type: string;
    param: string;
    code: number;
  };
  system_fingerprint: string;
};

export type OpenAIChatResponseDelta = OpenAIResponseDelta<{
  content: string;
  role?: string;
  tool_calls?: (NonNullable<
    OpenAIChatResponse['choices'][0]['message']['tool_calls']
  >[0] & {
    index: number;
  })[];
}>;

export type OpenAIEmbedRequest = {
  input: readonly string[];
  model: string;
  user?: string;
};

export type OpenAIEmbedResponse = {
  model: string;
  data: {
    embedding: readonly number[];
    index: number;
  }[];
  usage: OpenAIUsage;
};

export type OpenAIAudioRequest = {
  model: string;
  prompt?: string;
  response_format: 'verbose_json';
  temperature?: number;
  language?: string;
};

export type OpenAIAudioResponse = {
  duration: number;
  segments: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
};
