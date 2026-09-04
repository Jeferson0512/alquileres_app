@page { margin: 90px 46px 70px; }

body { font-family: 'Helvetica', 'Arial', sans-serif; color: #0F172A; font-size: 11px; }
table { width: 100%; border-collapse: collapse; }
.mono { font-family: 'Courier', 'Courier New', monospace; }
/* Helvetica (base del documento) no trae glifos de simbolos/flechas (⚠ ▲ →
   salian como "?"). DejaVu Sans si los tiene y ya viene empaquetada con
   dompdf (vendor/dompdf/dompdf/lib/fonts) -- no requiere instalar nada. */
.glyph { font-family: 'DejaVu Sans', 'Helvetica', sans-serif; }

/* ---- encabezado ---- */
.doc-header { position: fixed; top: -76px; left: 0; right: 0; height: 60px; border-bottom: 3px solid #2563EB; padding-bottom: 10px; }
.doc-header table td { vertical-align: top; }
.brand { font-size: 13px; font-weight: bold; color: #0F172A; }
.brand .accent { color: #2563EB; }
.brand-sub { font-size: 8.5px; color: #64748B; margin-top: 2px; }
.doc-eyebrow { font-size: 8.5px; font-weight: bold; letter-spacing: 1.6px; text-transform: uppercase; color: #64748B; text-align: right; }
.doc-title { font-size: 18px; font-weight: bold; color: #1D4ED8; text-align: right; margin-top: 2px; }
.doc-pills { text-align: right; margin-top: 6px; }
.pill-tag { display: inline-block; padding: 2px 9px; border-radius: 4px; font-size: 8.5px; font-weight: bold; letter-spacing: .3px; background: #EFF6FF; color: #1D4ED8; border: 1px solid #DBEAFE; margin-left: 5px; }
.pill-tag.solid { background: #2563EB; color: #fff; border-color: #2563EB; }

/* ---- pie ---- */
.doc-footer { position: fixed; bottom: -50px; left: 0; right: 0; height: 30px; border-top: 1px solid #E2E8F0; padding-top: 8px; font-size: 8px; letter-spacing: .5px; text-transform: uppercase; color: #94A3B8; }

/* ---- secciones ---- */
/* page-break-inside:avoid solo en el titulo (que nunca quede solo al pie de
   pagina) y en bloques cortos (kv-table, chart-box) -- las data-table SI
   deben poder partirse entre paginas, si no dompdf empuja la tabla entera a
   la siguiente pagina y deja un hueco enorme al final de la anterior. */
.section-title { margin: 20px 0 8px; page-break-inside: avoid; page-break-after: avoid; }
.section-title table td { vertical-align: middle; }
.section-badge { display: inline-block; width: 16px; height: 16px; line-height: 16px; text-align: center; background: #2563EB; color: #fff; border-radius: 3px; font-size: 9px; font-weight: bold; }
.section-label { font-size: 10.5px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #1D4ED8; padding-left: 8px; }
.section-rule { border-top: 1px solid #CBD5E1; font-size: 0; line-height: 0; }

/* ---- grilla clave/valor (resumen) ---- */
.kv-table { border: 1px solid #E2E8F0; page-break-inside: avoid; }
.kv-table td { border: 1px solid #E2E8F0; padding: 6px 9px; font-size: 10px; vertical-align: middle; }
.kv-table td.k { background: #F1F5F9; color: #64748B; font-weight: bold; text-transform: uppercase; font-size: 8px; letter-spacing: .4px; white-space: nowrap; width: 1%; }
.kv-table td.v { font-weight: bold; color: #0F172A; }
.kv-table td.v .sub { display: block; font-weight: normal; color: #64748B; font-size: 8.5px; margin-top: 1px; }

/* ---- tabla de datos ---- */
.data-table th { background: #2563EB; color: #fff; font-size: 8px; font-weight: bold; letter-spacing: .4px; text-transform: uppercase; padding: 6px 7px; border: 1px solid #2563EB; text-align: left; }
.data-table th.num { text-align: right; }
.data-table td { font-size: 9.5px; padding: 6px 7px; border: 1px solid #E2E8F0; }
.data-table td.num { text-align: right; }
.data-table td.muted { color: #64748B; }
.data-table tr.total td { background: #F8FAFC; font-weight: bold; color: #1D4ED8; }
.data-table tr:nth-child(even) td { background: #F8FAFC; }
.data-table tr.total:nth-child(even) td, .data-table tr.total td { background: #F8FAFC; }

/* ---- badges de estado (mismos tonos que la app) ---- */
.pill { display: inline-block; padding: 1.5px 8px; border-radius: 9px; font-size: 8px; font-weight: bold; letter-spacing: .3px; }
.pill.success { background: #E8F7EE; color: #16A34A; }
.pill.warning { background: #FDF1DF; color: #D97706; }
.pill.danger { background: #FDECEC; color: #DC2626; }
.pill.info { background: #EFF6FF; color: #1D4ED8; }
.pill.gray { background: #F1F5F9; color: #64748B; }

.note-box { border: 1px solid #E2E8F0; border-radius: 4px; padding: 8px 11px; font-size: 9.5px; color: #475569; line-height: 1.5; background: #F8FAFC; }
.empty-state { padding: 14px; text-align: center; font-size: 9.5px; color: #94A3B8; }

/* ---- graficos (SVG estatico, ver App\Support\PdfChart) ---- */
.chart-box { border: 1px solid #E2E8F0; border-radius: 5px; padding: 10px 12px 8px; margin-bottom: 4px; page-break-inside: avoid; }
.chart-box .chart-title { font-size: 8.5px; font-weight: bold; text-transform: uppercase; letter-spacing: .4px; color: #64748B; margin-bottom: 4px; }
.chart-legend { margin-top: 6px; font-size: 8px; color: #475569; }
.chart-legend .sw { display: inline-block; margin-right: 12px; }
.chart-legend .dot { display: inline-block; width: 7px; height: 7px; border-radius: 2px; margin-right: 4px; }
.chart-row table td { vertical-align: top; }
