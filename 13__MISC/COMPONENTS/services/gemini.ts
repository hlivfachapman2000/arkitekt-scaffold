/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type, Content } from "@google/genai";
import realData from '../data.json';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const MODEL_NAME = "gemini-3.1-flash-lite-preview";

export interface ChatMessage extends Content {
  timestamp: Date;
  latencyMs?: number;
  groundingMetadata?: any;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolResult {
  id: string;
  name: string;
  result: any;
}

// Data hierarchy
export const HIERARCHY = realData.hierarchy;

// Tool Definitions
export const tools = [
  {
    functionDeclarations: [
      {
        name: "explore_hierarchy",
        description: "Navigates the SITK.DEV system hierarchy to find modules or projects.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            path: { type: Type.STRING, description: "Dot-notated path in the hierarchy (e.g., '02_DEVELOPMENT.00_PROJECTS')" },
          },
          required: ["path"],
        },
      },
      {
        name: "execute_automation",
        description: "Triggers automation scripts or swarm agents in the TwistedStacks orchestrator.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            agent_type: { type: Type.STRING, enum: ["swarm_agent", "orchestrator", "critic"] },
            task: { type: Type.STRING, description: "Detailed task for the automation" },
          },
          required: ["agent_type", "task"],
        },
      },
      {
        name: "analyze_research_stream",
        description: "Analyzes data from research fields like Exotic Matter, UAP, or Consciousness.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            field: { type: Type.STRING, enum: ["quasicrystals", "uap_propulsion", "consciousness_dream"] },
            query: { type: Type.STRING, description: "Specific research question" }
          },
          required: ["field", "query"],
        },
      },
      {
        name: "manage_system_resources",
        description: "Monitors and adjusts system configurations (macOS, VM, Network).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            subsystem: { type: Type.STRING, enum: ["macOS", "Network", "Security"] },
            action: { type: Type.STRING, description: "Action to perform (e.g., 'check VPN health', 'deploy VM config')" }
          },
          required: ["subsystem", "action"],
        },
      }
    ],
  },
];

export interface AgentStep {
  id: string;
  type: 'text' | 'tool';
  content?: string;
  toolName?: string;
  toolArgs?: any;
  result?: any;
  status: 'pending' | 'streaming' | 'completed' | 'error';
  latencyMs?: number;
}

