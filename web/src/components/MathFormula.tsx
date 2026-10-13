import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  displayMode = true,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      console.warn('KaTeX rendering error:', e);
      return `<span class="font-mono">${formula}</span>`;
    }
  }, [formula, displayMode]);

  return (
    <div
      className={`overflow-x-auto py-1 text-center sm:text-left ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
