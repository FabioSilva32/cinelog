import { useEffect } from 'react';
const selector = 'details[data-popover]';
export function useDismissPopovers() {
  useEffect(() => {
    const close = except => document.querySelectorAll(`${selector}[open]`).forEach(menu => { if(menu !== except) menu.open=false; });
    const pointer = e => { const menu=e.target.closest(selector); close(menu); };
    const toggle = e => { if(e.target.matches?.(selector) && e.target.open) { close(e.target); window.dispatchEvent(new CustomEvent('cinelog:popover-open',{detail:e.target})); } };
    const external = e => { if(!e.detail?.matches?.(selector))close(); };
    const key = e => {if(e.key==='Escape')close();};
    const action = e => {const menu=e.target.closest(selector);if(menu && e.target.closest('button,a'))menu.open=false;};
    document.addEventListener('pointerdown',pointer,true);document.addEventListener('toggle',toggle,true);document.addEventListener('click',action);window.addEventListener('keydown',key);window.addEventListener('cinelog:popover-open',external);
    return()=>{document.removeEventListener('pointerdown',pointer,true);document.removeEventListener('toggle',toggle,true);document.removeEventListener('click',action);window.removeEventListener('keydown',key);window.removeEventListener('cinelog:popover-open',external);};
  },[]);
}
