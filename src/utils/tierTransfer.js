export function decodeTierTransfer(code){
 let value;try{value=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));}catch{throw new Error('This transfer code is invalid or incomplete.');}
 if(!value||typeof value!=='object'||Array.isArray(value)||!Object.keys(value).length)throw new Error('The transfer code contains no tier lists.');
 for(const [id,list] of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(id)||!list||typeof list!=='object'||Array.isArray(list)||('tiers'in list&&!Array.isArray(list.tiers))||('tierData'in list&&(!list.tierData||typeof list.tierData!=='object'||Array.isArray(list.tierData))))throw new Error('The transfer code has an unsupported tier-list format.');}
 for(const list of Object.values(value)){if(list.tiers?.some(tier=>!tier||typeof tier!=='object'||(!['string','number'].includes(typeof tier.id))||typeof tier.label!=='string'))throw new Error('The transfer code contains invalid tier rows.');if(list.tierData&&Object.values(list.tierData).some(ids=>!Array.isArray(ids)||ids.some(id=>!['string','number'].includes(typeof id))))throw new Error('The transfer code contains invalid placements.');}
 return value;
}
