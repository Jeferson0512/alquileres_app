import IconButton from '@/Components/IconButton';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import formatDate from '@/lib/date';
import { iniciales } from '@/lib/iniciales';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, MessageCircle } from 'lucide-react';
import { useRef, useState } from 'react';

const DEBT_IGNORE_STORAGE_KEY = 'avisos.ignore.deudaAnterior.v1';

function loadIgnoredDebtMap() {
    try {
        const raw = localStorage.getItem(DEBT_IGNORE_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
        return {};
    }
}

function saveIgnoredDebtMap(data) {
    try {
        localStorage.setItem(DEBT_IGNORE_STORAGE_KEY, JSON.stringify(data || {}));
    } catch (_) {
        // No-op: si falla storage, el toggle funciona solo en memoria.
    }
}

function debtKey(row, periodoId) {
    const idPersona = Number(row?.id_persona || 0);
    const idUnidad = Number(row?.id_unidad || 0);
    if (!idPersona || !idUnidad || !periodoId) return '';
    return `${periodoId}|${idPersona}|${idUnidad}`;
}

function money(value) {
    return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

function number(value, decimals = 2) {
    return Number(value ?? 0).toFixed(decimals);
}

function getMontoLuzFinal(row) {
    return Number(row?.monto_luz || 0) + Number(row?.ajuste_minimo_luz || 0);
}
function getPagadoTotal(row) {
    return Number(row?.pagado_total || 0);
}
function getSaldoPendiente(row) {
    return Number(row?.saldo_pendiente ?? row?.total_cobrar ?? 0);
}
function getAvisoMinimoKwh(config) {
    const value = Number(config?.minimo_kwh_aviso ?? 13.5);
    return Number.isFinite(value) && value > 0 ? value : 13.5;
}

function toTitleCase(value) {
    return String(value || '')
        .toLocaleLowerCase('es-PE')
        .replace(/(^|\s|[-'])\p{L}/gu, (match) => match.toLocaleUpperCase('es-PE'));
}
function splitWords(value) {
    return String(value || '').trim().split(/\s+/).filter(Boolean);
}
function initialWithDot(word) {
    const clean = String(word || '').trim();
    if (!clean) return '';
    return clean.charAt(0).toLocaleUpperCase('es-PE') + '.';
}
function compactNamePart(words) {
    if (!words.length) return '';
    const [first, ...rest] = words;
    return [toTitleCase(first), ...rest.map(initialWithDot)].join(' ');
}
function formatTenantDisplayName(row) {
    const nombres = splitWords(row?.nombres);
    const apellidos = splitWords(row?.apellidos);
    if (!nombres.length && !apellidos.length) return toTitleCase(row?.inquilino || '');
    return [compactNamePart(nombres), compactNamePart(apellidos)].filter(Boolean).join(' ');
}
function capitalize(text) {
    const value = String(text || '');
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function isCobroPagadoCompleto(row, saldoTotal) {
    const estado = String(row?.estado_pago || '').toUpperCase();
    if (estado === 'PAGADO') return true;
    if (estado === 'PENDIENTE' || estado === 'PARCIAL' || estado === 'ANULADO') return false;
    return saldoTotal <= 0.009;
}

function periodoTextoDe(periodo) {
    if (!periodo) return 'Periodo actual';
    return capitalize(
        new Date(periodo.anio, periodo.mes - 1, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }),
    );
}

function buildAvisoFilename(row, periodo) {
    let mesAnio = 'aviso';
    if (periodo) {
        const d = new Date(periodo.anio, periodo.mes - 1, 1);
        const mes = d.toLocaleDateString('es-PE', { month: 'long' });
        mesAnio = mes.charAt(0).toUpperCase() + mes.slice(1) + '-' + periodo.anio;
    }
    const slugPart = (str) => {
        if (!str) return '';
        return str.trim().split(/\s+/).map((w, i) => {
            const clean = w.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]/g, '');
            return i === 0 ? clean : clean.charAt(0).toUpperCase();
        }).join('');
    };
    const nombre = slugPart(row.nombres || '');
    const apellido = slugPart(row.apellidos || '');
    const inquilinoSlug = nombre || apellido ? [nombre, apellido].filter(Boolean).join('_') : slugPart(row.inquilino || 'desconocido');
    return `${mesAnio}-${row.codigo_unidad}-${inquilinoSlug}.png`;
}

function roundRect(ctx, x, y, width, height, radius, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}
function drawSectionTitle(ctx, text, x, y) {
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 30px Segoe UI';
    ctx.fillText(text, x, y);
}
function drawMiniMetric(ctx, label, value, x, y) {
    ctx.fillStyle = '#64748b';
    ctx.font = '22px Segoe UI';
    ctx.fillText(label, x, y);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 30px Segoe UI';
    ctx.fillText(value, x, y + 38);
}
function drawLine(ctx, label, value, y) {
    ctx.fillStyle = '#475569';
    ctx.font = '26px Segoe UI';
    ctx.fillText(label, 120, y);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px Segoe UI';
    ctx.fillText(value, 760, y);
    return y + 48;
}
function drawQrFallback(ctx, x, y, width, height) {
    roundRect(ctx, x, y, width, height, 18, '#e2e8f0');
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Segoe UI';
    ctx.fillText('QR', x + 38, y + 70);
    ctx.fillText('pendiente', x + 12, y + 102);
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text || '').split(' ');
    let line = '';
    let posY = y;
    for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line, x, posY);
            line = word;
            posY += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line) ctx.fillText(line, x, posY);
}
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('No se pudo cargar el QR'));
        img.src = src;
    });
}
function formatMoneyText(value) {
    return `S/ ${number(value ?? 0, 2)}`;
}

