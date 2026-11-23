import { useState, useEffect } from 'react';

export function useCountry() {
  const [country, update] = useState(() => {
    try { return localStorage.getItem('cinelog_country') || 'PT'; } catch { return 'PT'; }
  });
  useEffect(() => {
    const sync = () => { try { update(localStorage.getItem('cinelog_country') || 'PT'); } catch {} };
    window.addEventListener('cinelog-country', sync);
    return () => window.removeEventListener('cinelog-country', sync);
  }, []);
  const setCountry = value => {
    update(value);
    try { localStorage.setItem('cinelog_country', value); } catch {}
    window.dispatchEvent(new Event('cinelog-country'));
  };
  return [country, setCountry];
}
