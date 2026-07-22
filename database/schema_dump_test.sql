-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: alquileres_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cobros_mensuales`
--

DROP TABLE IF EXISTS `cobros_mensuales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cobros_mensuales` (
  `id_cobro` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_periodo` int(10) unsigned NOT NULL,
  `id_persona` int(10) unsigned NOT NULL,
  `id_unidad` int(10) unsigned NOT NULL,
  `monto_alquiler` decimal(10,2) NOT NULL DEFAULT 0.00,
  `monto_luz` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ajuste_minimo_luz` decimal(10,2) NOT NULL DEFAULT 0.00,
  `monto_agua` decimal(10,2) NOT NULL DEFAULT 0.00,
  `monto_gas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `otros_conceptos` decimal(10,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00,
  `mora` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_cobrar` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fecha_vencimiento` date DEFAULT NULL,
  `estado_pago` enum('PENDIENTE','PARCIAL','PAGADO','ANULADO') NOT NULL DEFAULT 'PENDIENTE',
  `observacion` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_cobro`),
  UNIQUE KEY `uq_cobro_periodo_persona_unidad` (`id_periodo`,`id_persona`,`id_unidad`),
  KEY `idx_cobro_periodo` (`id_periodo`),
  KEY `idx_cobro_persona` (`id_persona`),
  KEY `idx_cobro_unidad` (`id_unidad`),
  KEY `idx_cobro_estado` (`estado_pago`),
  CONSTRAINT `fk_cobro_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`),
  CONSTRAINT `fk_cobro_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`),
  CONSTRAINT `fk_cobro_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=479 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cobros_mensuales_detalle`
--

DROP TABLE IF EXISTS `cobros_mensuales_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cobros_mensuales_detalle` (
  `id_cobro_detalle` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_cobro` int(10) unsigned NOT NULL,
  `id_concepto` smallint(5) unsigned NOT NULL,
  `monto_programado` decimal(12,2) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `orden_visual` smallint(5) unsigned NOT NULL DEFAULT 100,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_cobro_detalle`),
  KEY `idx_cobro_detalle_cobro` (`id_cobro`),
  KEY `idx_cobro_detalle_concepto` (`id_concepto`),
  KEY `idx_cobro_detalle_cobro_concepto` (`id_cobro`,`id_concepto`,`orden_visual`),
  CONSTRAINT `fk_cobro_detalle_cobro` FOREIGN KEY (`id_cobro`) REFERENCES `cobros_mensuales` (`id_cobro`),
  CONSTRAINT `fk_cobro_detalle_concepto` FOREIGN KEY (`id_concepto`) REFERENCES `conceptos_cobro` (`id_concepto`),
  CONSTRAINT `chk_cobro_detalle_monto_no_cero` CHECK (`monto_programado` <> 0)
) ENGINE=InnoDB AUTO_INCREMENT=962 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cobros_overrides_servicio`
--

DROP TABLE IF EXISTS `cobros_overrides_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cobros_overrides_servicio` (
  `id_override` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_periodo` int(10) unsigned NOT NULL,
  `id_unidad` int(10) unsigned NOT NULL,
  `id_persona` int(10) unsigned NOT NULL,
  `servicio` enum('AGUA','GAS','MANTENIMIENTO') NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_override`),
  UNIQUE KEY `uq_override_periodo_unidad_persona_servicio` (`id_periodo`,`id_unidad`,`id_persona`,`servicio`),
  KEY `idx_override_periodo` (`id_periodo`),
  KEY `fk_override_unidad` (`id_unidad`),
  KEY `fk_override_persona` (`id_persona`),
  CONSTRAINT `fk_override_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`),
  CONSTRAINT `fk_override_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`),
  CONSTRAINT `fk_override_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conceptos_cobro`
--

