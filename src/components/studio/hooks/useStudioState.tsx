
import { useState } from "react";

export const useStudioState = () => {
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [customModelFile, setCustomModelFile] = useState<File | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [textTo3DConfigModalOpen, setTextTo3DConfigModalOpen] = useState(false);
  const [generationModalOpen, setGenerationModalOpen] = useState(false);
  const [textTo3DConfigPrompt, setTextTo3DConfigPrompt] = useState("");

  return {
    customModelUrl,
    setCustomModelUrl,
    customModelFile,
    setCustomModelFile,
    uploadModalOpen,
    setUploadModalOpen,
    configModalOpen,
    setConfigModalOpen,
    textTo3DConfigModalOpen,
    setTextTo3DConfigModalOpen,
    generationModalOpen,
    setGenerationModalOpen,
    textTo3DConfigPrompt,
    setTextTo3DConfigPrompt
  };
};