async function generateAvisoPng(row, config, periodo, saldoTotal, deudaAnterior, isPaid) {
    // El umbral se evalua contra el consumo del PERIODO COMPLETO de la
    // unidad (todos los tramos sumados, decision 5.6) -- lo que se
    // muestra sigue siendo el consumo propio de este cobro/tramo.
    const consumo = Number(row?.consumo_kwh || 0);
    const consumoPeriodoUnidad = Number(row?.consumo_periodo_unidad ?? consumo);
    const avisoMinimoKwh = getAvisoMinimoKwh(config);
    const isLowConsumo = consumoPeriodoUnidad < avisoMinimoKwh;
    const displayConsumo = isLowConsumo ? 0 : consumo;

    const tenantName = formatTenantDisplayName(row);
    const pagado = getPagadoTotal(row);
    const saldoPeriodo = getSaldoPendiente(row);
    const hasDeudaAnterior = deudaAnterior > 0;
    const showBalanceStrip = hasDeudaAnterior;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = isPaid ? 1360 : (showBalanceStrip ? 1520 : 1380);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, isPaid ? '#14532d' : '#0f172a');
    gradient.addColorStop(1, isPaid ? '#16a34a' : '#1d4ed8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.beginPath();
    ctx.arc(930, 180, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(150, 1160, 180, 0, Math.PI * 2);
    ctx.fill();

    roundRect(ctx, 70, 70, 940, 1240, 38, '#ffffff');

    ctx.fillStyle = '#64748b';
    ctx.font = '28px Segoe UI';
    ctx.fillText('Resumen de pago', 120, 150);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 52px Segoe UI';
    ctx.fillText(tenantName, 120, 220);

    ctx.fillStyle = '#475569';
    ctx.font = '28px Segoe UI';
    const periodoTexto = periodoTextoDe(periodo);
    ctx.fillText(`Unidad ${row.codigo_unidad} · ${periodoTexto}`, 120, 270);

    roundRect(ctx, 700, 120, 250, 190, 28, isPaid ? '#dcfce7' : '#eff6ff');
    ctx.fillStyle = isPaid ? '#15803d' : '#2563eb';
    ctx.font = '24px Segoe UI';
    ctx.fillText(isPaid ? 'Pagado' : (hasDeudaAnterior ? 'Pendiente total' : 'Pendiente mes'), 728, 175);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px Segoe UI';
    ctx.fillText(formatMoneyText(isPaid ? Math.max(pagado, Number(row.total_cobrar || 0)) : (hasDeudaAnterior ? saldoTotal : saldoPeriodo)), 728, 230);

    if (showBalanceStrip) {
        roundRect(ctx, 120, 314, 800, 118, 24, '#eef2ff');
        let balanceX = 160;
        if (pagado > 0) {
            drawMiniMetric(ctx, 'Pagado', formatMoneyText(pagado), balanceX, 360);
            balanceX += 220;
        }
        drawMiniMetric(ctx, 'Pendiente mes', formatMoneyText(isPaid ? 0 : saldoPeriodo), balanceX, 360);
        if (deudaAnterior > 0) {
            drawMiniMetric(ctx, 'Deuda anterior', formatMoneyText(deudaAnterior), balanceX + 250, 360);
        }
    }

    drawSectionTitle(ctx, 'Detalle del cobro', 120, showBalanceStrip ? 480 : 360);
    let y = showBalanceStrip ? 540 : 420;
    y = drawLine(ctx, 'Alquiler', formatMoneyText(row.monto_alquiler), y);
    y = drawLine(ctx, 'Luz', formatMoneyText(getMontoLuzFinal(row)), y);
    y = drawLine(ctx, 'Agua', formatMoneyText(row.monto_agua), y);
    if (Number(row.monto_gas || 0) > 0) y = drawLine(ctx, 'Gas', formatMoneyText(row.monto_gas), y);
    if (Number(row.otros_conceptos || 0) > 0) y = drawLine(ctx, 'Otros conceptos', formatMoneyText(row.otros_conceptos), y);
    if (pagado > 0) y = drawLine(ctx, 'Pagado acumulado', formatMoneyText(pagado), y);
    y = drawLine(ctx, 'Saldo del periodo', formatMoneyText(isPaid ? 0 : saldoPeriodo), y);

    drawSectionTitle(ctx, 'Consumo', 120, showBalanceStrip ? 830 : 710);
    roundRect(ctx, 120, showBalanceStrip ? 860 : 740, 260, 180, 28, '#f8fafc');
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 64px Segoe UI';
    ctx.fillText(number(displayConsumo, 2), 170, showBalanceStrip ? 960 : 840);
    ctx.fillStyle = '#64748b';
    ctx.font = '28px Segoe UI';
    ctx.fillText('kWh del periodo', 170, showBalanceStrip ? 1005 : 885);

    if (!isPaid) {
        drawSectionTitle(ctx, 'Medios de pago', 460, showBalanceStrip ? 830 : 710);
        roundRect(ctx, 460, showBalanceStrip ? 860 : 740, 460, 180, 28, '#f8fafc');
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 30px Segoe UI';
        ctx.fillText('Yape', 500, showBalanceStrip ? 920 : 800);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 28px Segoe UI';
        wrapText(ctx, config?.yape_titular || 'Pendiente configurar', 500, showBalanceStrip ? 955 : 835, 220, 28);
        ctx.fillStyle = '#475569';
        ctx.font = '26px Segoe UI';
        ctx.fillText(config?.yape_numero || 'Sin numero', 500, showBalanceStrip ? 995 : 875);

        if (config?.yape_qr) {
            try {
                const img = await loadImage(config.yape_qr);
                ctx.drawImage(img, 770, showBalanceStrip ? 880 : 760, 120, 120);
            } catch (_) {
                drawQrFallback(ctx, 770, showBalanceStrip ? 880 : 760, 120, 120);
            }
        } else {
            drawQrFallback(ctx, 770, showBalanceStrip ? 880 : 760, 120, 120);
        }

        drawSectionTitle(ctx, 'Transferencia', 120, showBalanceStrip ? 1130 : 1010);
        roundRect(ctx, 120, showBalanceStrip ? 1160 : 1040, 800, 170, 28, '#f8fafc');
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 30px Segoe UI';
        ctx.fillText(config?.banco_nombre || 'Banco pendiente', 160, showBalanceStrip ? 1220 : 1100);
        ctx.fillStyle = '#475569';
        ctx.font = '26px Segoe UI';
        ctx.fillText(`Titular: ${config?.banco_titular || 'Sin titular'}`, 160, showBalanceStrip ? 1265 : 1145);
        ctx.fillText(`Cuenta: ${config?.banco_cuenta || 'Sin cuenta'}`, 160, showBalanceStrip ? 1305 : 1185);
        ctx.fillText(`CCI: ${config?.banco_cci || 'Sin CCI'}`, 470, showBalanceStrip ? 1305 : 1185);

        ctx.fillStyle = '#64748b';
        ctx.font = '24px Segoe UI';
        wrapText(ctx, config?.mensaje_base || 'Hola, te comparto tu resumen del mes.', 120, showBalanceStrip ? 1380 : 1260, 820, 32);
    } else {
        drawSectionTitle(ctx, 'Estado del pago', 460, showBalanceStrip ? 830 : 710);
        roundRect(ctx, 460, showBalanceStrip ? 860 : 740, 460, 220, 28, '#f0fdf4');
        ctx.fillStyle = '#15803d';
        ctx.font = 'bold 34px Segoe UI';
        ctx.fillText('PAGO CONFIRMADO', 500, showBalanceStrip ? 930 : 810);
        ctx.fillStyle = '#166534';
        ctx.font = '26px Segoe UI';
        ctx.fillText(`Total cancelado: ${formatMoneyText(Math.max(pagado, Number(row.total_cobrar || 0)))}`, 500, showBalanceStrip ? 980 : 860);
        ctx.fillText('No se muestran medios de pago', 500, showBalanceStrip ? 1020 : 900);
        ctx.fillText('porque no existe deuda activa.', 500, showBalanceStrip ? 1055 : 935);

        ctx.fillStyle = '#64748b';
        ctx.font = '24px Segoe UI';
        wrapText(ctx, 'Gracias por mantener tus pagos al día.', 120, showBalanceStrip ? 1220 : 1110, 820, 32);
    }

    return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) reject(new Error('No se pudo generar la imagen del aviso'));
            else resolve(blob);
        }, 'image/png');
    });
}