DROP TABLE IF EXISTS `conceptos_cobro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conceptos_cobro` (
  `id_concepto` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(40) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `prioridad_aplicacion` smallint(5) unsigned NOT NULL,
  `permite_pago_directo` tinyint(1) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_concepto`),
  UNIQUE KEY `uq_concepto_cobro_codigo` (`codigo`),
  KEY `idx_concepto_cobro_prioridad` (`prioridad_aplicacion`),
  CONSTRAINT `chk_concepto_prioridad` CHECK (`prioridad_aplicacion` > 0)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `config_cobranza`
--

DROP TABLE IF EXISTS `config_cobranza`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `config_cobranza` (
  `id_config` int(11) NOT NULL AUTO_INCREMENT,
  `id_inmueble` int(11) NOT NULL,
  `monto_minimo_luz` decimal(10,2) NOT NULL DEFAULT 0.00,
  `minimo_kwh_aviso` decimal(10,2) NOT NULL DEFAULT 13.50,
  `yape_titular` varchar(120) DEFAULT NULL,
  `yape_numero` varchar(30) DEFAULT NULL,
  `yape_qr` varchar(255) DEFAULT NULL,
  `banco_nombre` varchar(120) DEFAULT NULL,
  `banco_titular` varchar(120) DEFAULT NULL,
  `banco_cuenta` varchar(50) DEFAULT NULL,
  `banco_cci` varchar(50) DEFAULT NULL,
  `mensaje_base` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_config`),
  UNIQUE KEY `uk_config_cobranza_inmueble` (`id_inmueble`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contact_inquiries`
--

DROP TABLE IF EXISTS `contact_inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_inquiries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `message` text NOT NULL,
  `unit_id` int(10) unsigned DEFAULT NULL,
  `status` enum('NUEVO','CONTACTADO','DESCARTADO') NOT NULL DEFAULT 'NUEVO',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contact_inquiries_unit_id_foreign` (`unit_id`),
  CONSTRAINT `contact_inquiries_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unidades` (`id_unidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inmuebles`
--

DROP TABLE IF EXISTS `inmuebles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inmuebles` (
  `id_inmueble` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo_inmueble` varchar(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `cantidad_pisos` int(10) unsigned DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_inmueble`),
  UNIQUE KEY `uq_inmueble_codigo` (`codigo_inmueble`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lecturas_unidad`
--

DROP TABLE IF EXISTS `lecturas_unidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lecturas_unidad` (
  `id_lectura` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_periodo` int(10) unsigned NOT NULL,
  `id_unidad` int(10) unsigned NOT NULL,
  `id_ocupacion` int(10) unsigned DEFAULT NULL,
  `lectura_anterior` decimal(12,2) NOT NULL,
  `lectura_actual` decimal(12,2) NOT NULL,
  `fecha_lectura` date DEFAULT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  `estado` enum('REGISTRADO','VALIDADO','ANULADO') NOT NULL DEFAULT 'REGISTRADO',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_lectura`),
  UNIQUE KEY `uq_lectura_periodo_unidad` (`id_periodo`,`id_unidad`),
  KEY `fk_lectura_ocupacion` (`id_ocupacion`),
  KEY `idx_lecturas_periodo` (`id_periodo`),
  KEY `idx_lecturas_unidad` (`id_unidad`),
  KEY `idx_lecturas_estado` (`estado`),
  CONSTRAINT `fk_lectura_ocupacion` FOREIGN KEY (`id_ocupacion`) REFERENCES `ocupacion_unidad` (`id_ocupacion`),
  CONSTRAINT `fk_lectura_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`),
  CONSTRAINT `fk_lectura_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `liquidacion_luz_detalle`
--

DROP TABLE IF EXISTS `liquidacion_luz_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `liquidacion_luz_detalle` (
  `id_liquidacion_detalle` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_periodo` int(10) unsigned NOT NULL,
  `id_inmueble` int(10) unsigned NOT NULL,
  `id_unidad` int(10) unsigned NOT NULL,
  `id_persona` int(10) unsigned DEFAULT NULL,
  `id_lectura` int(10) unsigned NOT NULL,
  `id_recibo_luz` int(10) unsigned NOT NULL,
  `consumo_kwh` decimal(12,2) NOT NULL DEFAULT 0.00,
  `porcentaje_participacion` decimal(10,6) NOT NULL DEFAULT 0.000000,
  `monto_consumo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gasto_comun` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ajuste` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_pagar_luz` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('GENERADO','RECALCULADO','ANULADO') NOT NULL DEFAULT 'GENERADO',
  `observacion` varchar(255) DEFAULT NULL,
  `fecha_calculo` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_liquidacion_detalle`),
  UNIQUE KEY `uq_liquidacion_periodo_unidad` (`id_periodo`,`id_unidad`),
  KEY `fk_liq_inmueble` (`id_inmueble`),
  KEY `fk_liq_lectura` (`id_lectura`),
  KEY `fk_liq_recibo` (`id_recibo_luz`),
  KEY `idx_liq_periodo` (`id_periodo`),
  KEY `idx_liq_unidad` (`id_unidad`),
  KEY `idx_liq_persona` (`id_persona`),
  CONSTRAINT `fk_liq_inmueble` FOREIGN KEY (`id_inmueble`) REFERENCES `inmuebles` (`id_inmueble`),
  CONSTRAINT `fk_liq_lectura` FOREIGN KEY (`id_lectura`) REFERENCES `lecturas_unidad` (`id_lectura`),
  CONSTRAINT `fk_liq_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`),
  CONSTRAINT `fk_liq_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`),
  CONSTRAINT `fk_liq_recibo` FOREIGN KEY (`id_recibo_luz`) REFERENCES `recibos_luz` (`id_recibo_luz`),
  CONSTRAINT `fk_liq_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=880 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(60) NOT NULL,
  `name` varchar(100) NOT NULL,
  `parent_module_id` bigint(20) unsigned DEFAULT NULL,
  `sort_order` smallint(5) unsigned NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_module_code` (`code`),
  KEY `idx_module_parent` (`parent_module_id`),
  CONSTRAINT `fk_module_parent` FOREIGN KEY (`parent_module_id`) REFERENCES `modules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ocupacion_unidad`
