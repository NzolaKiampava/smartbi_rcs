import React from 'react';

const NeuralNetworkAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg
        className="w-full h-full"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Neural Network Nodes */}
        {/* Input Layer */}
        <g className="input-layer">
          <circle cx="100" cy="150" r="8" fill="white" className="animate-pulse">
            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="200" r="8" fill="white" className="animate-pulse">
            <animate attributeName="r" values="8;12;8" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="250" r="8" fill="white" className="animate-pulse">
            <animate attributeName="r" values="7;11;7" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="300" r="8" fill="white" className="animate-pulse">
            <animate attributeName="r" values="6;10;6" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="350" r="8" fill="white" className="animate-pulse">
            <animate attributeName="r" values="8;12;8" dur="1.9s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="400" r="8" fill="white" className="animate-pulse">
            <animate attributeName="r" values="7;11;7" dur="2.3s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Hidden Layer 1 */}
        <g className="hidden-layer-1">
          <circle cx="250" cy="120" r="10" fill="white" className="animate-pulse">
            <animate attributeName="r" values="8;14;8" dur="1.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="180" r="10" fill="white" className="animate-pulse">
            <animate attributeName="r" values="9;13;9" dur="2.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="240" r="10" fill="white" className="animate-pulse">
            <animate attributeName="r" values="7;12;7" dur="1.9s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="300" r="10" fill="white" className="animate-pulse">
            <animate attributeName="r" values="8;13;8" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="360" r="10" fill="white" className="animate-pulse">
            <animate attributeName="r" values="9;14;9" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="420" r="10" fill="white" className="animate-pulse">
            <animate attributeName="r" values="7;12;7" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="480" r="10" fill="white" className="animate-pulse">
            <animate attributeName="r" values="8;13;8" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Hidden Layer 2 */}
        <g className="hidden-layer-2">
          <circle cx="400" cy="140" r="9" fill="white" className="animate-pulse">
            <animate attributeName="r" values="7;12;7" dur="2.0s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="200" r="9" fill="white" className="animate-pulse">
            <animate attributeName="r" values="8;13;8" dur="1.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="260" r="9" fill="white" className="animate-pulse">
            <animate attributeName="r" values="6;11;6" dur="2.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="320" r="9" fill="white" className="animate-pulse">
            <animate attributeName="r" values="8;12;8" dur="1.9s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="380" r="9" fill="white" className="animate-pulse">
            <animate attributeName="r" values="7;13;7" dur="2.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="440" r="9" fill="white" className="animate-pulse">
            <animate attributeName="r" values="9;14;9" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Output Layer */}
        <g className="output-layer">
          <circle cx="550" cy="200" r="12" fill="white" className="animate-pulse">
            <animate attributeName="r" values="10;16;10" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="550" cy="280" r="12" fill="white" className="animate-pulse">
            <animate attributeName="r" values="9;15;9" dur="2.0s" repeatCount="indefinite" />
          </circle>
          <circle cx="550" cy="360" r="12" fill="white" className="animate-pulse">
            <animate attributeName="r" values="11;17;11" dur="1.7s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Animated Connections */}
        <g className="connections" stroke="white" strokeWidth="1" fill="none" opacity="0.6">
          {/* Input to Hidden Layer 1 */}
          <line x1="108" y1="150" x2="242" y2="120">
            <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="108" y1="150" x2="242" y2="180">
            <animate attributeName="stroke-opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" />
          </line>
          <line x1="108" y1="200" x2="242" y2="240">
            <animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="2.2s" repeatCount="indefinite" />
          </line>
          <line x1="108" y1="250" x2="242" y2="300">
            <animate attributeName="stroke-opacity" values="0.5;1.0;0.5" dur="1.9s" repeatCount="indefinite" />
          </line>
          <line x1="108" y1="300" x2="242" y2="360">
            <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="2.1s" repeatCount="indefinite" />
          </line>
          <line x1="108" y1="350" x2="242" y2="420">
            <animate attributeName="stroke-opacity" values="0.4;0.9;0.4" dur="1.7s" repeatCount="indefinite" />
          </line>
          <line x1="108" y1="400" x2="242" y2="480">
            <animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="2.3s" repeatCount="indefinite" />
          </line>

          {/* Hidden Layer 1 to Hidden Layer 2 */}
          <line x1="260" y1="120" x2="391" y2="140">
            <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="1.6s" repeatCount="indefinite" />
          </line>
          <line x1="260" y1="180" x2="391" y2="200">
            <animate attributeName="stroke-opacity" values="0.4;0.9;0.4" dur="2.0s" repeatCount="indefinite" />
          </line>
          <line x1="260" y1="240" x2="391" y2="260">
            <animate attributeName="stroke-opacity" values="0.5;1.0;0.5" dur="1.8s" repeatCount="indefinite" />
          </line>
          <line x1="260" y1="300" x2="391" y2="320">
            <animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="2.2s" repeatCount="indefinite" />
          </line>
          <line x1="260" y1="360" x2="391" y2="380">
            <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="1.9s" repeatCount="indefinite" />
          </line>
          <line x1="260" y1="420" x2="391" y2="440">
            <animate attributeName="stroke-opacity" values="0.4;0.9;0.4" dur="2.1s" repeatCount="indefinite" />
          </line>

          {/* Hidden Layer 2 to Output */}
          <line x1="409" y1="140" x2="538" y2="200">
            <animate attributeName="stroke-opacity" values="0.5;1.0;0.5" dur="1.5s" repeatCount="indefinite" />
          </line>
          <line x1="409" y1="200" x2="538" y2="200">
            <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="2.0s" repeatCount="indefinite" />
          </line>
          <line x1="409" y1="260" x2="538" y2="280">
            <animate attributeName="stroke-opacity" values="0.4;0.9;0.4" dur="1.7s" repeatCount="indefinite" />
          </line>
          <line x1="409" y1="320" x2="538" y2="280">
            <animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="2.3s" repeatCount="indefinite" />
          </line>
          <line x1="409" y1="380" x2="538" y2="360">
            <animate attributeName="stroke-opacity" values="0.5;1.0;0.5" dur="1.8s" repeatCount="indefinite" />
          </line>
          <line x1="409" y1="440" x2="538" y2="360">
            <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="2.1s" repeatCount="indefinite" />
          </line>
        </g>

        {/* Data Flow Particles */}
        <g className="data-particles">
          <circle r="2" fill="white" opacity="0.8">
            <animateMotion dur="3s" repeatCount="indefinite">
              <path d="M 108,150 Q 175,135 242,120" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
          </circle>
          
          <circle r="2" fill="white" opacity="0.8">
            <animateMotion dur="2.5s" repeatCount="indefinite">
              <path d="M 260,240 Q 325,250 391,260" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" />
          </circle>
          
          <circle r="2" fill="white" opacity="0.8">
            <animateMotion dur="2s" repeatCount="indefinite">
              <path d="M 409,320 Q 475,290 538,280" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </circle>

          <circle r="2" fill="white" opacity="0.8">
            <animateMotion dur="3.2s" repeatCount="indefinite">
              <path d="M 108,300 Q 175,330 242,360" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;0" dur="3.2s" repeatCount="indefinite" />
          </circle>

          <circle r="2" fill="white" opacity="0.8">
            <animateMotion dur="2.8s" repeatCount="indefinite">
              <path d="M 260,420 Q 325,430 391,440" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;0" dur="2.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Brain Wave Effect */}
        <g className="brain-waves" stroke="white" strokeWidth="2" fill="none" opacity="0.3">
          <path d="M 50,100 Q 150,80 250,100 T 450,100 T 650,100">
            <animate attributeName="d" 
              values="M 50,100 Q 150,80 250,100 T 450,100 T 650,100;
                      M 50,100 Q 150,120 250,100 T 450,100 T 650,100;
                      M 50,100 Q 150,80 250,100 T 450,100 T 650,100" 
              dur="4s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite" />
          </path>
          
          <path d="M 50,500 Q 150,480 250,500 T 450,500 T 650,500">
            <animate attributeName="d" 
              values="M 50,500 Q 150,480 250,500 T 450,500 T 650,500;
                      M 50,500 Q 150,520 250,500 T 450,500 T 650,500;
                      M 50,500 Q 150,480 250,500 T 450,500 T 650,500" 
              dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.1;0.5;0.1" dur="3.5s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    </div>
  );
};

export default NeuralNetworkAnimation;