export default function Index({ periodo, periodos, cobros, config, vencimientosContrato }) {
    const [ignoredDebt, setIgnoredDebt] = useState(() => loadIgnoredDebtMap());
    const [toast, setToastMsg] = useState(null);
    const [previewRow, setPreviewRow] = useState(null);
    const [mostrarVencimientos, setMostrarVencimientos] = useState(false);
    const toastTimer = useRef(null);

    const showToast = (msg) => {
        setToastMsg(msg);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
    };

    const cambiarPeriodo = (id) => router.get(route('avisos.index'), { periodo_id: id }, { preserveState: true });

    const isDebtIgnored = (row) => {
        const key = debtKey(row, periodo.id_periodo);
        return key ? ignoredDebt[key] === true : false;
    };
    const toggleDebtIgnored = (row) => {
        const key = debtKey(row, periodo.id_periodo);
        if (!key) return;
        const next = { ...ignoredDebt };
        if (next[key]) delete next[key];
        else next[key] = true;
        setIgnoredDebt(next);
        saveIgnoredDebtMap(next);
        showToast(next[key] ? 'Deuda anterior cancelada en el aviso' : 'Deuda anterior restaurada en el aviso');
    };

    const deudaAnteriorReal = (row) => Number(row?.deuda_anterior || 0);
    const deudaAnterior = (row) => (isDebtIgnored(row) ? 0 : deudaAnteriorReal(row));
    const saldoTotalPendiente = (row) => getSaldoPendiente(row) + deudaAnterior(row);
    const isPagadoCompleto = (row) => isCobroPagadoCompleto(row, saldoTotalPendiente(row));

    const buildSummaryText = (row) => {
        const tenantName = formatTenantDisplayName(row);
        const pagado = getPagadoTotal(row);
        const saldoPeriodo = getSaldoPendiente(row);
        const deuda = deudaAnterior(row);
        const saldoTotal = saldoTotalPendiente(row);
        const isPaid = isPagadoCompleto(row);
        const hasDeuda = deuda > 0;
        const periodoTexto = periodoTextoDe(periodo);
        return [
            config?.mensaje_base || 'Hola, te comparto tu resumen del mes.',
            `Unidad ${row.codigo_unidad} · ${tenantName}`,
            `Periodo: ${periodoTexto}`,
            isPaid ? 'Estado: PAGADO COMPLETO' : null,
            `Consumo: ${number(row.consumo_kwh ?? 0, 2)} kWh`,
            `Luz: ${money(getMontoLuzFinal(row))}`,
            `Agua: ${money(row.monto_agua)}`,
            pagado > 0 ? `Pagado del periodo: ${money(pagado)}` : null,
            `Pendiente del periodo: ${money(isPaid ? 0 : saldoPeriodo)}`,
            deuda > 0 ? `Deuda anterior: ${money(deuda)}` : null,
            `${isPaid ? 'Pagado total' : (hasDeuda ? 'Pendiente total' : 'Pendiente del mes')}: ${money(isPaid ? Math.max(pagado, Number(row.total_cobrar || 0)) : (hasDeuda ? saldoTotal : saldoPeriodo))}`,
            row.fecha_vencimiento ? `Vence: ${formatDate(row.fecha_vencimiento)}` : null,
            !isPaid && config?.yape_numero ? `Yape: ${config.yape_numero} (${config.yape_titular || ''})` : null,
            !isPaid && config?.banco_nombre ? `Transferencia: ${config.banco_nombre} / ${config.banco_cuenta || config.banco_cci || ''}` : null,
        ].filter(Boolean).join('\n');
    };

    const handleCopiar = async (row) => {
        const text = buildSummaryText(row);
        try {
            await navigator.clipboard.writeText(text);
            showToast('Resumen copiado al portapapeles');
        } catch (_) {
            showToast(text);
        }
    };

    const handleDescargar = async (row) => {
        try {
            const blob = await generateAvisoPng(row, config, periodo, saldoTotalPendiente(row), deudaAnterior(row), isPagadoCompleto(row));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = buildAvisoFilename(row, periodo);
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            showToast(error.message);
        }
    };

    const handleCompartir = async (row) => {
        const text = buildSummaryText(row);
        const consumoPeriodoUnidad = Number(row?.consumo_periodo_unidad ?? row?.consumo_kwh ?? 0);
        const isLowConsumo = consumoPeriodoUnidad < getAvisoMinimoKwh(config);
        try {
            if (!isLowConsumo) {
                const blob = await generateAvisoPng(row, config, periodo, saldoTotalPendiente(row), deudaAnterior(row), isPagadoCompleto(row));
                const file = new File([blob], buildAvisoFilename(row, periodo), { type: 'image/png' });
                if (navigator.canShare?.({ files: [file] })) {
                    await navigator.share({ title: `Cobro ${row.codigo_unidad}`, text, files: [file] });
                    return;
                }
            }
            if (navigator.share) {
                await navigator.share({ title: `Cobro ${row.codigo_unidad}`, text });
                return;
            }
            await navigator.clipboard.writeText(text);
            showToast('Tu navegador no soporta compartir archivos. Se copió el resumen.');
        } catch (error) {
            if (error?.name !== 'AbortError') showToast(error.message || 'No se pudo compartir el aviso');
        }
    };

    const handleWhatsapp = (row) => {
        if (!row.celular) return;
        const text = buildSummaryText(row);
        window.open(`https://wa.me/51${row.celular}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    };

    const avisoMinimoKwh = getAvisoMinimoKwh(config);

    // 2 secciones por motivo real -- se descartó "consumo bajo el mínimo"
    // como sección propia: es una nota contable interna (ya afecta el PNG
    // vía isLowConsumo), no algo que amerite mandarle un WhatsApp aparte al
    // inquilino. deuda_anterior y vencimientosContrato sí son motivos reales
    // de contacto -- el segundo, aunque recae en visitar la unidad en
    // persona más que en cobrar, se mantiene igual como recordatorio.
    const grupoDeuda = cobros.filter((row) => deudaAnterior(row) > 0);
    const grupoVencimiento = vencimientosContrato
        .map((aviso) => ({ aviso, row: cobros.find((c) => c.id_unidad === aviso.id_unidad) }))
        .filter((x) => x.row);

    const detalleDeuda = (row) => {
        const deuda = deudaAnterior(row);
        const saldoPeriodo = getSaldoPendiente(row);
        if (saldoPeriodo <= 0.009) {
            return `Este período está pagado, pero arrastra ${money(deuda)} de períodos anteriores sin cancelar.`;
        }
        return `Arrastra ${money(deuda)} de períodos anteriores y suma ${money(saldoPeriodo)} de este período — total pendiente ${money(deuda + saldoPeriodo)}.`;
    };
    const detalleVencimiento = (aviso) => (
        aviso.dias_restantes < 0
            ? `Contrato venció hace ${Math.abs(aviso.dias_restantes)} día(s) — sin renovación registrada todavía.`
            : `Contrato vence en ${aviso.dias_restantes} día(s) (${formatDate(aviso.fecha_vencimiento)}) — sin renovación registrada todavía.`
    );
    // Card genérica para "Todos los cobros" -- sin motivo puntual, solo
    // el estado real de la plata de este período para poder ubicarlo.
    const detalleGeneral = (row) => {
        if (isPagadoCompleto(row)) {
            return `Período pagado. Total: ${money(Math.max(getPagadoTotal(row), Number(row.total_cobrar || 0)))}.`;
        }
        return `Pendiente del período: ${money(saldoTotalPendiente(row))}${row.fecha_vencimiento ? ` · vence ${formatDate(row.fecha_vencimiento)}` : ''}.`;
    };

    const totalAvisos = grupoDeuda.length + grupoVencimiento.length;

    return (
        <AdminLayout
            title="Avisos de cobro"
            description={`${totalAvisos} aviso${totalAvisos === 1 ? '' : 's'} que necesitan tu atención, agrupados por motivo`}
            periodo={periodo}
            periodos={periodos}
            onPeriodoChange={cambiarPeriodo}
            actions={(
                <div className="flex items-center gap-3">
                    {grupoVencimiento.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setMostrarVencimientos((v) => !v)}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface-2"
                        >
                            {mostrarVencimientos ? 'Ocultar' : 'Ver'} contratos por vencer ({grupoVencimiento.length})
                        </button>
                    )}
                    <Link href={route('config-cobranza.index')} className="text-sm font-medium text-primary hover:text-primary-dark">
                        Configuración de cobranza
                    </Link>
                </div>
            )}
        >
            <Head title="Avisos" />

            {toast && (
                <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-ink px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
            )}

            {cobros.length === 0 ? (
                <div className="mb-5 rounded-[13px] border border-border bg-surface p-6 text-center text-sm text-muted-2 shadow-sm">
                    No hay cobros generados para este periodo.
                </div>
            ) : (
                <AvisoSection titulo="Todos los cobros del periodo" tono="muted" count={cobros.length}>
                    {cobros.map((row) => (
                        <AvisoCard
                            key={`general-${row.id_cobro}`}
                            row={row}
                            detail={detalleGeneral(row)}
                            tono="muted"
                            onOpenPreview={() => setPreviewRow(row)}
                            onWhatsapp={() => handleWhatsapp(row)}
                            onDescargar={() => handleDescargar(row)}
                        />
                    ))}
                </AvisoSection>
            )}

            <AvisoSection titulo="Deuda anterior" tono="danger" count={grupoDeuda.length}>
                {grupoDeuda.map((row) => (
                    <AvisoCard
                        key={`deuda-${row.id_cobro}`}
                        row={row}
                        detail={detalleDeuda(row)}
                        tono="danger"
                        onOpenPreview={() => setPreviewRow(row)}
                        onWhatsapp={() => handleWhatsapp(row)}
                        onDescargar={() => handleDescargar(row)}
                    />
                ))}
            </AvisoSection>

            {mostrarVencimientos && (
                <AvisoSection titulo="Contratos por vencer" tono="warning" count={grupoVencimiento.length}>
                    {grupoVencimiento.map(({ aviso, row }) => (
                        <AvisoCard
                            key={`vencimiento-${aviso.id_referencia}`}
                            row={row}
                            detail={detalleVencimiento(aviso)}
                            tono={aviso.nivel === 'VENCIDO' || aviso.nivel === 'URGENTE' ? 'danger' : 'warning'}
                            onOpenPreview={() => setPreviewRow(row)}
                            onWhatsapp={() => handleWhatsapp(row)}
                            onDescargar={() => handleDescargar(row)}
                        />
                    ))}
                </AvisoSection>
            )}

            <Modal show={previewRow !== null} onClose={() => setPreviewRow(null)} maxWidth="lg">
                {previewRow && (
                    <AvisoPreview
                        row={previewRow}
                        config={config}
                        periodo={periodo}
                        avisoMinimoKwh={avisoMinimoKwh}
                        deudaAnteriorReal={deudaAnteriorReal(previewRow)}
                        deudaAnterior={deudaAnterior(previewRow)}
                        saldoTotal={saldoTotalPendiente(previewRow)}
                        isPaid={isPagadoCompleto(previewRow)}
                        isDebtIgnored={isDebtIgnored(previewRow)}
                        onToggleDebt={() => toggleDebtIgnored(previewRow)}
                        onCopiar={() => handleCopiar(previewRow)}
                        onDescargar={() => handleDescargar(previewRow)}
                        onCompartir={() => handleCompartir(previewRow)}
                    />
                )}
            </Modal>
        </AdminLayout>
    );
}

const PILL_TONOS = {
    danger: 'bg-danger-tint text-danger',
    warning: 'bg-warning-tint text-warning',
    muted: 'bg-surface-3 text-muted',
};

function AvisoSection({ titulo, tono, count, children }) {
    if (count === 0) return null;
    const pillClasses = PILL_TONOS[tono] ?? PILL_TONOS.muted;

    return (
        <div className="mb-5">
            <div className="mb-2.5 flex items-center gap-2">
                <h3 className="text-[0.86rem] font-extrabold text-ink">{titulo}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-extrabold ${pillClasses}`}>{count}</span>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </div>
        </div>
    );
}