--

DROP TABLE IF EXISTS `ocupacion_unidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ocupacion_unidad` (
  `id_ocupacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_unidad` int(10) unsigned NOT NULL,
  `id_persona` int(10) unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `monto_alquiler` decimal(10,2) NOT NULL DEFAULT 0.00,
  `garantia` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('ACTIVO','FINALIZADO','ANULADO') NOT NULL DEFAULT 'ACTIVO',
  `observacion` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `activa_flag` int(10) unsigned GENERATED ALWAYS AS (if(`estado` = 'ACTIVO',`id_unidad`,NULL)) STORED,
  PRIMARY KEY (`id_ocupacion`),
  UNIQUE KEY `uq_ocupacion_unidad_activa` (`id_unidad`,`activa_flag`),
  KEY `idx_ocupacion_unidad` (`id_unidad`),
  KEY `idx_ocupacion_persona` (`id_persona`),
  KEY `idx_ocupacion_estado` (`estado`),
  KEY `idx_ocupacion_fechas` (`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `fk_ocupacion_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`),
  CONSTRAINT `fk_ocupacion_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos` (
  `id_pago` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_cobro` int(10) unsigned NOT NULL,
  `fecha_pago` date NOT NULL,
  `monto_pagado` decimal(10,2) NOT NULL,
  `metodo_pago` enum('EFECTIVO','YAPE','PLIN','TRANSFERENCIA','OTRO') NOT NULL DEFAULT 'EFECTIVO',
  `numero_operacion` varchar(100) DEFAULT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  `estado` enum('REGISTRADO','REVERSADO','ANULADO') NOT NULL DEFAULT 'REGISTRADO',
  `origen_registro` enum('MANUAL','MIGRACION','AJUSTE') NOT NULL DEFAULT 'MANUAL',
  `registrado_por` varchar(100) DEFAULT NULL,
  `reversado_por` varchar(100) DEFAULT NULL,
  `fecha_reversa` datetime DEFAULT NULL,
  `motivo_reversa` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_pago`),
  KEY `idx_pagos_cobro` (`id_cobro`),
  KEY `idx_pagos_fecha` (`fecha_pago`),
  KEY `idx_pagos_estado` (`estado`),
  KEY `idx_pagos_origen` (`origen_registro`),
  CONSTRAINT `fk_pago_cobro` FOREIGN KEY (`id_cobro`) REFERENCES `cobros_mensuales` (`id_cobro`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_pagos_bu
BEFORE UPDATE ON pagos
FOR EACH ROW
BEGIN
    IF NEW.estado IN ('REVERSADO', 'ANULADO') THEN
        IF NEW.motivo_reversa IS NULL OR TRIM(NEW.motivo_reversa) = '' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La reversa o anulacion requiere motivo_reversa.';
        END IF;

        IF NEW.reversado_por IS NULL OR TRIM(NEW.reversado_por) = '' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La reversa o anulacion requiere reversado_por.';
        END IF;

        IF NEW.fecha_reversa IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La reversa o anulacion requiere fecha_reversa.';
        END IF;
    END IF;

    IF OLD.estado IN ('REVERSADO', 'ANULADO') AND NEW.estado = 'REGISTRADO' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Un pago reversado o anulado no debe volver a REGISTRADO.';
    END IF;

    IF OLD.id_cobro <> NEW.id_cobro AND OLD.estado IN ('REVERSADO', 'ANULADO') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se permite mover un pago reversado o anulado a otro cobro.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_pagos_au
AFTER UPDATE ON pagos
FOR EACH ROW
BEGIN

    IF OLD.id_cobro <> NEW.id_cobro THEN
        CALL sp_recalcular_estado_cobro(OLD.id_cobro);
    END IF;

    CALL sp_recalcular_estado_cobro(NEW.id_cobro);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `pagos_auditoria`
--

DROP TABLE IF EXISTS `pagos_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos_auditoria` (
  `id_pago_auditoria` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_pago` int(10) unsigned NOT NULL,
  `accion` enum('CREADO','ACTUALIZADO','APLICADO','REVERSADO','ANULADO') NOT NULL,
  `actor` varchar(100) DEFAULT NULL,
  `payload_before` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload_before`)),
  `payload_after` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload_after`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_pago_auditoria`),
  KEY `idx_pago_auditoria_pago` (`id_pago`),
  KEY `idx_pago_auditoria_accion_fecha` (`accion`,`created_at`),
  CONSTRAINT `fk_pago_auditoria_pago` FOREIGN KEY (`id_pago`) REFERENCES `pagos` (`id_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=272 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagos_detalle`
--

DROP TABLE IF EXISTS `pagos_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos_detalle` (
  `id_pago_detalle` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_pago` int(10) unsigned NOT NULL,
  `id_cobro_detalle` bigint(20) unsigned NOT NULL,
  `monto_aplicado` decimal(12,2) NOT NULL,
  `origen_aplicacion` enum('MANUAL','AUTOMATICA','MIGRACION','REVERSA') NOT NULL DEFAULT 'MANUAL',
  `observacion` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_pago_detalle`),
  UNIQUE KEY `uq_pago_detalle_pago_linea` (`id_pago`,`id_cobro_detalle`),
  KEY `idx_pago_detalle_linea` (`id_cobro_detalle`),
  KEY `idx_pago_detalle_origen` (`origen_aplicacion`),
  CONSTRAINT `fk_pago_detalle_cobro_detalle` FOREIGN KEY (`id_cobro_detalle`) REFERENCES `cobros_mensuales_detalle` (`id_cobro_detalle`),
  CONSTRAINT `fk_pago_detalle_pago` FOREIGN KEY (`id_pago`) REFERENCES `pagos` (`id_pago`),
  CONSTRAINT `chk_pago_detalle_monto_positivo` CHECK (`monto_aplicado` > 0)
) ENGINE=InnoDB AUTO_INCREMENT=273 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_pagos_detalle_bi
BEFORE INSERT ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro_pago INT UNSIGNED;
    DECLARE v_estado_pago VARCHAR(20);
    DECLARE v_monto_pago DECIMAL(12,2);
    DECLARE v_id_cobro_detalle BIGINT UNSIGNED;
    DECLARE v_monto_programado DECIMAL(12,2);
    DECLARE v_permite_pago_directo TINYINT(1);
    DECLARE v_total_aplicado_pago DECIMAL(12,2);
    DECLARE v_total_aplicado_linea DECIMAL(12,2);
    DECLARE v_saldo_linea DECIMAL(12,2);

    SELECT p.id_cobro, p.estado, p.monto_pagado
    INTO v_id_cobro_pago, v_estado_pago, v_monto_pago
    FROM pagos p
    WHERE p.id_pago = NEW.id_pago
    LIMIT 1;

    IF v_id_cobro_pago IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El pago asociado no existe.';
    END IF;

    IF v_estado_pago <> 'REGISTRADO' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Solo se puede aplicar detalle sobre pagos en estado REGISTRADO.';
    END IF;

    SELECT cd.id_cobro, cd.monto_programado, cc.permite_pago_directo
    INTO v_id_cobro_detalle, v_monto_programado, v_permite_pago_directo
    FROM cobros_mensuales_detalle cd
    INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
    WHERE cd.id_cobro_detalle = NEW.id_cobro_detalle
    LIMIT 1;

    IF v_id_cobro_detalle IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La linea de cobro asociada no existe.';
    END IF;

    IF v_id_cobro_pago <> v_id_cobro_detalle THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La linea de detalle no pertenece al mismo cobro del pago.';
    END IF;

    IF v_permite_pago_directo = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El concepto seleccionado no permite pago directo.';
    END IF;

    IF NEW.monto_aplicado <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto aplicado debe ser mayor a cero.';
    END IF;

    SELECT IFNULL(SUM(pd.monto_aplicado), 0)
    INTO v_total_aplicado_pago
    FROM pagos_detalle pd
    WHERE pd.id_pago = NEW.id_pago;

    IF v_total_aplicado_pago + NEW.monto_aplicado > v_monto_pago THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La suma del detalle excede el monto total del pago.';
    END IF;

    SELECT IFNULL(SUM(pd.monto_aplicado), 0)
    INTO v_total_aplicado_linea
    FROM pagos_detalle pd
    INNER JOIN pagos p ON p.id_pago = pd.id_pago
    WHERE pd.id_cobro_detalle = NEW.id_cobro_detalle
      AND p.estado = 'REGISTRADO';

    SET v_saldo_linea = GREATEST(v_monto_programado - v_total_aplicado_linea, 0);

    IF NEW.monto_aplicado > v_saldo_linea THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto aplicado excede el saldo disponible del concepto.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_pagos_detalle_ai
AFTER INSERT ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro INT UNSIGNED;

    SELECT p.id_cobro INTO v_id_cobro
    FROM pagos p
    WHERE p.id_pago = NEW.id_pago
    LIMIT 1;

    CALL sp_recalcular_estado_cobro(v_id_cobro);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_pagos_detalle_bu
BEFORE UPDATE ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro_pago INT UNSIGNED;
    DECLARE v_estado_pago VARCHAR(20);
    DECLARE v_monto_pago DECIMAL(12,2);
    DECLARE v_id_cobro_detalle BIGINT UNSIGNED;
    DECLARE v_monto_programado DECIMAL(12,2);
    DECLARE v_permite_pago_directo TINYINT(1);
    DECLARE v_total_aplicado_pago DECIMAL(12,2);
    DECLARE v_total_aplicado_linea DECIMAL(12,2);
    DECLARE v_saldo_linea DECIMAL(12,2);

    SELECT p.id_cobro, p.estado, p.monto_pagado
    INTO v_id_cobro_pago, v_estado_pago, v_monto_pago
    FROM pagos p
    WHERE p.id_pago = NEW.id_pago
    LIMIT 1;

    IF v_id_cobro_pago IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El pago asociado no existe.';
    END IF;

    IF v_estado_pago <> 'REGISTRADO' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Solo se puede modificar detalle sobre pagos en estado REGISTRADO.';
    END IF;

    SELECT cd.id_cobro, cd.monto_programado, cc.permite_pago_directo
    INTO v_id_cobro_detalle, v_monto_programado, v_permite_pago_directo
    FROM cobros_mensuales_detalle cd
    INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
    WHERE cd.id_cobro_detalle = NEW.id_cobro_detalle
    LIMIT 1;

    IF v_id_cobro_pago <> v_id_cobro_detalle THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La linea de detalle no pertenece al mismo cobro del pago.';
    END IF;

    IF v_permite_pago_directo = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El concepto seleccionado no permite pago directo.';
    END IF;

    IF NEW.monto_aplicado <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto aplicado debe ser mayor a cero.';
    END IF;

    SELECT IFNULL(SUM(pd.monto_aplicado), 0)
    INTO v_total_aplicado_pago
    FROM pagos_detalle pd
    WHERE pd.id_pago = NEW.id_pago
      AND pd.id_pago_detalle <> OLD.id_pago_detalle;

    IF v_total_aplicado_pago + NEW.monto_aplicado > v_monto_pago THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La suma del detalle excede el monto total del pago.';
    END IF;

    SELECT IFNULL(SUM(pd.monto_aplicado), 0)
    INTO v_total_aplicado_linea
    FROM pagos_detalle pd
    INNER JOIN pagos p ON p.id_pago = pd.id_pago
    WHERE pd.id_cobro_detalle = NEW.id_cobro_detalle
      AND p.estado = 'REGISTRADO'
      AND pd.id_pago_detalle <> OLD.id_pago_detalle;

    SET v_saldo_linea = GREATEST(v_monto_programado - v_total_aplicado_linea, 0);

    IF NEW.monto_aplicado > v_saldo_linea THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto aplicado excede el saldo disponible del concepto.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_pagos_detalle_au
AFTER UPDATE ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro INT UNSIGNED;

    SELECT p.id_cobro INTO v_id_cobro
    FROM pagos p
    WHERE p.id_pago = NEW.id_pago
    LIMIT 1;

    CALL sp_recalcular_estado_cobro(v_id_cobro);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_pagos_detalle_ad
AFTER DELETE ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro INT UNSIGNED;

    SELECT p.id_cobro INTO v_id_cobro
    FROM pagos p
    WHERE p.id_pago = OLD.id_pago
    LIMIT 1;

    CALL sp_recalcular_estado_cobro(v_id_cobro);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_gateway_transactions`
--

DROP TABLE IF EXISTS `payment_gateway_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_gateway_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_pago` int(10) unsigned NOT NULL,
  `provider` varchar(40) NOT NULL,
  `external_transaction_id` varchar(120) DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `raw_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_payload`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_gateway_tx_pago` (`id_pago`),
  KEY `idx_gateway_tx_status` (`status`),
  CONSTRAINT `fk_gateway_tx_pago` FOREIGN KEY (`id_pago`) REFERENCES `pagos` (`id_pago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `periodos`
--

DROP TABLE IF EXISTS `periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `periodos` (
  `id_periodo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `anio` smallint(6) NOT NULL,
  `mes` tinyint(4) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('ABIERTO','CERRADO','ANULADO') NOT NULL DEFAULT 'ABIERTO',
  `observacion` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_periodo`),
  UNIQUE KEY `uq_periodo` (`anio`,`mes`),
  KEY `idx_periodos_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personas`
--

DROP TABLE IF EXISTS `personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personas` (
  `id_persona` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tipo_persona` enum('INQUILINO','PROPIETARIO','ADMIN','SUPERVISOR','OTRO') NOT NULL DEFAULT 'INQUILINO',
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `tipo_documento` varchar(20) DEFAULT NULL,
  `numero_documento` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `uq_persona_documento` (`tipo_documento`,`numero_documento`),
  KEY `idx_personas_nombre` (`apellidos`,`nombres`),
  KEY `idx_personas_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profile_fields`
--

DROP TABLE IF EXISTS `profile_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profile_fields` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(40) NOT NULL,
  `label` varchar(100) NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profile_fields_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recibos_luz`
--

DROP TABLE IF EXISTS `recibos_luz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recibos_luz` (
  `id_recibo_luz` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_inmueble` int(10) unsigned NOT NULL,
  `id_periodo` int(10) unsigned NOT NULL,
  `numero_recibo` varchar(50) DEFAULT NULL,
  `numero_suministro` varchar(30) DEFAULT NULL,
  `fecha_emision` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `lectura_anterior_general` decimal(12,2) DEFAULT NULL,
  `lectura_actual_general` decimal(12,2) DEFAULT NULL,
  `consumo_kwh_general` decimal(12,2) DEFAULT NULL,
  `precio_kwh` decimal(10,4) NOT NULL DEFAULT 0.0000,
  `consumo_energia` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cargo_fijo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `mant_reposicion` decimal(10,2) NOT NULL DEFAULT 0.00,
  `alumbrado_publico` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `igv` decimal(10,2) NOT NULL DEFAULT 0.00,
  `electrificacion_rural` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ajuste_redondeo_anterior` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ajuste_redondeo_actual` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_recibo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `observacion` varchar(255) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_recibo_luz`),
  UNIQUE KEY `uq_recibo_luz_inmueble_periodo` (`id_inmueble`,`id_periodo`),
  KEY `idx_recibo_luz_inmueble` (`id_inmueble`),
  KEY `idx_recibo_luz_periodo` (`id_periodo`),
  CONSTRAINT `fk_recibo_luz_inmueble` FOREIGN KEY (`id_inmueble`) REFERENCES `inmuebles` (`id_inmueble`),
  CONSTRAINT `fk_recibo_luz_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`),
  CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tarifas_auditoria`
--

DROP TABLE IF EXISTS `tarifas_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tarifas_auditoria` (
  `id_tarifa_auditoria` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_tarifa` int(11) NOT NULL,
  `accion` varchar(40) NOT NULL,
  `actor` varchar(100) DEFAULT NULL,
  `payload_before` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload_before`)),
  `payload_after` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload_after`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_tarifa_auditoria`),
  KEY `idx_tarifa_auditoria_tarifa` (`id_tarifa`),
  CONSTRAINT `fk_tarifa_auditoria_tarifa` FOREIGN KEY (`id_tarifa`) REFERENCES `tarifas_servicios` (`id_tarifa`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tarifas_servicios`
--

DROP TABLE IF EXISTS `tarifas_servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tarifas_servicios` (
  `id_tarifa` int(11) NOT NULL AUTO_INCREMENT,
  `id_inmueble` int(11) NOT NULL,
  `servicio` varchar(50) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL DEFAULT 0.00,
  `por_unidad` tinyint(1) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tarifa`),
  UNIQUE KEY `uk_inmueble_servicio` (`id_inmueble`,`servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unidades`
--

DROP TABLE IF EXISTS `unidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unidades` (
  `id_unidad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_inmueble` int(10) unsigned NOT NULL,
  `codigo_unidad` varchar(20) NOT NULL,
  `nombre_unidad` varchar(100) NOT NULL,
  `piso` int(11) NOT NULL,
  `tipo_unidad` enum('CUARTO','MINI_DPTO','DEPARTAMENTO','LOCAL','DEPOSITO','AREA_COMUN','MEDIDOR_GENERAL','OTRO') NOT NULL DEFAULT 'CUARTO',
  `tiene_medidor` enum('SI','NO') NOT NULL DEFAULT 'SI',
  `medidor_codigo` varchar(50) DEFAULT NULL,
  `tarifa_alquiler_base` decimal(10,2) NOT NULL DEFAULT 0.00,
  `observacion` varchar(255) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_unidad`),
  UNIQUE KEY `uq_unidad_codigo` (`id_inmueble`,`codigo_unidad`),
  KEY `idx_unidades_inmueble` (`id_inmueble`),
  KEY `idx_unidades_piso` (`piso`),
  KEY `idx_unidades_estado` (`estado`),
  CONSTRAINT `fk_unidades_inmueble` FOREIGN KEY (`id_inmueble`) REFERENCES `inmuebles` (`id_inmueble`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unidades_medidor_compartido`
--

DROP TABLE IF EXISTS `unidades_medidor_compartido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unidades_medidor_compartido` (
  `id_relacion` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_unidad_titular` int(10) unsigned NOT NULL,
  `id_unidad_dependiente` int(10) unsigned NOT NULL,
  `porcentaje_dependiente` decimal(5,2) NOT NULL DEFAULT 0.00,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `observacion` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_relacion`),
  UNIQUE KEY `uq_medidor_dependiente` (`id_unidad_dependiente`),
  KEY `idx_medidor_titular` (`id_unidad_titular`),
  CONSTRAINT `fk_medidor_dependiente` FOREIGN KEY (`id_unidad_dependiente`) REFERENCES `unidades` (`id_unidad`),
  CONSTRAINT `fk_medidor_titular` FOREIGN KEY (`id_unidad_titular`) REFERENCES `unidades` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_persona` int(10) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_id_persona_unique` (`id_persona`),
  CONSTRAINT `users_id_persona_foreign` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `vw_cobros_resumen`
--

DROP TABLE IF EXISTS `vw_cobros_resumen`;
/*!50001 DROP VIEW IF EXISTS `vw_cobros_resumen`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_cobros_resumen` AS SELECT
 1 AS `id_cobro`,
  1 AS `anio`,
  1 AS `mes`,
  1 AS `codigo_unidad`,
  1 AS `nombre_unidad`,
  1 AS `inquilino`,
  1 AS `monto_alquiler`,
  1 AS `monto_luz`,
  1 AS `monto_agua`,
  1 AS `monto_gas`,
  1 AS `otros_conceptos`,
  1 AS `descuento`,
  1 AS `mora`,
  1 AS `total_cobrar`,
  1 AS `total_pagado`,
  1 AS `saldo_pendiente`,
  1 AS `estado_pago` */;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'alquileres_db'
--

--
-- Dumping routines for database 'alquileres_db'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_recalcular_estado_cobro` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_recalcular_estado_cobro`(IN p_id_cobro INT UNSIGNED)
BEGIN
    DECLARE v_total_cobrar DECIMAL(12,2) DEFAULT 0;
    DECLARE v_total_pagado DECIMAL(12,2) DEFAULT 0;
    DECLARE v_estado_actual VARCHAR(20);

    SELECT c.total_cobrar, c.estado_pago
    INTO v_total_cobrar, v_estado_actual
    FROM cobros_mensuales c
    WHERE c.id_cobro = p_id_cobro
    LIMIT 1;

    IF v_estado_actual IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cobro no encontrado para recalculo de estado.';
    END IF;

    IF v_estado_actual <> 'ANULADO' THEN
        SELECT IFNULL(SUM(CASE WHEN p.estado = 'REGISTRADO' THEN p.monto_pagado ELSE 0 END), 0)
        INTO v_total_pagado
        FROM pagos p
        WHERE p.id_cobro = p_id_cobro;

        UPDATE cobros_mensuales c
        SET c.estado_pago = CASE
                WHEN v_total_pagado <= 0 THEN 'PENDIENTE'
                WHEN v_total_pagado < v_total_cobrar THEN 'PARCIAL'
                ELSE 'PAGADO'
            END,
            c.updated_at = CURRENT_TIMESTAMP
        WHERE c.id_cobro = p_id_cobro;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `vw_cobros_resumen`
--

/*!50001 DROP VIEW IF EXISTS `vw_cobros_resumen`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_cobros_resumen` AS select `c`.`id_cobro` AS `id_cobro`,`pr`.`anio` AS `anio`,`pr`.`mes` AS `mes`,`u`.`codigo_unidad` AS `codigo_unidad`,`u`.`nombre_unidad` AS `nombre_unidad`,concat(`pe`.`nombres`,' ',`pe`.`apellidos`) AS `inquilino`,`c`.`monto_alquiler` AS `monto_alquiler`,`c`.`monto_luz` AS `monto_luz`,`c`.`monto_agua` AS `monto_agua`,`c`.`monto_gas` AS `monto_gas`,`c`.`otros_conceptos` AS `otros_conceptos`,`c`.`descuento` AS `descuento`,`c`.`mora` AS `mora`,`c`.`total_cobrar` AS `total_cobrar`,ifnull(sum(`pg`.`monto_pagado`),0) AS `total_pagado`,round(`c`.`total_cobrar` - ifnull(sum(`pg`.`monto_pagado`),0),2) AS `saldo_pendiente`,`c`.`estado_pago` AS `estado_pago` from ((((`cobros_mensuales` `c` join `periodos` `pr` on(`pr`.`id_periodo` = `c`.`id_periodo`)) join `personas` `pe` on(`pe`.`id_persona` = `c`.`id_persona`)) join `unidades` `u` on(`u`.`id_unidad` = `c`.`id_unidad`)) left join `pagos` `pg` on(`pg`.`id_cobro` = `c`.`id_cobro`)) group by `c`.`id_cobro`,`pr`.`anio`,`pr`.`mes`,`u`.`codigo_unidad`,`u`.`nombre_unidad`,`pe`.`nombres`,`pe`.`apellidos`,`c`.`monto_alquiler`,`c`.`monto_luz`,`c`.`monto_agua`,`c`.`monto_gas`,`c`.`otros_conceptos`,`c`.`descuento`,`c`.`mora`,`c`.`total_cobrar`,`c`.`estado_pago` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-22  2:45:12
