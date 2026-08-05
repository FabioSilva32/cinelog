export function triggerBackdropHover(backdropPath) {
  window.dispatchEvent(new CustomEvent('cinelogBackdropHover', { detail: backdropPath }));
}