const ACCENT_TONOS = {
    danger: 'border-t-danger',
    warning: 'border-t-warning',
    muted: 'border-t-border',
};

function AvisoCard({ row, detail, tono = 'warning', onOpenPreview, onWhatsapp, onDescargar }) {
    const tenantName = formatTenantDisplayName(row);
    const accentClass = ACCENT_TONOS[tono] ?? ACCENT_TONOS.warning;

    return (
        <div className={`flex flex-col gap-2.5 rounded-[13px] border border-t-[3px] border-border bg-surface p-4 shadow-sm ${accentClass}`}>
            <button type="button" onClick={onOpenPreview} className="flex items-start gap-2.5 text-left">
                <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-surface-3 text-[0.74rem] font-extrabold text-muted">
                    {iniciales(tenantName)}
                </span>
                <span className="min-w-0">
                    <span className="block truncate text-[0.82rem] font-bold text-ink">{tenantName}</span>
                    <span className="block text-[0.7rem] text-muted-2">Unidad {row.codigo_unidad}</span>
                </span>
            </button>

            <p className="flex-1 text-[0.76rem] leading-relaxed text-muted">{detail}</p>

            <div className="flex items-center gap-1.5">
                {row.celular ? (
                    <button
                        type="button"
                        onClick={onWhatsapp}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#22C35E] px-2 py-2 text-xs font-semibold text-white hover:opacity-90"
                    >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </button>
                ) : (
                    <span className="flex flex-1 items-center justify-center rounded-lg bg-surface-2 px-2 py-2 text-xs text-muted-2">Sin celular</span>
                )}
                <IconButton icon={Eye} label="Ver vista previa" onClick={onOpenPreview} />
                <IconButton icon={Download} label="Descargar PNG" onClick={onDescargar} />
            </div>
        </div>
    );
}

