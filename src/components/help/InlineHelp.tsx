import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  X, 
  ExternalLink, 
  ChevronDown,
  ChevronUp,
  Lightbulb
} from "lucide-react";

interface InlineHelpProps {
  title: string;
  description: string;
  videoUrl?: string;
  duration?: string;
  tips?: string[];
  variant?: 'default' | 'compact' | 'tip';
  dismissible?: boolean;
  defaultOpen?: boolean;
}

export function InlineHelp({ 
  title, 
  description, 
  videoUrl, 
  duration, 
  tips = [],
  variant = 'default',
  dismissible = true,
  defaultOpen = false
}: InlineHelpProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const TipVariant = () => (
    <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 border-yellow-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-800 mb-1">{title}</h4>
            <p className="text-sm text-yellow-700">{description}</p>
            {tips.length > 0 && (
              <ul className="mt-2 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-xs text-yellow-700 flex items-start gap-2">
                    <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-1">
            {videoUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(videoUrl, '_blank')}
                className="text-yellow-600 hover:bg-yellow-100 p-1 h-auto"
                title="Ver tutorial"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {dismissible && (
              <Button variant="ghost" size="sm" onClick={handleDismiss} className="p-1 h-auto">
                <X className="h-4 w-4 text-yellow-600" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CompactVariant = () => (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {videoUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(videoUrl, '_blank')}
                className="text-xs text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {duration || 'Tutorial'}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 h-auto text-blue-600"
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {dismissible && (
              <Button variant="ghost" size="sm" onClick={handleDismiss} className="p-1 h-auto text-blue-600">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {isOpen && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-sm text-blue-700 mb-3">{description}</p>
            {tips.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Dicas</h5>
                <ul className="space-y-1">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-xs text-blue-700 flex items-start gap-2">
                      <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const DefaultVariant = () => (
    <Card className="border-[#0098DA] bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0098DA] to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <div className="flex items-center gap-2">
                {videoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(videoUrl, '_blank')}
                    className="text-xs bg-[#0098DA] text-white border-[#0098DA] hover:bg-blue-600"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {duration || 'Tutorial'}
                  </Button>
                )}
                {dismissible && (
                  <Button variant="ghost" size="sm" onClick={handleDismiss} className="p-1 h-auto">
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">{description}</p>

            {tips.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Dicas Importantes
                </h5>
                <ul className="space-y-2">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-[#0098DA] rounded-full mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (variant === 'tip') return <TipVariant />;
  if (variant === 'compact') return <CompactVariant />;
  return <DefaultVariant />;
}

// Quick help suggestions component
interface QuickHelpProps {
  suggestions: Array<{
    title: string;
    description: string;
    action?: () => void;
  }>;
}

export function QuickHelp({ suggestions }: QuickHelpProps) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#0098DA]" />
          Sugestões Rápidas
        </h4>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border border-gray-200 ${
                suggestion.action ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={suggestion.action}
            >
              <h5 className="text-sm font-medium text-gray-900 mb-1">{suggestion.title}</h5>
              <p className="text-xs text-gray-600">{suggestion.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}