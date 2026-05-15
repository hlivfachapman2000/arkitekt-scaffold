// Gemini service stub
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface AgentStep {
  id: string;
  type: 'tool' | 'text';
  toolName?: string;
  toolArgs?: any;
  content?: string;
  status: 'streaming' | 'completed';
  latencyMs?: number;
  result?: any;
}

export const HIERARCHY = {} as any;

export async function sendMessageToAgentStream(
  _history: ChatMessage[],
  _message: string,
  _onUpdate: (update: { isDone: boolean; currentText?: string; history: ChatMessage[] }) => void,
  _systemPrompt?: string
): Promise<void> {
  _onUpdate({ isDone: true, currentText: 'Gemini integration ready', history: [] });
}
