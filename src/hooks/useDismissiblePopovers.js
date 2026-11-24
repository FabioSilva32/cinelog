import {useEffect} from 'react';
export function useDismissiblePopovers(){useEffect(()=>{
 const selector='details[data-popover], details.tier-more';
 const open=()=>[...document.querySelectorAll(selector)].filter(menu=>menu.open);
 const outside=event=>{for(const menu of open())if(!menu.contains(event.target))menu.open=false;};
 const escape=event=>{if(event.key!=='Escape')return;const menus=open().filter(menu=>menu.contains(document.activeElement));if(!menus.length)return;event.preventDefault();event.stopPropagation();for(const menu of menus){menu.open=false;menu.querySelector('summary')?.focus();}};
 const toggle=event=>{const menu=event.target;if(!menu.matches?.(selector)||!menu.open)return;for(const other of open())if(other!==menu)other.open=false;window.dispatchEvent(new CustomEvent('cinelog:popover-open',{detail:menu}));};
 const external=event=>{for(const menu of open())if(event.detail!==menu)menu.open=false;};
 document.addEventListener('pointerdown',outside);document.addEventListener('click',outside);document.addEventListener('focusin',outside);document.addEventListener('keydown',escape,true);document.addEventListener('toggle',toggle,true);window.addEventListener('cinelog:popover-open',external);
 return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('click',outside);document.removeEventListener('focusin',outside);document.removeEventListener('keydown',escape,true);document.removeEventListener('toggle',toggle,true);window.removeEventListener('cinelog:popover-open',external);};
},[]);}
