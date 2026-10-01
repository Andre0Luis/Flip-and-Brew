import React from 'react';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G, Ellipse } from 'react-native-svg';

export interface CupSvgProps {
  variant: string;
  size?: number;
}

export function CupSvg({ variant, size = 60 }: CupSvgProps) {
  const width = size;
  const height = size;

  const renderCup1 = () => ( // Simple Mug
    <G transform="translate(15, 20) scale(0.8)">
      {/* Handle */}
      <Path d="M50,15 C80,10 80,60 50,65" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round"/>
      {/* Cup Body */}
      <Rect x="0" y="0" width="60" height="70" rx="10" fill="#FFF" stroke="#E0E0E0" strokeWidth="2" />
      {/* Coffee inside */}
      <Ellipse cx="30" cy="5" rx="25" ry="5" fill="#4E342E" />
      {/* Smoke */}
      <Path d="M20,-10 Q10,-20 20,-30 T20,-50" fill="none" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <Path d="M40,-15 Q50,-25 40,-35 T40,-55" fill="none" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </G>
  );

  const renderCup2 = () => ( // Espresso Cup
    <G transform="translate(20, 35) scale(0.8)">
      {/* Handle */}
      <Path d="M50,15 C75,10 70,40 50,45" fill="none" stroke="#212121" strokeWidth="6" strokeLinecap="round"/>
      {/* Saucer */}
      <Ellipse cx="25" cy="55" rx="35" ry="10" fill="#E0E0E0" />
      {/* Cup Body */}
      <Path d="M0,0 L50,0 C50,40 40,50 25,50 C10,50 0,40 0,0 Z" fill="#212121" />
      {/* Coffee inside */}
      <Ellipse cx="25" cy="0" rx="22" ry="5" fill="#3E2723" />
      {/* Crema */}
      <Ellipse cx="25" cy="0" rx="18" ry="4" fill="#8D6E63" />
      <Ellipse cx="20" cy="0" rx="15" ry="3" fill="#A1887F" />
    </G>
  );

  const renderCup3 = () => ( // Tall Mug
    <G transform="translate(20, 10) scale(0.8)">
      {/* Handle */}
      <Path d="M40,20 C70,10 70,70 40,80" fill="none" stroke="#1565C0" strokeWidth="8" strokeLinecap="round"/>
      {/* Cup Body */}
      <Rect x="0" y="0" width="50" height="90" rx="8" fill="#1E88E5" stroke="#1565C0" strokeWidth="2" />
      <Rect x="5" y="5" width="40" height="80" rx="5" fill="#42A5F5" opacity="0.5" />
    </G>
  );

  const renderCup4 = () => ( // Glass Cup (Latte)
    <G transform="translate(25, 10) scale(0.8)">
      {/* Handle */}
      <Path d="M40,30 C65,30 65,70 40,70" fill="none" stroke="#BDBDBD" strokeWidth="6" strokeLinecap="round" opacity="0.8"/>
      {/* Cup Body */}
      <Path d="M5,0 L45,0 L35,90 L15,90 Z" fill="#FFF" fillOpacity="0.4" stroke="#9E9E9E" strokeWidth="3" strokeLinejoin="round"/>
      {/* Milk Bottom */}
      <Path d="M17,60 L33,60 L35,90 L15,90 Z" fill="#FFF" />
      {/* Coffee Mix */}
      <Path d="M11,20 L39,20 L33,60 L17,60 Z" fill="#8D6E63" />
      {/* Foam Top */}
      <Path d="M7,10 L43,10 L39,20 L11,20 Z" fill="#FFF" />
      <Ellipse cx="25" cy="10" rx="18" ry="4" fill="#FFF" />
    </G>
  );

  const renderCup5 = () => ( // Paper To-Go Cup
    <G transform="translate(25, 10) scale(0.8)">
      {/* Cup Body */}
      <Path d="M10,20 L40,20 L35,90 L15,90 Z" fill="#FFF" stroke="#E0E0E0" strokeWidth="2" strokeLinejoin="round"/>
      {/* Sleeve */}
      <Path d="M12,40 L38,40 L36,65 L14,65 Z" fill="#8D6E63" />
      {/* Lid */}
      <Rect x="5" y="10" width="40" height="10" rx="3" fill="#212121" />
      <Path d="M15,10 C15,0 35,0 35,10 Z" fill="#212121" />
    </G>
  );

  const renderCup6 = () => ( // Camping Enamel Mug
    <G transform="translate(15, 25) scale(0.8)">
      {/* Handle */}
      <Path d="M50,15 C75,10 75,50 50,55" fill="none" stroke="#B71C1C" strokeWidth="6" strokeLinecap="round"/>
      {/* Cup Body */}
      <Rect x="0" y="0" width="60" height="60" rx="5" fill="#D32F2F" />
      {/* Rim */}
      <Rect x="-2" y="0" width="64" height="6" rx="3" fill="#212121" />
      {/* White speckles */}
      <Circle cx="10" cy="20" r="1.5" fill="#FFF" />
      <Circle cx="25" cy="40" r="1" fill="#FFF" />
      <Circle cx="45" cy="15" r="1.5" fill="#FFF" />
      <Circle cx="35" cy="50" r="2" fill="#FFF" />
      <Circle cx="15" cy="45" r="1" fill="#FFF" />
    </G>
  );

  const renderCup7 = () => ( // Demitasse with Saucer
    <G transform="translate(25, 40) scale(0.7)">
      {/* Handle */}
      <Path d="M40,10 C60,5 60,30 40,35" fill="none" stroke="#FFF" strokeWidth="5" strokeLinecap="round"/>
      {/* Saucer */}
      <Ellipse cx="20" cy="45" rx="30" ry="8" fill="#FFF" stroke="#E0E0E0" strokeWidth="2" />
      {/* Cup Body */}
      <Path d="M-5,0 L45,0 C45,35 35,40 20,40 C5,40 -5,35 -5,0 Z" fill="#FFF" stroke="#E0E0E0" strokeWidth="2" />
      {/* Coffee inside */}
      <Ellipse cx="20" cy="2" rx="20" ry="4" fill="#3E2723" />
      {/* Golden rim */}
      <Ellipse cx="20" cy="0" rx="25" ry="5" fill="none" stroke="#FBC02D" strokeWidth="2" />
    </G>
  );

  const renderCup8 = () => ( // Tumbler Thermal
    <G transform="translate(25, 5) scale(0.8)">
      {/* Tumbler Body */}
      <Path d="M10,15 L40,15 L35,95 L15,95 Z" fill="#424242" />
      {/* Highlights */}
      <Path d="M15,20 L20,20 L18,90 L16,90 Z" fill="#757575" />
      {/* Metal Base */}
      <Rect x="14" y="95" width="22" height="5" rx="2" fill="#BDBDBD" />
      {/* Lid */}
      <Rect x="5" y="5" width="40" height="10" rx="3" fill="#212121" />
      <Rect x="15" y="0" width="20" height="5" rx="2" fill="#212121" />
    </G>
  );

  const renderCup9 = () => ( // Mason Jar
    <G transform="translate(20, 15) scale(0.8)">
      {/* Handle */}
      <Path d="M50,25 C75,25 75,65 50,65" fill="none" stroke="#BDBDBD" strokeWidth="6" strokeLinecap="round" opacity="0.6"/>
      {/* Jar Body */}
      <Rect x="5" y="15" width="50" height="70" rx="5" fill="#E1F5FE" stroke="#81D4FA" strokeWidth="2" opacity="0.5" />
      {/* Threads */}
      <Rect x="10" y="0" width="40" height="15" rx="2" fill="#FFF" stroke="#BDBDBD" strokeWidth="2" opacity="0.7"/>
      <Path d="M12,4 L48,6 M12,8 L48,10 M12,12 L48,14" stroke="#BDBDBD" strokeWidth="1" />
      {/* Coffee inside */}
      <Rect x="8" y="30" width="44" height="52" rx="3" fill="#795548" />
      <Ellipse cx="30" cy="30" rx="22" ry="3" fill="#5D4037" />
    </G>
  );

  const renderCup10 = () => ( // Turkish Finjan
    <G transform="translate(20, 30) scale(0.8)">
      {/* Saucer */}
      <Ellipse cx="30" cy="50" rx="35" ry="10" fill="#FBC02D" stroke="#F57F17" strokeWidth="2" />
      <Path d="M5,50 C10,55 50,55 55,50" fill="none" stroke="#F57F17" strokeWidth="2" />
      {/* Cup Cover/Holder (Metal) */}
      <Path d="M0,10 L60,10 L50,45 L10,45 Z" fill="#FBC02D" />
      {/* Ornaments */}
      <Path d="M5,15 Q30,25 55,15 M10,35 Q30,45 50,35" fill="none" stroke="#F57F17" strokeWidth="2" />
      {/* White Porcelain inner cup */}
      <Ellipse cx="30" cy="8" rx="27" ry="5" fill="#FFF" />
      {/* Coffee inside */}
      <Ellipse cx="30" cy="9" rx="22" ry="4" fill="#3E2723" />
      {/* Dome Lid */}
      <Path d="M0,8 C0,-20 60,-20 60,8 Z" fill="#FBC02D" stroke="#F57F17" strokeWidth="1" />
      <Circle cx="30" cy="-15" r="4" fill="#F57F17" />
    </G>
  );

  let renderFunc = renderCup1;
  if (variant === 'cup_2') renderFunc = renderCup2;
  else if (variant === 'cup_3') renderFunc = renderCup3;
  else if (variant === 'cup_4') renderFunc = renderCup4;
  else if (variant === 'cup_5') renderFunc = renderCup5;
  else if (variant === 'cup_6') renderFunc = renderCup6;
  else if (variant === 'cup_7') renderFunc = renderCup7;
  else if (variant === 'cup_8') renderFunc = renderCup8;
  else if (variant === 'cup_9') renderFunc = renderCup9;
  else if (variant === 'cup_10') renderFunc = renderCup10;

  return (
    <Svg width={width} height={height} viewBox="0 0 100 100">
      {renderFunc()}
    </Svg>
  );
}
