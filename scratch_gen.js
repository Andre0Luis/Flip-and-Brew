const fs = require('fs');

function generateBetterSVG(stageIndex) {
  let svg = '<svg width="200" height="260" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">';
  svg += '<defs><linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4CAF50"/><stop offset="1" stop-color="#1B5E20"/></linearGradient></defs>';
  
  const maxHeight = 160; 
  const currentHeight = Math.min(maxHeight, stageIndex * 15);
  
  // Trunk
  if (currentHeight > 0) {
    svg += `<path d="M100,250 Q105,${250 - currentHeight/2} 100,${250 - currentHeight}" stroke="#5D4037" stroke-width="${Math.max(2, currentHeight/15)}" fill="none" stroke-linecap="round"/>`;
  }
  
  // Add leaves based on height
  const nodes = Math.floor(currentHeight / 20);
  for(let i=1; i<=nodes; i++) {
    const y = 250 - (i * 20);
    const scale = 0.5 + (i * 0.1);
    // leaf path
    const path = 'M0,0 C10,-5 20,-20 25,-40 C15,-20 5,-5 0,0';
    svg += `<g transform="translate(100,${y}) rotate(-60) scale(${scale})"><path d="${path}" fill="url(#leafGrad)"/></g>`;
    svg += `<g transform="translate(100,${y}) rotate(60) scale(${scale})"><path d="${path}" fill="url(#leafGrad)"/></g>`;
  }
  
  svg += '</svg>';
  return svg;
}

fs.writeFileSync('/Users/luizinho/Projects/FlipAndBrew/scratch_plant.svg', generateBetterSVG(10));
console.log('done');
