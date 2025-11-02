import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Blocks } from 'lucide-react';

interface WorkflowCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWithAI: () => void;
  onBuildManually: () => void;
}

export const WorkflowCreationModal: React.FC<WorkflowCreationModalProps> = ({
  isOpen,
  onClose,
  onStartWithAI,
  onBuildManually,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-3xl border-2 border-gray-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b-2 border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-100">Create New Workflow</h2>
              <p className="text-gray-400 mt-1 font-medium">
                Choose how you'd like to build your DeFi automation
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-200 hover:bg-gray-800"
              title="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Option */}
          <Card
            onClick={onStartWithAI}
            className="group relative overflow-hidden cursor-pointer border-2 border-gray-700 hover:border-blue-600 transition-all duration-200 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200 border border-blue-600">
                <Zap className="w-8 h-8 text-blue-200" />
              </div>
              <CardTitle className="text-2xl font-black text-gray-100 group-hover:text-white mb-3 transition-colors">
                Start with AI
              </CardTitle>
              <CardDescription className="text-gray-400 group-hover:text-blue-100 leading-relaxed transition-colors">
                Describe your workflow in natural language and let AI generate the nodes and
                connections for you. Perfect for quick prototyping.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="inline-flex items-center text-sm text-blue-400 group-hover:text-white font-bold transition-colors">
                <span>Get Started</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Manual Option */}
          <Card
            onClick={onBuildManually}
            className="group relative overflow-hidden cursor-pointer border-2 border-gray-700 hover:border-gray-500 transition-all duration-200 hover:shadow-2xl hover:shadow-gray-500/20 hover:-translate-y-1"
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200 border border-gray-600">
                <Blocks className="w-8 h-8 text-gray-300" />
              </div>
              <CardTitle className="text-2xl font-black text-gray-100 group-hover:text-white mb-3 transition-colors">
                Build Manually
              </CardTitle>
              <CardDescription className="text-gray-400 group-hover:text-gray-200 leading-relaxed transition-colors">
                Start with a blank canvas and drag-and-drop nodes to create your workflow. Full
                control over every connection and configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="inline-flex items-center text-sm text-gray-400 group-hover:text-white font-bold transition-colors">
                <span>Open Canvas</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-900 border-t-2 border-gray-800">
          <p className="text-sm text-gray-400 text-center font-medium">
            You can always switch between AI and manual editing at any time
          </p>
        </div>
      </div>
    </div>
  );
};
