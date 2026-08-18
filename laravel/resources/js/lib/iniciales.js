export function iniciales(nombre) {
    const partes = String(nombre ?? '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
}
