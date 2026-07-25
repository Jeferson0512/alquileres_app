import Badge from '@/Components/Badge';

export default function StatusBadge({ estado, activeValue = 'ACTIVO', activeLabel = 'Activo', inactiveLabel = 'De baja' }) {
    const activo = estado === activeValue;
    return <Badge variant={activo ? 'success' : 'danger'}>{activo ? activeLabel : inactiveLabel}</Badge>;
}
