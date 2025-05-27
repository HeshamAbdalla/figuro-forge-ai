
export interface TextTo3DConfig {
  prompt: string;
  artStyle: string;
  negativePrompt: string;
  mode: 'preview' | 'refine';
  targetPolycount?: number;
  topologyType?: 'quad' | 'triangle';
  texture?: boolean;
  seedValue?: number;
}

export const artStyles = [
  { value: "realistic", label: "Realistic" },
  { value: "cartoon", label: "Cartoon" },
  { value: "low-poly", label: "Low Poly" },
  { value: "sculpture", label: "Sculpture" },
  { value: "pbr", label: "PBR Material" },
  { value: "anime", label: "Anime" },
  { value: "clay", label: "Clay" }
];

export const modelModes = [
  { value: "preview", label: "Preview (Fast)", description: "Quick generation with basic quality" },
  { value: "refine", label: "Refine (High Quality)", description: "Slower but higher quality generation" }
];

export const topologyTypes = [
  { value: "quad", label: "Quad" },
  { value: "triangle", label: "Triangle" }
];
