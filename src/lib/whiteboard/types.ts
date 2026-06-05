export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  id: string;
  points: Point[];
};

export type Tool = "pen" | "eraser";

export type MistakeDot = {
  x: number;
  y: number;
};

export type MistakeSeverity = "notational" | "mechanical" | "procedural" | "conceptual";

export type Mistake = {
  id: string;
  tag: string;
  severity: MistakeSeverity | string;
  explanation: string;
  erroneousLatex?: string;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  dot: MistakeDot;
};

export type AnalysisResult = {
  studentTex: string;
  annotatedTex: string;
  continuationTex: string;
  mistakes: Mistake[];
  mistakeCount: number;
};

export type ChatMessage = {
  id: string;
  role: "student" | "assistant";
  content: string;
  createdAt: string;
};

export type WhiteboardSnapshot = {
  strokes: Stroke[];
  analysis: AnalysisResult | null;
  chatMessages: ChatMessage[];
  referenceTex: string;
  contextTex: string;
};