function AvisoPreview({ row, config, periodo, avisoMinimoKwh, deudaAnteriorReal, deudaAnterior, saldoTotal, isPaid, isDebtIgnored, onToggleDebt, onCopiar, onDescargar, onCompartir }) {
    const tenantName = formatTenantDisplayName(row);
    const periodoTexto = periodoTextoDe(periodo);
    const montoLuzFinal = getMontoLuzFinal(row);
    const otros = Number(row.otros_conceptos || 0);
    const pagado = getPagadoTotal(row);
    const saldoPeriodo = getSaldoPendiente(row);
    const consumoPeriodoUnidad = Number(row?.consumo_periodo_unidad ?? row?.consumo_kwh ?? 0);
    const isLowConsumo = consumoPeriodoUnidad < avisoMinimoKwh;
    const hasDeudaAnterior = deudaAnterior > 0;
    const saldoLabel = isPaid ? 'Pagado' : (hasDeudaAnterior ? 'Pendiente total' : 'Pendiente del mes');
    const totalPrincipal = isPaid ? Math.max(pagado, Number(row.total_cobrar || 0)) : (hasDeudaAnterior ? saldoTotal : saldoPeriodo);

    return (
        <section className={`rounded-[13px] border border-border bg-surface p-4 shadow-sm ${isPaid ? 'ring-1 ring-success' : ''}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-ink">Vista previa</h4>
                <div className="flex flex-wrap gap-2">
                    {(deudaAnteriorReal > 0) && (
                        <button onClick={onToggleDebt} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-2">
                            {isDebtIgnored ? 'Reactivar deuda anterior' : 'Cancelar deuda anterior'}
                        </button>
                    )}
                    <button onClick={onCopiar} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-2">Copiar resumen</button>
                    <button onClick={onDescargar} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-2">Descargar PNG</button>
                    <button onClick={onCompartir} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark">Compartir</button>
                </div>
            </div>

            {isLowConsumo && (
                <div className="mb-3 rounded-lg bg-warning-tint px-3 py-2 text-xs text-warning">
                    En el PNG este consumo se mostrará como 0 kWh (menor a {avisoMinimoKwh} kWh).
                </div>
            )}

            <div className={`rounded-[13px] p-5 text-white ${isPaid ? 'bg-gradient-to-br from-green-800 to-success' : 'bg-gradient-to-br from-ink to-primary-dark'}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-white/70">Resumen de pago</p>
                        <h3 className="text-2xl font-bold">{tenantName}</h3>
                        <p className="text-sm text-white/80">{periodoTexto} · Unidad {row.codigo_unidad}</p>
                    </div>
                    <div className="rounded-lg bg-white/15 px-4 py-2 text-right">
                        <span className="block text-xs text-white/70">{saldoLabel}</span>
                        <strong className="text-xl">{money(totalPrincipal)}</strong>
                    </div>
                </div>

                {hasDeudaAnterior && (
                    <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-white/10 p-3 text-sm">
                        {pagado > 0 && <div><span className="block text-xs text-white/70">Pagado del periodo</span><strong>{money(pagado)}</strong></div>}
                        <div><span className="block text-xs text-white/70">Pendiente del periodo</span><strong>{money(isPaid ? 0 : saldoPeriodo)}</strong></div>
                        {deudaAnterior > 0 && <div><span className="block text-xs text-white/70">Deuda anterior</span><strong>{money(deudaAnterior)}</strong></div>}
                    </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-surface p-4 text-ink sm:grid-cols-2">
                    <div className="space-y-1.5 text-sm">
                        <h5 className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-2">Detalle</h5>
                        <div className="flex justify-between"><span className="text-muted">Alquiler</span><strong className="font-mono">{money(row.monto_alquiler)}</strong></div>
                        <div className="flex justify-between"><span className="text-muted">Luz</span><strong className="font-mono">{money(montoLuzFinal)}</strong></div>
                        <div className="flex justify-between"><span className="text-muted">Agua</span><strong className="font-mono">{money(row.monto_agua)}</strong></div>
                        {Number(row.monto_gas || 0) > 0 && <div className="flex justify-between"><span className="text-muted">Gas</span><strong className="font-mono">{money(row.monto_gas)}</strong></div>}
                        {otros > 0 && <div className="flex justify-between"><span className="text-muted">Otros conceptos</span><strong className="font-mono">{money(otros)}</strong></div>}
                        {pagado > 0 && <div className="flex justify-between font-medium"><span className="text-muted">Pagado acumulado</span><strong className="font-mono">{money(pagado)}</strong></div>}
                        <div className="flex justify-between border-t border-border pt-1.5 font-semibold"><span>{isPaid ? 'Estado del periodo' : 'Saldo del periodo'}</span><strong className="font-mono">{isPaid ? 'Cancelado' : money(saldoPeriodo)}</strong></div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-2 p-4 text-center">
                        <strong className="font-mono text-3xl text-ink">{number(row.consumo_kwh ?? 0, 2)}</strong>
                        <span className="text-xs text-muted">kWh del periodo</span>
                    </div>
                </div>

                {!isPaid ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-surface p-3 text-ink">
                            <p className="text-xs font-semibold text-success">Yape</p>
                            <strong>{config.yape_titular || 'Pendiente configurar'}</strong>
                            <p className="text-sm text-muted">{config.yape_numero || 'Sin numero configurado'}</p>
                        </div>
                        <div className="rounded-lg bg-surface p-3 text-ink">
                            <p className="text-xs font-semibold text-muted">Transferencia</p>
                            <strong>{config.banco_nombre || 'Banco pendiente'}</strong>
                            <p className="text-sm text-muted">Titular: {config.banco_titular || 'Sin titular'}</p>
                            <p className="text-sm text-muted">Cuenta: {config.banco_cuenta || 'Sin cuenta'}</p>
                            <p className="text-sm text-muted">CCI: {config.banco_cci || 'Sin CCI'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 rounded-lg bg-surface p-3 text-ink">
                        <strong className="text-success">Pago confirmado</strong>
                        <p className="text-sm text-muted">Este cobro ya fue cancelado. No se muestran medios de pago porque ya no existe deuda activa.</p>
                    </div>
                )}

                <p className="mt-4 text-sm text-white/90">{config.mensaje_base || 'Hola, te comparto tu resumen del mes.'}</p>
            </div>
        </section>
    );
}
