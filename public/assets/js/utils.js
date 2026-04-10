/**
 * Muestra una notificación toast que desaparece automáticamente.
 * @param {string} msg
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration - ms antes de desaparecer
 */
export function toast(msg, type = 'success', duration = 4000) {
  let $c = document.getElementById('toastContainer');
  if (!$c) {
    $c = document.createElement('div');
    $c.id = 'toastContainer';
    document.body.appendChild($c);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  $c.appendChild(el);
  // Doble rAF para garantizar la transición CSS
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('toast-show')));
  setTimeout(() => {
    el.classList.remove('toast-show');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, duration);
}

export function money(value) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function number(value, digits = 2) {
  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0));
}