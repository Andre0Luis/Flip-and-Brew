import React from 'react';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G, Polygon } from 'react-native-svg';

export interface BrewerSvgProps {
  variant: string;
  size?: number;
}

export function BrewerSvg({ variant, size = 100 }: BrewerSvgProps) {
  const width = size;
  const height = size * 1.2;

  const renderV60 = () => (
    <G transform="translate(10, 20) scale(0.8)">
      {/* V60 Cone */}
      <Polygon points="10,0 90,0 50,70" fill="#E0E0E0" stroke="#757575" strokeWidth="3" strokeLinejoin="round"/>
      <Path d="M90,0 Q105,-10 90,20" fill="none" stroke="#757575" strokeWidth="4" strokeLinecap="round"/>
      {/* Coffee inside */}
      <Polygon points="25,25 75,25 50,65" fill="#3E2723" />
      {/* Base Server */}
      <Path d="M40,70 L60,70 L80,120 L20,120 Z" fill="#FFF" fillOpacity="0.8" stroke="#757575" strokeWidth="3"/>
      {/* Base Server Handle */}
      <Path d="M80,90 Q110,90 80,110" fill="none" stroke="#757575" strokeWidth="5" strokeLinecap="round"/>
      {/* Coffee in Server */}
      <Path d="M30,100 L70,100 L75,115 L25,115 Z" fill="#4E342E" />
    </G>
  );

  const renderFrenchPress = () => (
    <G transform="translate(20, 20) scale(0.8)">
      {/* Glass Cylinder */}
      <Rect x="20" y="20" width="60" height="90" rx="5" fill="#FFF" fillOpacity="0.6" stroke="#424242" strokeWidth="3"/>
      {/* Coffee inside */}
      <Rect x="23" y="60" width="54" height="47" rx="3" fill="#3E2723" />
      {/* Plunger */}
      <Rect x="48" y="-10" width="4" height="70" fill="#9E9E9E" />
      <Rect x="35" y="-15" width="30" height="5" rx="2" fill="#212121" />
      <Rect x="25" y="60" width="50" height="4" fill="#9E9E9E" />
      {/* Handle */}
      <Path d="M80,30 Q110,30 80,80" fill="none" stroke="#212121" strokeWidth="6" strokeLinecap="round"/>
      {/* Base Frame */}
      <Rect x="15" y="105" width="70" height="8" rx="2" fill="#212121" />
    </G>
  );

  const renderChemex = () => (
    <G transform="translate(20, 20) scale(0.8)">
      {/* Top Cone */}
      <Path d="M10,0 L90,0 L60,50 L40,50 Z" fill="#FFF" fillOpacity="0.8" stroke="#757575" strokeWidth="3" strokeLinejoin="round"/>
      {/* Wooden Collar */}
      <Rect x="38" y="45" width="24" height="20" rx="2" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
      {/* Tie */}
      <Path d="M62,55 L75,55 L70,65 Z" fill="#D7CCC8" />
      {/* Bottom Flask */}
      <Path d="M40,65 C20,90 10,120 50,120 C90,120 80,90 60,65 Z" fill="#FFF" fillOpacity="0.8" stroke="#757575" strokeWidth="3"/>
      {/* Coffee in Flask */}
      <Path d="M25,100 C20,115 30,117 50,117 C70,117 80,115 75,100 Z" fill="#4E342E" />
    </G>
  );

  const renderMoka = () => (
    <G transform="translate(15, 20) scale(0.8)">
      {/* Bottom Boiler */}
      <Polygon points="30,60 70,60 85,110 15,110" fill="#BDBDBD" stroke="#616161" strokeWidth="3" strokeLinejoin="round"/>
      <Rect x="25" y="55" width="50" height="5" fill="#757575" />
      {/* Top Chamber */}
      <Polygon points="25,0 75,0 65,55 35,55" fill="#E0E0E0" stroke="#616161" strokeWidth="3" strokeLinejoin="round"/>
      {/* Handle */}
      <Path d="M75,10 C100,10 105,40 70,50" fill="none" stroke="#212121" strokeWidth="6" strokeLinecap="round"/>
      {/* Knob */}
      <Circle cx="50" cy="-5" r="5" fill="#212121" />
      {/* Spout */}
      <Path d="M25,10 L10,15 L20,25 Z" fill="#E0E0E0" stroke="#616161" strokeWidth="2" strokeLinejoin="round"/>
    </G>
  );

  const renderEspresso = () => (
    <G transform="translate(10, 30) scale(0.8)">
      {/* Machine Body */}
      <Rect x="20" y="0" width="60" height="90" rx="5" fill="#424242" />
      <Rect x="15" y="0" width="70" height="15" rx="2" fill="#E0E0E0" />
      <Rect x="10" y="90" width="80" height="10" rx="2" fill="#212121" />
      {/* Group Head */}
      <Rect x="40" y="30" width="20" height="15" fill="#9E9E9E" />
      {/* Portafilter Handle */}
      <Path d="M40,40 L10,40" stroke="#212121" strokeWidth="5" strokeLinecap="round"/>
      {/* Drip Tray */}
      <Rect x="20" y="80" width="60" height="10" fill="#BDBDBD" />
      {/* Little Cup */}
      <Rect x="42" y="65" width="16" height="15" rx="2" fill="#FFF" />
      {/* Coffee Drop */}
      <Rect x="48" y="45" width="4" height="20" fill="#4E342E" />
      {/* Dials */}
      <Circle cx="35" cy="20" r="5" fill="#9E9E9E" />
      <Circle cx="65" cy="20" r="5" fill="#9E9E9E" />
    </G>
  );

  const renderAeropress = () => (
    <G transform="translate(30, 20) scale(0.8)">
      {/* Plunger */}
      <Rect x="15" y="-10" width="10" height="40" fill="#424242" />
      <Rect x="5" y="-15" width="30" height="5" rx="2" fill="#212121" />
      <Rect x="10" y="30" width="20" height="5" fill="#212121" />
      {/* Main Chamber */}
      <Rect x="5" y="35" width="30" height="70" fill="#E0E0E0" stroke="#757575" strokeWidth="2" opacity="0.8"/>
      {/* Coffee inside */}
      <Rect x="7" y="60" width="26" height="43" fill="#3E2723" />
      {/* Base Cap */}
      <Polygon points="0,105 40,105 35,115 5,115" fill="#212121" />
    </G>
  );

  const renderSyphon = () => (
    <G transform="translate(20, 10) scale(0.8)">
      {/* Top Chamber */}
      <Path d="M40,0 C60,0 70,20 60,40 C50,60 50,60 50,70 L40,70 C40,60 40,60 30,40 C20,20 30,0 40,0 Z" fill="#FFF" opacity="0.6" stroke="#BDBDBD" strokeWidth="2" />
      {/* Coffee inside top */}
      <Path d="M30,40 C40,60 40,60 40,70 L50,70 C50,60 50,60 60,40 Z" fill="#3E2723" />
      {/* Bottom Globe */}
      <Circle cx="45" cy="95" r="25" fill="#FFF" opacity="0.8" stroke="#BDBDBD" strokeWidth="2" />
      {/* Stand */}
      <Path d="M45,70 L45,130" stroke="#757575" strokeWidth="3" />
      <Path d="M25,130 L65,130" stroke="#212121" strokeWidth="4" strokeLinecap="round" />
      <Path d="M10,80 Q45,100 45,70" fill="none" stroke="#616161" strokeWidth="4" strokeLinecap="round" />
    </G>
  );

  const renderColdDrip = () => (
    <G transform="translate(25, 5) scale(0.8)">
      {/* Top Beaker */}
      <Rect x="10" y="0" width="30" height="40" rx="3" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="2" opacity="0.8" />
      <Rect x="12" y="5" width="26" height="33" fill="#B3E5FC" />
      {/* Middle Coffee */}
      <Rect x="15" y="45" width="20" height="35" rx="2" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="2" />
      <Rect x="17" y="47" width="16" height="31" fill="#3E2723" />
      {/* Valve */}
      <Rect x="23" y="40" width="4" height="5" fill="#212121" />
      {/* Bottom Flask */}
      <Circle cx="25" cy="100" r="20" fill="#FFF" opacity="0.8" stroke="#BDBDBD" strokeWidth="2" />
      <Path d="M15,95 Q25,120 35,95 Z" fill="#4E342E" />
      {/* Wooden Frame */}
      <Path d="M0,-5 L50,-5 M5,42 L45,42 M5,85 L45,85" stroke="#795548" strokeWidth="4" strokeLinecap="round" />
      <Path d="M5,-5 L5,120 M45,-5 L45,120" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
    </G>
  );

  const renderPercolator = () => (
    <G transform="translate(15, 20) scale(0.8)">
      {/* Body */}
      <Path d="M30,0 L70,0 L80,100 L20,100 Z" fill="#E0E0E0" stroke="#757575" strokeWidth="3" strokeLinejoin="round" />
      {/* Glass Knob */}
      <Circle cx="50" cy="-10" r="8" fill="#B3E5FC" stroke="#757575" strokeWidth="2" />
      <Rect x="45" y="-3" width="10" height="3" fill="#757575" />
      {/* Handle */}
      <Path d="M80,20 C110,20 110,80 75,80" fill="none" stroke="#212121" strokeWidth="6" strokeLinecap="round" />
      {/* Spout */}
      <Path d="M30,20 Q10,20 15,35 Z" fill="#E0E0E0" stroke="#757575" strokeWidth="2" strokeLinejoin="round" />
      {/* Base */}
      <Rect x="15" y="100" width="70" height="10" rx="3" fill="#616161" />
    </G>
  );

  const renderCleverDripper = () => (
    <G transform="translate(15, 20) scale(0.8)">
      {/* Cone */}
      <Polygon points="10,0 90,0 55,70 45,70" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="3" strokeLinejoin="round" />
      <Path d="M90,0 Q105,-10 90,20" fill="none" stroke="#FAFAFA" strokeWidth="4" strokeLinecap="round"/>
      {/* Coffee inside */}
      <Polygon points="20,20 80,20 60,60 40,60" fill="#3E2723" />
      {/* Valve Base */}
      <Rect x="35" y="70" width="30" height="10" rx="2" fill="#212121" />
      {/* Base Server (similar to V60 but underneath) */}
      <Path d="M40,80 L60,80 L80,120 L20,120 Z" fill="#FFF" fillOpacity="0.8" stroke="#757575" strokeWidth="3"/>
      {/* Coffee in Server */}
      <Path d="M35,100 L65,100 L75,115 L25,115 Z" fill="#4E342E" />
    </G>
  );

  let renderFunc = renderV60;
  if (variant === 'french_press') renderFunc = renderFrenchPress;
  else if (variant === 'chemex') renderFunc = renderChemex;
  else if (variant === 'moka') renderFunc = renderMoka;
  else if (variant === 'espresso') renderFunc = renderEspresso;
  else if (variant === 'aeropress') renderFunc = renderAeropress;
  else if (variant === 'syphon') renderFunc = renderSyphon;
  else if (variant === 'cold_drip') renderFunc = renderColdDrip;
  else if (variant === 'percolator') renderFunc = renderPercolator;
  else if (variant === 'clever_dripper') renderFunc = renderCleverDripper;

  return (
    <Svg width={width} height={height} viewBox="0 0 100 120">
      {renderFunc()}
    </Svg>
  );
}