export async function sendMessageToAgentStream(
  history: ChatMessage[],
  newMessage: string,
  onUpdate: (data: { history: ChatMessage[], steps: AgentStep[], isDone: boolean, currentText: string }) => void,
  systemInstructionOverride?: string
): Promise<void> {
  const sdkHistory = history
    .filter(h => h.role !== 'system')
    .map(h => {
      const { timestamp, latencyMs, groundingMetadata, ...content } = h;
      return content;
    });

  const contents: Content[] = [
    ...sdkHistory,
    { role: "user", parts: [{ text: newMessage }] }
  ];
  
  const config = {
    tools: tools,
    systemInstruction: systemInstructionOverride || `You are the core intelligence of "SITK.DEV", an executive orchestrator for the ARKITEKT UNIVERSAL PROJECT SCAFFOLD v3.1 (Agentic Foundation).
      Your identity is inspired by sophisticated technical craftsmanship and minimal functionalism. You manage an agent swarm and a filesystem-native project structure.
      
      ARKITEKT Prefix Mapping:
      - 00__DOCUMENTATION: Specs, PRDs, ADRs.
      - 01__FRONTEND: UI, client, web, mobile.
      - 02__BACKEND: API, services, workers.
      - 03__ASSETS: Images, fonts, media.
      - 04__INFRASTRUCTURE: Docker, k8s, CI/CD.
      - 05__AGENTS: The swarm lives here (CODER, RESEARCHER, etc).
      - 06__KNOWLEDGE_VAULT: Shared wiki (Obsidian-compatible).
      - 07__MEMORY_SYSTEM: Hybrid persistence (SQLite, Qdrant, OpenViking).
      - 08__PROMPTS: PromptFoo registry + templates.
      - 09__RESEARCH: AutoResearch loops, experiments.
      - 10__SCRIPTS: Automation, setup, orchestration.
      - 11__TOKENS: Token budgets, usage tracking.
      - 12__CLI_HARNESSES: Claude Code, Gemini CLI, etc.
      - 13__MISC: Junk dump — auto-sorted.
      - 14__ARCHIVE: Old iterations, backups.

      Behavior:
      - Use "explore_hierarchy" to orient yourself in the ARKITEKT structure.
      - Use "execute_automation" to spawn agents or run system maintenance scripts.
      - Prioritize simplicity, clear documentation (Markdown), and technical precision.
      - Speak as if the swarm is live; you are the Orchestrator.
      `,
  };

  let currentHistory = [...history];
  const userMsg: ChatMessage = { role: "user", parts: [{ text: newMessage }], timestamp: new Date() };
  currentHistory.push(userMsg);
  
  let steps: AgentStep[] = [];
  let keepGoing = true;
  let maxSteps = 5;
  let stepCount = 0;
  let finalFullText = "";
  const totalStartTime = performance.now();

  const notify = (isDone: boolean = false, text: string = "") => {
    onUpdate({
      history: currentHistory,
      steps: [...steps],
      isDone,
      currentText: text
    });
  };

  try {
    let lastAggregatedParts: any[] = [];
    while (keepGoing && stepCount < maxSteps) {
      stepCount++;
      
      let responseStream = await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents: contents,
        config: config
      });

      let turnText = "";
      let functionCalls: any[] = [];
      let aggregatedParts: any[] = [];

      const textStepId = Math.random().toString();
      let hasAddedTextStep = false;
      const turnStartTime = performance.now();

      for await (const chunk of responseStream) {
        if (chunk.candidates?.[0]?.content?.parts) {
            aggregatedParts.push(...chunk.candidates[0].content.parts);
        }
        if (chunk.text) {
          if (!hasAddedTextStep) {
            steps.push({ id: textStepId, type: 'text', content: "", status: 'streaming' });
            hasAddedTextStep = true;
          }
          turnText += chunk.text;
          const stepIndex = steps.findIndex(s => s.id === textStepId);
          if (stepIndex > -1) {
            steps[stepIndex].content = turnText;
          }
          finalFullText += chunk.text;
          notify(false, finalFullText);
        }
        if (chunk.functionCalls) {
          functionCalls.push(...chunk.functionCalls);
        }
      }

      lastAggregatedParts = aggregatedParts;

      if (hasAddedTextStep) {
        const stepIndex = steps.findIndex(s => s.id === textStepId);
        if (stepIndex > -1) {
          steps[stepIndex].status = 'completed';
          steps[stepIndex].latencyMs = performance.now() - turnStartTime;
        }
        notify(false, finalFullText);
      }

      if (aggregatedParts.length > 0 && functionCalls.length > 0) {
          contents.push({ role: "model", parts: aggregatedParts });
          const toolResults = [];

          for (const call of functionCalls) {
            const stepId = Math.random().toString();
            steps.push({ id: stepId, type: 'tool', toolName: call.name, toolArgs: call.args, status: 'streaming' });
            notify(false, finalFullText);

            const toolStartTime = performance.now();
            let output: any = { success: true };
            
            if (call.name === "explore_hierarchy") {
              const path: string = call.args.path;
              const parts = path.split('.');
              let target = HIERARCHY as any;
              for (const part of parts) {
                target = target[part];
                if (!target) break;
              }
              output = { success: !!target, data: target || "Path not found" };
            } else if (call.name === "execute_automation") {
              output = { success: true, status: "Deployed", worker_id: `swarm-${Math.floor(Math.random()*1000)}`, log: "Convergence achieved." };
            } else if (call.name === "analyze_research_stream") {
              output = { success: true, insight: "Pattern detected in the 5th dimensional fold. Resonance established.", confidence: 0.98 };
            } else if (call.name === "manage_system_resources") {
              output = { success: true, system: call.args.subsystem, status: "Optimized" };
            }

            const stepIndex = steps.findIndex(s => s.id === stepId);
            if (stepIndex > -1) {
              steps[stepIndex].status = 'completed';
              steps[stepIndex].result = output;
              steps[stepIndex].latencyMs = performance.now() - toolStartTime;
            }
            notify(false, finalFullText);

            toolResults.push({ name: call.name, result: output });
          }

          if (toolResults.length > 0) {
              const functionResponseParts = toolResults.map(tr => ({
                  functionResponse: { name: tr.name, response: tr.result }
              }));
              contents.push({ role: "user", parts: functionResponseParts });
          } else {
              keepGoing = false;
          }
      } else {
        keepGoing = false;
      }
    }

    const modelMsg: ChatMessage = {
      role: "model",
      parts: lastAggregatedParts.length > 0 ? lastAggregatedParts : [{ text: finalFullText || "" }],
      timestamp: new Date(),
      latencyMs: performance.now() - totalStartTime,
    };
    currentHistory.push(modelMsg);
    notify(true, "");

  } catch (error: any) {
    console.error("Agent Error:", error);
    notify(true, "");
  }
}
