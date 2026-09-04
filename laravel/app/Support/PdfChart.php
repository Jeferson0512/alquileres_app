<?php

namespace App\Support;

/**
 * Graficos como PNG (GD) para los PDFs de Reportes -- dompdf no ejecuta JS
 * (ApexCharts, lo que usa la pantalla, no sirve aca) y su soporte de <svg>
 * inline es inconsistente entre versiones/backends (se probo primero con
 * SVG: el documento generaba bien pero los graficos no aparecian). Un <img>
 * con un PNG embebido en base64 es el patron que dompdf renderiza siempre,
 * sin depender de su parser de SVG.
 *
 * Se dibuja a 2x el tamano final (CSS width/height lo reduce) para que se
 * vea nitido impreso/exportado. Las etiquetas usan la fuente bitmap nativa
 * de GD (imagestring) -- no requiere ningun .ttf instalado en el servidor,
 * a costa de verse pixelada en vez del Helvetica del resto del documento
 * (aceptable a este tamano, es solo el eje).
 */
class PdfChart
{
    private const SCALE = 2;

    public static function barrasAgrupadas(array $categorias, array $series, array $coloresHex, int $wCss = 460, int $hCss = 150): string
    {
        $s = self::SCALE;
        $w = $wCss * $s;
        $h = $hCss * $s;
        $img = imagecreatetruecolor($w, $h);
        self::fondoTransparente($img);

        $padL = 44 * $s;
        $padR = 6 * $s;
        $padT = 6 * $s;
        $padB = 18 * $s;
        $plotW = $w - $padL - $padR;
        $plotH = $h - $padT - $padB;

        $max = 0;
        foreach ($series as $serie) {
            $max = max($max, ...array_values($serie['data']));
        }
        $max = $max > 0 ? (int) (ceil($max * 1.15 / 100) * 100) : 1;

        $gris = self::color($img, '#94A3B8');
        $lineaGris = self::color($img, '#E2E8F0');

        for ($t = 0; $t <= 3; $t++) {
            $y = (int) ($padT + $plotH - ($plotH * $t / 3));
            $val = (int) round($max * $t / 3);
            imageline($img, $padL, $y, $w - $padR, $y, $lineaGris);
            self::texto($img, (string) number_format($val), $padL - 4 * $s, $y - 4 * $s, $gris, 'r');
        }

        $n = max(count($categorias), 1);
        $groupW = $plotW / $n;
        $nSeries = max(count($series), 1);
        $barW = ($groupW * 0.6) / $nSeries;

        foreach ($series as $si => $serie) {
            $color = self::color($img, $coloresHex[$si] ?? '#94A3B8');
            foreach ($categorias as $ci => $cat) {
                $v = $serie['data'][$ci] ?? 0;
                $bh = $max > 0 ? (int) ($plotH * $v / $max) : 0;
                $gx = $padL + $ci * $groupW;
                $x = (int) ($gx + ($groupW - $barW * $nSeries) / 2 + $si * $barW);
                $y = (int) ($padT + $plotH - $bh);
                imagefilledrectangle($img, $x, $y, (int) ($x + $barW - 3 * $s), $padT + $plotH, $color);
            }
        }

        foreach ($categorias as $ci => $cat) {
            $gx = $padL + $ci * $groupW;
            self::texto($img, (string) $cat, (int) ($gx + $groupW / 2), $h - 12 * $s, $gris, 'c');
        }

        return self::salida($img);
    }

    /**
     * Ranking horizontal (una barra por fila, ordenado tal cual llega).
     */
    public static function barrasHorizontales(array $etiquetas, array $valores, string $colorHex, int $wCss = 460, int $filaAltoCss = 20): string
    {
        $s = self::SCALE;
        $w = $wCss * $s;
        $filaAlto = $filaAltoCss * $s;
        $h = $filaAlto * max(count($etiquetas), 1);
        $img = imagecreatetruecolor($w, $h);
        self::fondoTransparente($img);

        $padL = 70 * $s;
        $padR = 46 * $s;
        $plotW = $w - $padL - $padR;
        $max = count($valores) > 0 ? max($valores) * 1.08 : 1;
        $max = $max > 0 ? $max : 1;

        $gris = self::color($img, '#64748B');
        $color = self::color($img, $colorHex);

        foreach ($etiquetas as $i => $et) {
            $y0 = (int) ($i * $filaAlto + $filaAlto * 0.22);
            $bh = (int) ($filaAlto * 0.56);
            $v = $valores[$i] ?? 0;
            $bw = $max > 0 ? (int) ($plotW * $v / $max) : 0;
            self::texto($img, (string) $et, $padL - 6 * $s, $y0 + (int) ($bh / 2) - 4 * $s, $gris, 'r');
            imagefilledrectangle($img, $padL, $y0, $padL + $bw, $y0 + $bh, $color);
            self::texto($img, number_format($v, 1), $padL + $bw + 5 * $s, $y0 + (int) ($bh / 2) - 4 * $s, self::color($img, '#0F172A'), 'l');
        }

        return self::salida($img);
    }

    public static function donut(array $values, array $coloresHex, int $sizeCss = 140): string
    {
        $s = self::SCALE;
        $size = $sizeCss * $s;
        $img = imagecreatetruecolor($size, $size);
        self::fondoTransparente($img);

        $cx = $size / 2;
        $cy = $size / 2;
        $r = $size / 2 - 3 * $s;
        $ir = $r * 0.55;
        $total = array_sum($values);

        if ($total <= 0) {
            imagefilledellipse($img, (int) $cx, (int) $cy, (int) ($r * 2), (int) ($r * 2), self::color($img, '#E2E8F0'));
            imagefilledellipse($img, (int) $cx, (int) $cy, (int) ($ir * 2), (int) ($ir * 2), self::color($img, '#FFFFFF'));

            return self::salida($img);
        }

        $anguloIni = -90;
        foreach ($values as $i => $v) {
            if ($v <= 0) {
                continue;
            }
            $frac = $v / $total;
            $anguloFin = $anguloIni + $frac * 360;
            $color = self::color($img, $coloresHex[$i] ?? '#94A3B8');
            imagefilledarc($img, (int) $cx, (int) $cy, (int) ($r * 2), (int) ($r * 2), (int) $anguloIni, (int) $anguloFin, $color, IMG_ARC_PIE);
            $anguloIni = $anguloFin;
        }

        imagefilledellipse($img, (int) $cx, (int) $cy, (int) ($ir * 2), (int) ($ir * 2), self::color($img, '#FFFFFF'));

        return self::salida($img);
    }

    private static function fondoTransparente($img): void
    {
        imagesavealpha($img, true);
        $transparente = imagecolorallocatealpha($img, 255, 255, 255, 127);
        imagefill($img, 0, 0, $transparente);
        imageantialias($img, true);
    }

    private static function color($img, string $hex)
    {
        $hex = ltrim($hex, '#');
        [$r, $g, $b] = [hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2))];

        return imagecolorallocate($img, $r, $g, $b);
    }

    private static function texto($img, string $text, int $x, int $y, $color, string $align = 'l'): void
    {
        $font = 2;
        $w = imagefontwidth($font) * strlen($text);
        $offsetX = match ($align) {
            'r' => -$w,
            'c' => (int) (-$w / 2),
            default => 0,
        };
        imagestring($img, $font, $x + $offsetX, $y, $text, $color);
    }

    private static function salida($img): string
    {
        ob_start();
        imagepng($img);
        $bytes = ob_get_clean();
        imagedestroy($img);

        return 'data:image/png;base64,'.base64_encode($bytes);
    }
}
