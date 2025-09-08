import React from 'react';

interface TransulLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const TransulLogo: React.FC<TransulLogoProps> = ({ 
  width = 120, 
  height = 40, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
      {/* Transul Logo SVG - matching the attached image */}
      <svg 
        viewBox="0 0 300 80" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Main logo text "Transul" */}
        <g transform="translate(10, 15)">
          {/* Letter T */}
          <rect x="0" y="0" width="35" height="8" fill="#000"/>
          <rect x="13.5" y="8" width="8" height="32" fill="#000"/>
          
          {/* Letter r */}
          <rect x="45" y="12" width="6" height="28" fill="#000"/>
          <rect x="51" y="12" width="10" height="6" fill="#000"/>
          <rect x="57" y="18" width="6" height="6" fill="#000"/>
          
          {/* Letter a */}
          <rect x="70" y="18" width="12" height="6" fill="#000"/>
          <rect x="68" y="24" width="4" height="16" fill="#000"/>
          <rect x="82" y="24" width="4" height="16" fill="#000"/>
          <rect x="70" y="30" width="12" height="4" fill="#000"/>
          
          {/* Letter n */}
          <rect x="95" y="12" width="6" height="28" fill="#000"/>
          <rect x="101" y="12" width="10" height="6" fill="#000"/>
          <rect x="111" y="18" width="6" height="22" fill="#000"/>
          
          {/* Letter s */}
          <rect x="125" y="18" width="12" height="6" fill="#000"/>
          <rect x="125" y="24" width="6" height="6" fill="#000"/>
          <rect x="127" y="30" width="10" height="4" fill="#000"/>
          <rect x="131" y="34" width="6" height="6" fill="#000"/>
          <rect x="125" y="34" width="12" height="6" fill="#000"/>
          
          {/* Letter u */}
          <rect x="145" y="18" width="6" height="16" fill="#000"/>
          <rect x="151" y="34" width="10" height="6" fill="#000"/>
          <rect x="161" y="18" width="6" height="22" fill="#000"/>
          
          {/* Letter l */}
          <rect x="175" y="8" width="6" height="32" fill="#000"/>
          <rect x="181" y="34" width="8" height="6" fill="#000"/>
        </g>
        
        {/* Subtitle "TRANSPORTE" */}
        <g transform="translate(20, 55)">
          <text x="0" y="12" fontSize="12" fontFamily="Arial, sans-serif" fill="#000" letterSpacing="8">
            TRANSPORTE
          </text>
        </g>
      </svg>
    </div>
  );
};

export default TransulLogo;