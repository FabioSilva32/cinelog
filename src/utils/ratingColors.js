// Shared personal-score palette; public TMDB scores keep their own styling.
export function ratingTone(value) {
  const score=Number(value);
  return score>=9?'perfect':score>=8?'excellent':score>=6?'good':score>=4?'mixed':score>=2?'low':'poor';
}
export const ratingColors={poor:'#b3b5c1',low:'#ffb52e',mixed:'#39ff14',good:'#1e9bff',excellent:'#bd5cff',perfect:'#ff3554'};
export function getRatingColor(value){return Number(value)>0?ratingColors[ratingTone(value)]:'#a3a3a3';}

const standardTiers={s:['S',['#ff4d4d','#dec17c','#c49aff','#a855f7','#ed5b78'],'perfect'],a:['A',['#ff8c00','#d56b83','#34d399','#c49aff','#2dd4bf','#b18ae8'],'excellent'],b:['B',['#f0c040','#78b8a5','#56b8f5','#38bdf8','#68b8e8','#27bfff','#16c9ff'],'good'],c:['C',['#4dcd80','#91a4bc','#facc15','#059669','#96b89d','#22dc8e','#14f195'],'mixed'],d:['D',['#4da6ff','#cb956c','#fb923c','#f97316','#9e969b','#b3b5c1'],'low'],f:['F',['#9b59b6','#b98490','#f07185','#ef4444','#9e969b'],'poor']};
export function tierDisplayColor(tier){const standard=standardTiers[tier.id];return standard&&tier.label===standard[0]&&[...standard[1],ratingColors[standard[2]]].includes(tier.color)?ratingColors[standard[2]]:tier.color;}
