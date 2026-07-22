<?php

namespace Tests\Support;

use Illuminate\Support\Facades\DB;

/**
 * Fixtures minimas para probar los Services contra el esquema real de
 * negocio (18 tablas heredadas de la app legacy, con sus FKs/triggers/
 * columna generada intactos) en la base de datos dedicada
 * alquileres_db_test -- ver phpunit.xml y database/schema_dump_test.sql.
 * Cada test corre dentro de una transaccion (DatabaseTransactions) que se
 * revierte al final, asi que estos inserts nunca dejan residuos.
 */
trait AlquileresFixtures
{
    public function crearInmueble(array $overrides = []): int
    {
        return DB::table('inmuebles')->insertGetId(array_merge([
            'codigo_inmueble' => 'TEST-'.uniqid(),
            'nombre' => 'Inmueble de prueba',
            'direccion' => 'Direccion de prueba',
            'estado' => 'ACTIVO',
        ], $overrides));
    }

    public function crearUnidad(int $idInmueble, array $overrides = []): int
    {
        return DB::table('unidades')->insertGetId(array_merge([
            'id_inmueble' => $idInmueble,
            'codigo_unidad' => 'U-'.uniqid(),
            'nombre_unidad' => 'Unidad de prueba',
            'piso' => 1,
            'tipo_unidad' => 'CUARTO',
            'tiene_medidor' => 'SI',
            'tarifa_alquiler_base' => 350,
            'estado' => 'ACTIVO',
        ], $overrides));
    }

    public function crearPersona(array $overrides = []): int
    {
        return DB::table('personas')->insertGetId(array_merge([
            'tipo_persona' => 'INQUILINO',
            'nombres' => 'Test',
            'apellidos' => 'Fixture',
            'numero_documento' => (string) random_int(10000000, 99999999),
            'estado' => 'ACTIVO',
        ], $overrides));
    }

    /**
     * anio se ubica lejos de los periodos reales (2020-2027) para que no
     * pueda chocar nunca con datos de produccion si algo quedara sin
     * revertir.
     */
    public function crearPeriodo(int $mes = 1, int $anio = 2099, array $overrides = []): int
    {
        $fechaInicio = sprintf('%04d-%02d-01', $anio, $mes);
        $fechaFin = date('Y-m-t', strtotime($fechaInicio));

        return DB::table('periodos')->insertGetId(array_merge([
            'anio' => $anio,
            'mes' => $mes,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'estado' => 'ABIERTO',
        ], $overrides));
    }

    public function crearOcupacion(int $idUnidad, int $idPersona, array $overrides = []): int
    {
        return DB::table('ocupacion_unidad')->insertGetId(array_merge([
            'id_unidad' => $idUnidad,
            'id_persona' => $idPersona,
            'fecha_inicio' => '2099-01-01',
            'monto_alquiler' => 350,
            'garantia' => 350,
            'estado' => 'ACTIVO',
        ], $overrides));
    }

    public function crearTarifas(int $idInmueble, array $tarifas = []): void
    {
        $defaults = ['AGUA' => 40.0, 'GAS' => 0.0, 'MANTENIMIENTO' => 0.0];
        foreach (array_merge($defaults, $tarifas) as $servicio => $monto) {
            DB::table('tarifas_servicios')->insert([
                'id_inmueble' => $idInmueble,
                'servicio' => $servicio,
                'monto' => $monto,
                'por_unidad' => 1,
                'activo' => 1,
            ]);
        }
    }

    public function crearRecibo(int $idInmueble, int $idPeriodo, array $overrides = []): int
    {
        return DB::table('recibos_luz')->insertGetId(array_merge([
            'id_inmueble' => $idInmueble,
            'id_periodo' => $idPeriodo,
            'precio_kwh' => 1.0000,
            'total_recibo' => 0,
            'estado' => 'ACTIVO',
        ], $overrides));
    }

    public function crearLectura(int $idPeriodo, int $idUnidad, ?int $idOcupacion, float $anterior, float $actual): int
    {
        return DB::table('lecturas_unidad')->insertGetId([
            'id_periodo' => $idPeriodo,
            'id_unidad' => $idUnidad,
            'id_ocupacion' => $idOcupacion,
            'lectura_anterior' => $anterior,
            'lectura_actual' => $actual,
            'estado' => 'REGISTRADO',
        ]);
    }

    public function crearLiquidacionDetalle(int $idPeriodo, int $idInmueble, int $idUnidad, ?int $idPersona, int $idLectura, int $idReciboLuz, array $overrides = []): int
    {
        return DB::table('liquidacion_luz_detalle')->insertGetId(array_merge([
            'id_periodo' => $idPeriodo,
            'id_inmueble' => $idInmueble,
            'id_unidad' => $idUnidad,
            'id_persona' => $idPersona,
            'id_lectura' => $idLectura,
            'id_recibo_luz' => $idReciboLuz,
            'consumo_kwh' => 0,
            'porcentaje_participacion' => 0,
            'monto_consumo' => 0,
            'gasto_comun' => 0,
            'ajuste' => 0,
            'total_pagar_luz' => 0,
            'estado' => 'GENERADO',
        ], $overrides));
    }
}
