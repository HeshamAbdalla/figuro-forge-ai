
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextTo3DModelInfo, UrlModelInfo } from '../types/ModelViewerTypes';

interface ModelInfoPanelProps {
  show: boolean;
  modelInfo: TextTo3DModelInfo | UrlModelInfo;
}

const ModelInfoPanel: React.FC<ModelInfoPanelProps> = ({ show, modelInfo }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
        >
          <div className="text-sm text-white/80 space-y-2">
            {modelInfo.type === 'text-to-3d' && (
              <>
                {modelInfo.prompt && (
                  <div><span className="text-blue-400 font-medium">Prompt:</span> {modelInfo.prompt}</div>
                )}
                {modelInfo.artStyle && (
                  <div><span className="text-blue-400 font-medium">Style:</span> {modelInfo.artStyle}</div>
                )}
                {modelInfo.metadata?.polycount && (
                  <div><span className="text-blue-400 font-medium">Polygons:</span> {modelInfo.metadata.polycount.toLocaleString()}</div>
                )}
                <div><span className="text-blue-400 font-medium">Task ID:</span> {modelInfo.taskId}</div>
              </>
            )}
            
            {modelInfo.type === 'url' && (
              <>
                <div><span className="text-blue-400 font-medium">File:</span> {modelInfo.fileName}</div>
                <div><span className="text-blue-400 font-medium">URL:</span> {modelInfo.modelUrl.substring(0, 50)}...</div>
                <div><span className="text-blue-400 font-medium">Auto Rotate:</span> {modelInfo.autoRotate ? 'Yes' : 'No'}</div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModelInfoPanel;
