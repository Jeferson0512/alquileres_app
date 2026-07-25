/**
 * Convierte cualquier fecha/datetime que venga del backend (ISO 8601,
 * "YYYY-MM-DD" o "YYYY-MM-DD HH:mm:ss") al formato dd/mm/aaaa usado en
 * todas las tablas de la app.
 */
export default function formatDate(value) {
    if (!value) return '-';
    const isoDay = String(value).slice(0, 10);
    const [anio, mes, dia] = isoDay.split('-');
    if (!anio || !mes || !dia) return isoDay;

    return `${dia}/${mes}/${anio}`;
}
