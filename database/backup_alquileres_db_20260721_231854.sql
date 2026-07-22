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
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('alquileres-app-cache-spatie.permission.cache','a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:38:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:13:\"dashboard.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:12:\"periodos.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:14:\"periodos.crear\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:15:\"periodos.cerrar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:4;a:4:{s:1:\"a\";i:5;s:1:\"b\";s:14:\"inquilinos.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:5;a:4:{s:1:\"a\";i:6;s:1:\"b\";s:16:\"inquilinos.crear\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:6;a:4:{s:1:\"a\";i:7;s:1:\"b\";s:17:\"inquilinos.editar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:7;a:4:{s:1:\"a\";i:8;s:1:\"b\";s:19:\"inquilinos.eliminar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:8;a:4:{s:1:\"a\";i:9;s:1:\"b\";s:12:\"unidades.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:9;a:4:{s:1:\"a\";i:10;s:1:\"b\";s:14:\"unidades.crear\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:10;a:4:{s:1:\"a\";i:11;s:1:\"b\";s:15:\"unidades.editar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:11;a:4:{s:1:\"a\";i:12;s:1:\"b\";s:15:\"ocupaciones.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:12;a:4:{s:1:\"a\";i:13;s:1:\"b\";s:17:\"ocupaciones.crear\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:13;a:4:{s:1:\"a\";i:14;s:1:\"b\";s:21:\"ocupaciones.finalizar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:14;a:4:{s:1:\"a\";i:15;s:1:\"b\";s:12:\"lecturas.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:15;a:4:{s:1:\"a\";i:16;s:1:\"b\";s:18:\"lecturas.registrar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:16;a:4:{s:1:\"a\";i:17;s:1:\"b\";s:20:\"lecturas.sincronizar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:17;a:4:{s:1:\"a\";i:18;s:1:\"b\";s:10:\"recibo.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:18;a:4:{s:1:\"a\";i:19;s:1:\"b\";s:12:\"recibo.crear\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:19;a:4:{s:1:\"a\";i:20;s:1:\"b\";s:13:\"recibo.editar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:20;a:4:{s:1:\"a\";i:21;s:1:\"b\";s:15:\"liquidacion.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:21;a:4:{s:1:\"a\";i:22;s:1:\"b\";s:19:\"liquidacion.generar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:22;a:4:{s:1:\"a\";i:23;s:1:\"b\";s:22:\"liquidacion.recalcular\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:23;a:4:{s:1:\"a\";i:24;s:1:\"b\";s:10:\"cobros.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:24;a:4:{s:1:\"a\";i:25;s:1:\"b\";s:14:\"cobros.generar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:25;a:4:{s:1:\"a\";i:26;s:1:\"b\";s:27:\"cobros.forzar_actualizacion\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:26;a:4:{s:1:\"a\";i:27;s:1:\"b\";s:22:\"cobros.pagos.registrar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:27;a:4:{s:1:\"a\";i:28;s:1:\"b\";s:21:\"cobros.pagos.reversar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:28;a:4:{s:1:\"a\";i:29;s:1:\"b\";s:19:\"cobros.pagos.anular\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:29;a:4:{s:1:\"a\";i:30;s:1:\"b\";s:10:\"avisos.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:30;a:4:{s:1:\"a\";i:31;s:1:\"b\";s:13:\"avisos.enviar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:31;a:4:{s:1:\"a\";i:32;s:1:\"b\";s:11:\"tarifas.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:32;a:4:{s:1:\"a\";i:33;s:1:\"b\";s:14:\"tarifas.editar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:33;a:4:{s:1:\"a\";i:34;s:1:\"b\";s:19:\"config_cobranza.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:34;a:4:{s:1:\"a\";i:35;s:1:\"b\";s:22:\"config_cobranza.editar\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:35;a:4:{s:1:\"a\";i:36;s:1:\"b\";s:12:\"usuarios.ver\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:36;a:4:{s:1:\"a\";i:37;s:1:\"b\";s:14:\"usuarios.crear\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:37;a:4:{s:1:\"a\";i:38;s:1:\"b\";s:20:\"usuarios.asignar_rol\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}}s:5:\"roles\";a:2:{i:0;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:5:\"Admin\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:10:\"Supervisor\";s:1:\"c\";s:3:\"web\";}}}',1784778416);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=473 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cobros_mensuales`
--

LOCK TABLES `cobros_mensuales` WRITE;
/*!40000 ALTER TABLE `cobros_mensuales` DISABLE KEYS */;
INSERT INTO `cobros_mensuales` VALUES (32,2,1,1,180.00,142.92,0.00,15.00,0.00,0.00,0.00,0.00,337.92,'2026-03-15','PENDIENTE','Cobro generado desde API PHP','2026-03-22 23:02:10','2026-03-23 02:46:14'),(33,2,2,2,180.00,13.99,0.00,15.00,0.00,0.00,0.00,0.00,208.99,'2026-03-15','PAGADO','Cobro generado desde API PHP','2026-03-22 23:02:10','2026-04-17 19:28:39'),(34,2,8,3,180.00,0.00,0.00,15.00,0.00,0.00,0.00,0.00,195.00,'2026-03-15','PAGADO','Cobro generado desde API PHP','2026-03-22 23:02:10','2026-04-17 19:33:36'),(35,2,3,4,180.00,16.98,0.00,15.00,0.00,0.00,0.00,0.00,211.98,'2026-03-15','PAGADO','Cobro generado desde API PHP','2026-03-22 23:02:10','2026-06-19 15:14:06'),(36,2,4,5,180.00,77.44,0.00,15.00,0.00,0.00,0.00,0.00,272.44,'2026-03-15','PAGADO','Cobro generado desde API PHP','2026-03-22 23:02:10','2026-04-17 19:30:53'),(37,2,6,9,180.00,6.38,0.00,15.00,0.00,0.00,0.00,0.00,201.38,'2026-03-15','PAGADO','Cobro generado desde API PHP','2026-03-22 23:02:10','2026-04-17 19:31:23'),(38,2,7,10,180.00,19.29,0.00,15.00,0.00,0.00,0.00,0.00,214.29,'2026-03-15','PAGADO','Cobro generado desde API PHP','2026-03-22 23:02:10','2026-04-17 19:28:50'),(39,2,5,13,180.00,0.00,0.00,15.00,0.00,0.00,0.00,0.00,195.00,'2026-03-15','PAGADO','Cobro generado desde API PHP','2026-03-22 23:02:10','2026-04-17 19:32:53'),(40,2,5,14,180.00,0.00,0.00,15.00,0.00,0.00,0.00,0.00,195.00,'2026-03-15','PAGADO','Cobro generado desde API PHP','2026-03-22 23:02:10','2026-04-17 19:32:58'),(231,1,1,1,0.00,85.44,0.00,30.00,0.00,0.00,0.00,0.00,115.44,'2026-04-01','PENDIENTE','Cobro generado desde API PHP','2026-03-23 12:50:11',NULL),(232,1,2,2,180.00,18.05,0.00,30.00,0.00,0.00,0.00,0.00,228.05,'2026-04-01','PAGADO','Cobro generado desde API PHP','2026-03-23 12:50:11','2026-04-17 19:34:35'),(233,1,8,3,180.00,25.00,0.00,30.00,0.00,0.00,0.00,0.00,233.69,'2026-04-01','PAGADO','Cobro generado desde API PHP','2026-03-23 12:50:11','2026-06-19 15:13:22'),(234,1,3,4,180.00,34.44,0.00,30.00,0.00,0.00,0.00,0.00,244.44,'2026-04-01','PAGADO','Cobro generado desde API PHP','2026-03-23 12:50:11','2026-04-17 19:38:49'),(235,1,4,5,180.00,17.16,0.00,30.00,0.00,0.00,0.00,0.00,227.16,'2026-04-01','PAGADO','Cobro generado desde API PHP','2026-03-23 12:50:11','2026-04-17 19:35:37'),(236,1,6,9,180.00,3.97,6.13,30.00,0.00,0.00,0.00,0.00,220.10,'2026-04-01','PAGADO','Cobro generado desde API PHP | Ajuste minimo luz: S/ 6.13','2026-03-23 12:50:11','2026-04-17 19:36:05'),(237,1,7,10,180.00,11.39,0.00,30.00,0.00,0.00,0.00,0.00,221.39,'2026-04-01','PAGADO','Cobro generado desde API PHP','2026-03-23 12:50:11','2026-04-17 19:36:33'),(238,1,5,12,700.00,16.51,0.00,30.00,0.00,0.00,0.00,0.00,746.51,'2026-04-01','PAGADO','Cobro generado desde API PHP','2026-03-23 12:50:11','2026-04-17 19:34:07'),(239,1,5,13,360.00,2.56,7.54,30.00,0.00,0.00,0.00,0.00,400.10,'2026-04-01','PAGADO','Cobro generado desde API PHP | Ajuste minimo luz: S/ 7.54','2026-03-23 12:50:11','2026-06-19 16:08:49'),(240,6,1,1,0.00,87.24,0.00,30.00,0.00,0.00,0.00,0.00,117.24,'2026-01-30','PENDIENTE','Cobro generado desde API PHP','2026-03-24 10:45:04',NULL),(241,6,2,2,180.00,16.65,0.00,30.00,0.00,0.00,0.00,0.00,226.65,'2026-01-30','PAGADO','Cobro generado desde API PHP','2026-03-24 10:45:04','2026-04-17 19:25:33'),(242,6,8,3,180.00,40.32,0.00,30.00,0.00,0.00,0.00,0.00,250.32,'2026-01-30','PAGADO','Cobro generado desde API PHP','2026-03-24 10:45:04','2026-04-17 19:26:05'),(243,6,28,4,180.00,5.03,5.07,30.00,0.00,0.00,0.00,0.00,220.10,'2026-01-30','PARCIAL','Cobro generado desde API PHP | Ajuste minimo luz: S/ 5.07','2026-03-24 10:45:04','2026-04-17 19:28:03'),(244,6,4,5,180.00,58.44,0.00,30.00,0.00,0.00,0.00,0.00,268.44,'2026-01-30','PAGADO','Cobro generado desde API PHP','2026-03-24 10:45:04','2026-04-17 19:26:45'),(245,6,6,9,180.00,2.09,8.01,30.00,0.00,0.00,0.00,0.00,220.10,'2026-01-30','PAGADO','Cobro generado desde API PHP | Ajuste minimo luz: S/ 8.01','2026-03-24 10:45:04','2026-04-17 19:27:01'),(246,6,7,10,180.00,9.42,0.68,30.00,0.00,0.00,0.00,0.00,220.10,'2026-01-30','PAGADO','Cobro generado desde API PHP | Ajuste minimo luz: S/ 0.68','2026-03-24 10:45:04','2026-04-17 19:26:53'),(247,6,5,12,700.00,17.80,0.00,30.00,0.00,0.00,0.00,0.00,747.80,'2026-01-30','PAGADO','Cobro generado desde API PHP','2026-03-24 10:45:04','2026-04-17 19:25:47'),(248,6,30,13,180.00,4.71,5.39,30.00,0.00,0.00,0.00,0.00,220.10,'2026-01-30','PAGADO','Cobro generado desde API PHP | Ajuste minimo luz: S/ 5.39','2026-03-24 10:45:04','2026-04-17 19:27:22'),(303,8,1,1,0.00,80.35,0.00,30.00,0.00,0.00,0.00,0.00,110.35,'2026-05-02','PAGADO','Cobro generado desde API PHP','2026-04-17 19:56:42','2026-05-11 15:53:23'),(304,8,2,2,180.00,16.96,0.00,30.00,0.00,0.00,0.00,0.00,226.96,'2026-05-02','PAGADO','Cobro generado desde API PHP','2026-04-17 19:56:42','2026-05-11 15:53:29'),(305,8,8,3,180.00,23.16,0.00,30.00,0.00,0.00,0.00,0.00,233.16,'2026-05-02','PAGADO','Cobro generado desde API PHP','2026-04-17 19:56:42','2026-06-19 15:11:35'),(306,8,3,4,180.00,34.25,0.00,30.00,0.00,0.00,0.00,0.00,244.25,'2026-05-02','PAGADO','Cobro generado desde API PHP','2026-04-17 19:56:42','2026-05-11 15:53:34'),(307,8,4,5,180.00,21.98,0.00,30.00,0.00,0.00,0.00,0.00,231.98,'2026-05-02','PAGADO','Cobro generado desde API PHP','2026-04-17 19:56:42','2026-05-11 15:53:36'),(308,8,31,6,200.00,1.28,9.32,30.00,0.00,0.00,0.00,0.00,240.60,'2026-05-02','PAGADO','Cobro generado desde API PHP | Ajuste minimo luz: S/ 9.32','2026-04-17 19:56:42','2026-05-15 15:10:08'),(309,8,6,9,180.00,5.22,5.38,30.00,0.00,0.00,0.00,0.00,220.60,'2026-05-02','PAGADO','Cobro generado desde API PHP | Ajuste minimo luz: S/ 5.38','2026-04-17 19:56:42','2026-05-11 15:54:06'),(310,8,7,10,180.00,8.85,1.75,30.00,0.00,0.00,0.00,0.00,220.60,'2026-05-02','PAGADO','Cobro generado desde API PHP | Ajuste minimo luz: S/ 1.75','2026-04-17 19:56:42','2026-05-11 15:54:09'),(311,8,5,13,360.00,8.64,1.96,30.00,0.00,0.00,0.00,0.00,400.60,'2026-05-02','PAGADO','Cobro generado desde API PHP | Ajuste minimo luz: S/ 1.96','2026-04-17 19:56:42','2026-06-19 16:09:06'),(383,9,1,1,0.00,77.10,0.00,30.00,0.00,0.00,0.00,0.00,107.10,'2026-05-31','PAGADO','Cobro generado desde API PHP','2026-06-01 23:31:42','2026-06-19 21:20:38'),(384,9,2,2,180.00,17.00,0.00,30.00,0.00,0.00,0.00,0.00,227.00,'2026-05-31','PAGADO','Cobro generado desde API PHP','2026-06-01 23:31:42','2026-06-19 21:17:11'),(385,9,8,3,180.00,25.90,0.20,30.00,0.00,0.00,0.00,0.00,236.10,'2026-05-31','PENDIENTE','Cobro generado desde API PHP','2026-06-01 23:31:42','2026-06-19 21:25:54'),(386,9,3,4,180.00,45.00,0.00,30.00,0.00,0.00,0.00,0.00,255.00,'2026-05-31','PAGADO','Cobro generado desde API PHP','2026-06-01 23:31:42','2026-06-19 21:17:11'),(387,9,4,5,180.00,17.00,0.00,30.00,0.00,0.00,0.00,0.00,227.00,'2026-05-31','PAGADO','Cobro generado desde API PHP','2026-06-01 23:31:42','2026-06-19 21:17:11'),(388,9,31,6,200.00,11.70,0.00,30.00,0.00,0.00,0.00,0.00,241.70,'2026-05-31','PAGADO','Cobro generado desde API PHP','2026-06-01 23:31:42','2026-06-19 21:20:46'),(389,9,6,9,180.00,10.30,0.00,30.00,0.00,0.00,0.00,0.00,220.30,'2026-05-31','PAGADO','Cobro generado desde API PHP','2026-06-01 23:31:42','2026-06-19 21:20:52'),(390,9,7,10,180.00,10.70,0.00,30.00,0.00,0.00,0.00,0.00,220.70,'2026-05-31','PAGADO','Cobro generado desde API PHP','2026-06-01 23:31:42','2026-06-19 21:20:59'),(391,9,5,13,360.00,11.00,0.00,30.00,0.00,0.00,0.00,0.00,401.00,'2026-05-31','PAGADO','Cobro generado desde API PHP','2026-06-01 23:31:42','2026-07-15 14:16:25'),(428,10,1,1,0.00,85.00,0.00,40.00,0.00,0.00,0.00,0.00,125.00,'2026-06-30','PAGADO','Cobro generado desde API PHP','2026-06-19 15:19:13','2026-07-15 14:09:07'),(429,10,2,2,180.00,11.10,0.00,40.00,0.00,0.00,0.00,0.00,231.10,'2026-06-30','PAGADO','Cobro generado desde API PHP','2026-06-19 15:19:13','2026-07-15 14:07:09'),(430,10,8,3,180.00,31.30,0.00,40.00,0.00,4.00,0.00,0.00,255.30,'2026-06-30','PENDIENTE','Cobro generado desde API PHP','2026-06-19 15:19:13','2026-07-15 14:07:20'),(431,10,3,4,180.00,29.20,0.00,45.00,0.00,0.00,0.00,0.00,254.20,'2026-06-30','PAGADO','Cobro generado desde API PHP','2026-06-19 15:19:13','2026-07-15 14:07:25'),(432,10,4,5,180.00,34.60,0.00,60.00,0.00,0.00,0.00,0.00,274.60,'2026-06-30','PAGADO','Cobro generado desde API PHP','2026-06-19 15:19:13','2026-07-15 14:07:32'),(433,10,31,6,200.00,11.20,0.00,30.00,0.00,0.00,0.00,0.00,241.20,'2026-06-30','PAGADO','Cobro generado desde API PHP','2026-06-19 15:19:13','2026-07-15 14:07:04'),(434,10,6,9,180.00,10.90,0.00,30.00,0.00,0.00,0.00,0.00,220.90,'2026-06-30','PAGADO','Cobro generado desde API PHP','2026-06-19 15:19:13','2026-07-15 14:07:41'),(435,10,7,10,180.00,10.60,0.00,40.00,0.00,0.00,0.00,0.00,230.60,'2026-06-30','PAGADO','Cobro generado desde API PHP','2026-06-19 15:19:13','2026-07-15 14:07:44'),(436,10,5,13,360.00,10.50,0.00,45.00,0.00,0.00,0.00,0.00,415.50,'2026-06-30','PENDIENTE','Cobro generado desde API PHP','2026-06-19 15:19:13','2026-07-15 14:16:20'),(461,11,1,1,0.00,86.70,0.00,40.00,0.00,0.00,0.00,0.00,126.70,'2026-07-31','PENDIENTE','Cobro generado desde API PHP','2026-07-19 20:51:22',NULL),(462,11,2,2,180.00,12.30,0.00,40.00,0.00,0.00,0.00,0.00,232.30,'2026-07-31','PENDIENTE','Cobro generado desde API PHP','2026-07-19 20:51:22',NULL),(463,11,3,4,180.00,51.80,0.00,45.00,0.00,0.00,0.00,0.00,276.80,'2026-07-31','PENDIENTE','Cobro generado desde API PHP','2026-07-19 20:51:22',NULL),(464,11,31,6,200.00,12.50,0.00,40.00,0.00,0.00,0.00,0.00,252.50,'2026-07-31','PENDIENTE','Cobro generado desde API PHP','2026-07-19 20:51:22',NULL),(465,11,6,9,180.00,11.80,0.00,30.00,0.00,0.00,0.00,0.00,221.80,'2026-07-31','PENDIENTE','Cobro generado desde API PHP','2026-07-19 20:51:22',NULL),(466,11,7,10,180.00,11.90,0.00,40.00,0.00,0.00,0.00,0.00,231.90,'2026-07-31','PENDIENTE','Cobro generado desde API PHP','2026-07-19 20:51:22',NULL),(467,11,33,12,600.00,39.70,0.00,45.00,0.00,0.00,0.00,0.00,684.70,'2026-07-31','PENDIENTE','Cobro generado desde API PHP','2026-07-19 20:51:22','2026-07-19 20:54:14'),(468,11,5,13,360.00,18.60,0.00,45.00,0.00,0.00,0.00,0.00,423.60,'2026-07-31','PENDIENTE','Cobro generado desde API PHP','2026-07-19 20:51:22',NULL);
/*!40000 ALTER TABLE `cobros_mensuales` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=944 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cobros_mensuales_detalle`
--

LOCK TABLES `cobros_mensuales_detalle` WRITE;
/*!40000 ALTER TABLE `cobros_mensuales_detalle` DISABLE KEYS */;
INSERT INTO `cobros_mensuales_detalle` VALUES (1,32,1,180.00,'Alquiler',10,'2026-03-22 23:02:10',NULL),(2,33,1,180.00,'Alquiler',10,'2026-03-22 23:02:10',NULL),(3,34,1,180.00,'Alquiler',10,'2026-03-22 23:02:10',NULL),(4,35,1,180.00,'Alquiler',10,'2026-03-22 23:02:10',NULL),(5,36,1,180.00,'Alquiler',10,'2026-03-22 23:02:10',NULL),(6,37,1,180.00,'Alquiler',10,'2026-03-22 23:02:10',NULL),(7,38,1,180.00,'Alquiler',10,'2026-03-22 23:02:10',NULL),(8,39,1,180.00,'Alquiler',10,'2026-03-22 23:02:10',NULL),(9,40,1,180.00,'Alquiler',10,'2026-03-22 23:02:10',NULL),(18,32,2,142.92,'Luz',20,'2026-03-22 23:02:10',NULL),(19,33,2,13.99,'Luz',20,'2026-03-22 23:02:10',NULL),(20,35,2,16.98,'Luz',20,'2026-03-22 23:02:10',NULL),(21,36,2,77.44,'Luz',20,'2026-03-22 23:02:10',NULL),(22,37,2,6.38,'Luz',20,'2026-03-22 23:02:10',NULL),(23,38,2,19.29,'Luz',20,'2026-03-22 23:02:10',NULL),(36,32,4,15.00,'Agua',40,'2026-03-22 23:02:10',NULL),(37,33,4,15.00,'Agua',40,'2026-03-22 23:02:10',NULL),(38,34,4,15.00,'Agua',40,'2026-03-22 23:02:10',NULL),(39,35,4,15.00,'Agua',40,'2026-03-22 23:02:10',NULL),(40,36,4,15.00,'Agua',40,'2026-03-22 23:02:10',NULL),(41,37,4,15.00,'Agua',40,'2026-03-22 23:02:10',NULL),(42,38,4,15.00,'Agua',40,'2026-03-22 23:02:10',NULL),(43,39,4,15.00,'Agua',40,'2026-03-22 23:02:10',NULL),(44,40,4,15.00,'Agua',40,'2026-03-22 23:02:10',NULL),(183,231,2,85.44,'Luz',20,'2026-03-23 12:50:11',NULL),(184,231,4,30.00,'Agua',40,'2026-03-23 12:50:11',NULL),(185,232,1,180.00,'Alquiler',10,'2026-03-23 12:50:11',NULL),(186,232,2,18.05,'Luz',20,'2026-03-23 12:50:11',NULL),(187,232,4,30.00,'Agua',40,'2026-03-23 12:50:11',NULL),(188,233,1,180.00,'Alquiler',10,'2026-03-23 12:50:11',NULL),(189,233,2,23.69,'Luz',20,'2026-03-23 12:50:11',NULL),(190,233,4,30.00,'Agua',40,'2026-03-23 12:50:11',NULL),(191,234,1,180.00,'Alquiler',10,'2026-03-23 12:50:11',NULL),(192,234,2,34.44,'Luz',20,'2026-03-23 12:50:11',NULL),(193,234,4,30.00,'Agua',40,'2026-03-23 12:50:11',NULL),(194,235,1,180.00,'Alquiler',10,'2026-03-23 12:50:11',NULL),(195,235,2,17.16,'Luz',20,'2026-03-23 12:50:11',NULL),(196,235,4,30.00,'Agua',40,'2026-03-23 12:50:11',NULL),(197,236,1,180.00,'Alquiler',10,'2026-03-23 12:50:11',NULL),(198,236,2,3.97,'Luz',20,'2026-03-23 12:50:11',NULL),(199,236,3,6.13,'Ajuste minimo luz',30,'2026-03-23 12:50:11',NULL),(200,236,4,30.00,'Agua',40,'2026-03-23 12:50:11',NULL),(201,237,1,180.00,'Alquiler',10,'2026-03-23 12:50:11',NULL),(202,237,2,11.39,'Luz',20,'2026-03-23 12:50:11',NULL),(203,237,4,30.00,'Agua',40,'2026-03-23 12:50:11',NULL),(204,238,1,700.00,'Alquiler',10,'2026-03-23 12:50:11',NULL),(205,238,2,16.51,'Luz',20,'2026-03-23 12:50:11',NULL),(206,238,4,30.00,'Agua',40,'2026-03-23 12:50:11',NULL),(207,239,1,360.00,'Alquiler',10,'2026-03-23 12:50:11','2026-06-19 16:08:15'),(208,239,2,2.56,'Luz',20,'2026-03-23 12:50:11',NULL),(209,239,3,7.54,'Ajuste minimo luz',30,'2026-03-23 12:50:11',NULL),(210,239,4,30.00,'Agua',40,'2026-03-23 12:50:11',NULL),(211,240,2,87.24,'Luz',20,'2026-03-24 10:45:04',NULL),(212,240,4,30.00,'Agua',40,'2026-03-24 10:45:04',NULL),(213,241,1,180.00,'Alquiler',10,'2026-03-24 10:45:04',NULL),(214,241,2,16.65,'Luz',20,'2026-03-24 10:45:04',NULL),(215,241,4,30.00,'Agua',40,'2026-03-24 10:45:04',NULL),(216,242,1,180.00,'Alquiler',10,'2026-03-24 10:45:04',NULL),(217,242,2,40.32,'Luz',20,'2026-03-24 10:45:04',NULL),(218,242,4,30.00,'Agua',40,'2026-03-24 10:45:04',NULL),(219,243,1,180.00,'Alquiler',10,'2026-03-24 10:45:04',NULL),(220,243,2,5.03,'Luz',20,'2026-03-24 10:45:04',NULL),(221,243,3,5.07,'Ajuste minimo luz',30,'2026-03-24 10:45:04',NULL),(222,243,4,30.00,'Agua',40,'2026-03-24 10:45:04',NULL),(223,244,1,180.00,'Alquiler',10,'2026-03-24 10:45:04',NULL),(224,244,2,58.44,'Luz',20,'2026-03-24 10:45:04',NULL),(225,244,4,30.00,'Agua',40,'2026-03-24 10:45:04',NULL),(226,245,1,180.00,'Alquiler',10,'2026-03-24 10:45:04',NULL),(227,245,2,2.09,'Luz',20,'2026-03-24 10:45:04',NULL),(228,245,3,8.01,'Ajuste minimo luz',30,'2026-03-24 10:45:04',NULL),(229,245,4,30.00,'Agua',40,'2026-03-24 10:45:04',NULL),(230,246,1,180.00,'Alquiler',10,'2026-03-24 10:45:04',NULL),(231,246,2,9.42,'Luz',20,'2026-03-24 10:45:04',NULL),(232,246,3,0.68,'Ajuste minimo luz',30,'2026-03-24 10:45:04',NULL),(233,246,4,30.00,'Agua',40,'2026-03-24 10:45:04',NULL),(234,247,1,700.00,'Alquiler',10,'2026-03-24 10:45:04',NULL),(235,247,2,17.80,'Luz',20,'2026-03-24 10:45:04',NULL),(236,247,4,30.00,'Agua',40,'2026-03-24 10:45:04',NULL),(237,248,1,180.00,'Alquiler',10,'2026-03-24 10:45:04',NULL),(238,248,2,4.71,'Luz',20,'2026-03-24 10:45:04',NULL),(239,248,3,5.39,'Ajuste minimo luz',30,'2026-03-24 10:45:04',NULL),(240,248,4,30.00,'Agua',40,'2026-03-24 10:45:04',NULL),(420,303,2,80.35,'Luz',20,'2026-04-17 19:56:42',NULL),(421,303,4,30.00,'Agua',40,'2026-04-17 19:56:42',NULL),(422,304,1,180.00,'Alquiler',10,'2026-04-17 19:56:42',NULL),(423,304,2,16.96,'Luz',20,'2026-04-17 19:56:42',NULL),(424,304,4,30.00,'Agua',40,'2026-04-17 19:56:42',NULL),(425,305,1,180.00,'Alquiler',10,'2026-04-17 19:56:42',NULL),(426,305,2,23.16,'Luz',20,'2026-04-17 19:56:42',NULL),(427,305,4,30.00,'Agua',40,'2026-04-17 19:56:42',NULL),(428,306,1,180.00,'Alquiler',10,'2026-04-17 19:56:42',NULL),(429,306,2,34.25,'Luz',20,'2026-04-17 19:56:42',NULL),(430,306,4,30.00,'Agua',40,'2026-04-17 19:56:42',NULL),(431,307,1,180.00,'Alquiler',10,'2026-04-17 19:56:42',NULL),(432,307,2,21.98,'Luz',20,'2026-04-17 19:56:42',NULL),(433,307,4,30.00,'Agua',40,'2026-04-17 19:56:42',NULL),(434,308,1,200.00,'Alquiler',10,'2026-04-17 19:56:42',NULL),(435,308,2,1.28,'Luz',20,'2026-04-17 19:56:42',NULL),(436,308,3,9.32,'Ajuste minimo luz',30,'2026-04-17 19:56:42',NULL),(437,308,4,30.00,'Agua',40,'2026-04-17 19:56:42',NULL),(438,309,1,180.00,'Alquiler',10,'2026-04-17 19:56:42',NULL),(439,309,2,5.22,'Luz',20,'2026-04-17 19:56:42',NULL),(440,309,3,5.38,'Ajuste minimo luz',30,'2026-04-17 19:56:42',NULL),(441,309,4,30.00,'Agua',40,'2026-04-17 19:56:42',NULL),(442,310,1,180.00,'Alquiler',10,'2026-04-17 19:56:42',NULL),(443,310,2,8.85,'Luz',20,'2026-04-17 19:56:42',NULL),(444,310,3,1.75,'Ajuste minimo luz',30,'2026-04-17 19:56:42',NULL),(445,310,4,30.00,'Agua',40,'2026-04-17 19:56:42',NULL),(446,311,1,360.00,'Alquiler',10,'2026-04-17 19:56:42','2026-06-19 16:08:15'),(447,311,2,8.64,'Luz',20,'2026-04-17 19:56:42',NULL),(448,311,3,1.96,'Ajuste minimo luz',30,'2026-04-17 19:56:42',NULL),(449,311,4,30.00,'Agua',40,'2026-04-17 19:56:42',NULL),(682,383,2,77.10,'Luz',20,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(683,383,4,30.00,'Agua',40,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(684,384,1,180.00,'Alquiler',10,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(685,384,2,17.00,'Luz',20,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(686,384,4,30.00,'Agua',40,'2026-06-01 23:31:42','2026-06-19 21:17:11'),(687,385,1,180.00,'Alquiler',10,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(688,385,2,25.90,'Luz',20,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(689,385,4,30.00,'Agua',40,'2026-06-01 23:31:42','2026-06-19 21:17:11'),(690,386,1,180.00,'Alquiler',10,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(691,386,2,45.00,'Luz',20,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(692,386,4,30.00,'Agua',40,'2026-06-01 23:31:42','2026-06-19 21:17:11'),(693,387,1,180.00,'Alquiler',10,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(694,387,2,17.00,'Luz',20,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(695,387,4,30.00,'Agua',40,'2026-06-01 23:31:42','2026-06-19 21:17:11'),(696,388,1,200.00,'Alquiler',10,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(697,388,2,11.70,'Luz',20,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(698,388,4,30.00,'Agua',40,'2026-06-01 23:31:42','2026-06-19 21:17:11'),(699,389,1,180.00,'Alquiler',10,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(700,389,2,10.30,'Luz',20,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(701,389,4,30.00,'Agua',40,'2026-06-01 23:31:42','2026-06-19 21:17:11'),(702,390,1,180.00,'Alquiler',10,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(703,390,2,10.70,'Luz',20,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(704,390,4,30.00,'Agua',40,'2026-06-01 23:31:42','2026-06-19 21:17:11'),(705,391,1,360.00,'Alquiler',10,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(706,391,2,11.00,'Luz',20,'2026-06-01 23:31:42','2026-06-19 16:02:49'),(707,391,4,30.00,'Agua',40,'2026-06-01 23:31:42','2026-06-19 21:17:11'),(812,428,2,85.00,'Luz',20,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(813,428,4,40.00,'Agua',40,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(814,429,1,180.00,'Alquiler',10,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(815,429,2,11.10,'Luz',20,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(816,429,4,40.00,'Agua',40,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(817,430,1,180.00,'Alquiler',10,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(818,430,2,31.30,'Luz',20,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(819,430,4,40.00,'Agua',40,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(820,431,1,180.00,'Alquiler',10,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(821,431,2,29.20,'Luz',20,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(822,431,4,45.00,'Agua',40,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(823,432,1,180.00,'Alquiler',10,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(824,432,2,34.60,'Luz',20,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(825,432,4,60.00,'Agua',40,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(826,433,1,200.00,'Alquiler',10,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(827,433,2,11.20,'Luz',20,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(828,433,4,30.00,'Agua',40,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(829,434,1,180.00,'Alquiler',10,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(830,434,2,10.90,'Luz',20,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(831,434,4,30.00,'Agua',40,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(832,435,1,180.00,'Alquiler',10,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(833,435,2,10.60,'Luz',20,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(834,435,4,40.00,'Agua',40,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(835,436,1,360.00,'Alquiler',10,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(836,436,2,10.50,'Luz',20,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(837,436,4,45.00,'Agua',40,'2026-06-19 15:19:13','2026-06-25 18:50:41'),(838,385,3,0.20,'Ajuste minimo luz',30,'2026-06-19 21:25:54',NULL),(839,430,6,4.00,'Otros conceptos',60,'2026-06-19 21:47:49','2026-06-25 18:50:41'),(909,461,2,86.70,'Luz',20,'2026-07-19 20:51:22',NULL),(910,461,4,40.00,'Agua',40,'2026-07-19 20:51:22',NULL),(911,462,1,180.00,'Alquiler',10,'2026-07-19 20:51:22',NULL),(912,462,2,12.30,'Luz',20,'2026-07-19 20:51:22',NULL),(913,462,4,40.00,'Agua',40,'2026-07-19 20:51:22',NULL),(914,463,1,180.00,'Alquiler',10,'2026-07-19 20:51:22',NULL),(915,463,2,51.80,'Luz',20,'2026-07-19 20:51:22',NULL),(916,463,4,45.00,'Agua',40,'2026-07-19 20:51:22',NULL),(917,464,1,200.00,'Alquiler',10,'2026-07-19 20:51:22',NULL),(918,464,2,12.50,'Luz',20,'2026-07-19 20:51:22',NULL),(919,464,4,40.00,'Agua',40,'2026-07-19 20:51:22',NULL),(920,465,1,180.00,'Alquiler',10,'2026-07-19 20:51:22',NULL),(921,465,2,11.80,'Luz',20,'2026-07-19 20:51:22',NULL),(922,465,4,30.00,'Agua',40,'2026-07-19 20:51:22',NULL),(923,466,1,180.00,'Alquiler',10,'2026-07-19 20:51:22',NULL),(924,466,2,11.90,'Luz',20,'2026-07-19 20:51:22',NULL),(925,466,4,40.00,'Agua',40,'2026-07-19 20:51:22',NULL),(926,467,1,600.00,'Alquiler',10,'2026-07-19 20:51:22','2026-07-19 20:54:14'),(927,467,2,39.70,'Luz',20,'2026-07-19 20:51:22',NULL),(928,467,4,45.00,'Agua',40,'2026-07-19 20:51:22',NULL),(929,468,1,360.00,'Alquiler',10,'2026-07-19 20:51:22',NULL),(930,468,2,18.60,'Luz',20,'2026-07-19 20:51:22',NULL),(931,468,4,45.00,'Agua',40,'2026-07-19 20:51:22',NULL);
/*!40000 ALTER TABLE `cobros_mensuales_detalle` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `cobros_overrides_servicio`
--

LOCK TABLES `cobros_overrides_servicio` WRITE;
/*!40000 ALTER TABLE `cobros_overrides_servicio` DISABLE KEYS */;
INSERT INTO `cobros_overrides_servicio` VALUES (1,9,1,1,'AGUA',30.00,NULL,'2026-06-18 11:23:01','2026-06-18 11:23:37'),(2,9,1,1,'GAS',0.00,NULL,'2026-06-18 11:23:01','2026-06-18 11:23:37'),(3,9,1,1,'MANTENIMIENTO',0.00,NULL,'2026-06-18 11:23:01','2026-06-18 11:23:37'),(10,10,5,4,'AGUA',60.00,NULL,'2026-06-18 12:09:11',NULL),(11,10,5,4,'GAS',0.00,NULL,'2026-06-18 12:09:11',NULL),(12,10,5,4,'MANTENIMIENTO',0.00,NULL,'2026-06-18 12:09:11',NULL),(13,10,4,3,'AGUA',45.00,NULL,'2026-06-19 15:17:53','2026-06-19 15:18:40'),(14,10,4,3,'GAS',0.00,NULL,'2026-06-19 15:17:53','2026-06-19 15:18:40'),(15,10,4,3,'MANTENIMIENTO',0.00,NULL,'2026-06-19 15:17:53','2026-06-19 15:18:40'),(22,10,6,31,'AGUA',30.00,NULL,'2026-06-19 15:19:00',NULL),(23,10,6,31,'MANTENIMIENTO',0.00,NULL,'2026-06-19 15:19:00',NULL),(24,10,6,31,'GAS',0.00,NULL,'2026-06-19 15:19:00',NULL),(25,10,9,6,'GAS',0.00,NULL,'2026-06-19 15:19:40',NULL),(26,10,9,6,'MANTENIMIENTO',0.00,NULL,'2026-06-19 15:19:40',NULL),(27,10,9,6,'AGUA',30.00,NULL,'2026-06-19 15:19:40',NULL),(31,10,3,8,'AGUA',40.00,NULL,'2026-06-19 21:28:43','2026-06-19 21:40:24'),(32,10,3,8,'MANTENIMIENTO',4.00,NULL,'2026-06-19 21:28:43','2026-06-19 21:40:24'),(33,10,3,8,'GAS',0.00,NULL,'2026-06-19 21:28:43','2026-06-19 21:40:24'),(40,10,1,1,'AGUA',40.00,NULL,'2026-06-19 21:48:10',NULL),(41,10,1,1,'GAS',0.00,NULL,'2026-06-19 21:48:10',NULL),(42,10,1,1,'MANTENIMIENTO',0.00,NULL,'2026-06-19 21:48:10',NULL),(43,10,10,7,'AGUA',40.00,NULL,'2026-06-19 21:48:41',NULL),(44,10,10,7,'MANTENIMIENTO',0.00,NULL,'2026-06-19 21:48:41',NULL),(45,10,10,7,'GAS',0.00,NULL,'2026-06-19 21:48:41',NULL),(46,10,13,5,'AGUA',45.00,NULL,'2026-06-19 21:48:54',NULL),(47,10,13,5,'MANTENIMIENTO',0.00,NULL,'2026-06-19 21:48:54',NULL),(48,10,13,5,'GAS',0.00,NULL,'2026-06-19 21:48:54',NULL),(49,11,5,4,'AGUA',60.00,'Carry-over automático desde periodo anterior','2026-07-19 19:52:38','2026-07-19 20:51:22'),(50,11,4,3,'AGUA',45.00,'Carry-over automático desde periodo anterior','2026-07-19 19:52:38','2026-07-19 20:51:22'),(51,11,13,5,'AGUA',45.00,'Carry-over automático desde periodo anterior','2026-07-19 19:52:38','2026-07-19 20:51:22'),(52,11,9,6,'AGUA',30.00,NULL,'2026-07-19 20:49:25',NULL),(53,11,9,6,'GAS',0.00,NULL,'2026-07-19 20:49:25',NULL),(54,11,9,6,'MANTENIMIENTO',0.00,NULL,'2026-07-19 20:49:25',NULL),(61,11,12,33,'AGUA',45.00,NULL,'2026-07-19 20:51:18',NULL),(62,11,12,33,'GAS',0.00,NULL,'2026-07-19 20:51:18',NULL),(63,11,12,33,'MANTENIMIENTO',0.00,NULL,'2026-07-19 20:51:18',NULL);
/*!40000 ALTER TABLE `cobros_overrides_servicio` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `conceptos_cobro`
--

LOCK TABLES `conceptos_cobro` WRITE;
/*!40000 ALTER TABLE `conceptos_cobro` DISABLE KEYS */;
INSERT INTO `conceptos_cobro` VALUES (1,'ALQUILER','Alquiler',10,1,1,'2026-03-23 02:46:13',NULL),(2,'LUZ','Luz',20,1,1,'2026-03-23 02:46:13',NULL),(3,'AJUSTE_MINIMO_LUZ','Ajuste minimo luz',30,1,1,'2026-03-23 02:46:13',NULL),(4,'AGUA','Agua',40,1,1,'2026-03-23 02:46:13',NULL),(5,'GAS','Gas',50,1,1,'2026-03-23 02:46:13',NULL),(6,'OTROS','Otros conceptos',50,1,1,'2026-03-23 02:46:13','2026-04-17 19:46:51'),(7,'MORA','Mora',70,1,1,'2026-03-23 02:46:13',NULL),(8,'DESCUENTO','Descuento',999,0,1,'2026-03-23 02:46:13',NULL);
/*!40000 ALTER TABLE `conceptos_cobro` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `config_cobranza`
--

LOCK TABLES `config_cobranza` WRITE;
/*!40000 ALTER TABLE `config_cobranza` DISABLE KEYS */;
INSERT INTO `config_cobranza` VALUES (1,1,10.00,13.50,'Noelia Buj*','998083973','uploads/qr/qr-20260323094445-c72d0289.jpg','BCP','Noelia D. Bujaico R.','19176632954022','00219117663295402258','Hola, te comparto tu resumen del mes.','2026-05-18 06:51:06','2026-03-23 00:10:35');
/*!40000 ALTER TABLE `config_cobranza` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `inmuebles`
--

LOCK TABLES `inmuebles` WRITE;
/*!40000 ALTER TABLE `inmuebles` DISABLE KEYS */;
INSERT INTO `inmuebles` VALUES (1,'INM001','Casa Principal Bujaico','Dirección por completar - Lima, Perú','Inmueble de alquiler con primer y segundo piso',2,'ACTIVO','2026-03-22 19:53:38',NULL);
/*!40000 ALTER TABLE `inmuebles` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecturas_unidad`
--

LOCK TABLES `lecturas_unidad` WRITE;
/*!40000 ALTER TABLE `lecturas_unidad` DISABLE KEYS */;
INSERT INTO `lecturas_unidad` VALUES (1,1,1,1,16312.40,16409.60,'2026-03-15','Primer piso','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(2,1,2,2,620.90,641.40,'2026-03-15','1A','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(3,1,3,3,534.40,561.30,'2026-03-15','2A','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(4,1,4,4,822.70,861.80,'2026-03-15','3A','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(5,1,5,5,1816.90,1836.40,'2026-03-15','4A','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(6,1,6,NULL,46.40,46.40,'2026-03-15','5A','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(7,1,7,NULL,52.10,52.10,'2026-03-15','1B normalizado para evitar negativo','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(8,1,8,NULL,452.00,452.00,'2026-03-15','2B auxiliar','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(9,1,9,9,339.90,344.40,'2026-03-15','3B auxiliar','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(10,1,10,10,264.30,277.20,'2026-03-15','4B auxiliar','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(11,1,11,NULL,6.70,6.70,'2026-03-15','Segundo piso general - lectura anterior por definir','REGISTRADO','2026-03-22 19:53:38','2026-04-17 14:03:39'),(12,2,1,1,16207.20,16312.40,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(13,2,2,2,610.60,620.90,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(14,2,3,3,534.40,534.40,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(15,2,4,4,810.20,822.70,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(16,2,5,5,1759.90,1816.90,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(17,2,6,NULL,46.40,46.40,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(18,2,7,NULL,52.10,52.10,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(19,2,8,NULL,451.90,452.00,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(20,2,9,9,335.20,339.90,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(21,2,10,10,250.10,264.30,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(22,2,11,NULL,6.70,6.70,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20','2026-03-22 23:47:18'),(23,2,12,NULL,135.20,177.20,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20','2026-03-22 23:47:05'),(24,2,13,11,58.90,58.90,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(25,2,14,12,0.00,0.00,'2026-02-28',NULL,'REGISTRADO','2026-03-22 22:49:20',NULL),(26,1,12,30,177.20,195.90,'2026-03-31',NULL,'REGISTRADO','2026-03-22 23:00:28','2026-04-17 14:03:39'),(27,1,13,11,58.90,61.80,'2026-03-31',NULL,'REGISTRADO','2026-03-22 23:00:28','2026-04-17 14:03:39'),(28,1,14,12,0.00,0.00,'2026-03-31',NULL,'REGISTRADO','2026-03-22 23:00:28','2026-04-17 14:03:39'),(33,6,1,1,16089.90,16207.20,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(34,6,2,2,588.30,610.60,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(35,6,3,33,480.30,534.40,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(36,6,4,32,803.50,810.20,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(37,6,5,5,1681.40,1759.90,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(40,6,8,NULL,451.90,451.90,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(41,6,9,36,332.40,335.20,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:32:55'),(42,6,10,35,237.50,250.10,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:32:55'),(43,6,11,NULL,6.70,6.70,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(44,6,12,30,111.30,135.20,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(45,6,13,34,52.60,58.90,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(46,6,14,NULL,0.00,0.00,'2026-01-31','MES DE ENERO','REGISTRADO','2026-03-24 08:34:11','2026-03-24 10:14:54'),(74,6,6,NULL,46.40,46.40,'2026-01-14',NULL,'REGISTRADO','2026-03-24 10:14:54',NULL),(75,6,7,NULL,52.10,52.10,'2026-01-14',NULL,'REGISTRADO','2026-03-24 10:14:54',NULL),(76,8,1,1,16409.60,16518.90,'2026-04-30','MES DE MAYO','REGISTRADO','2026-04-17 14:15:29','2026-05-18 05:46:15'),(77,8,2,2,641.40,664.40,'2026-04-30','MES DE MAYO','REGISTRADO','2026-04-17 14:15:29','2026-05-18 05:46:17'),(78,8,3,3,561.30,592.80,'2026-04-30','MES DE MAYO','REGISTRADO','2026-04-17 14:15:29','2026-05-18 05:46:18'),(79,8,4,4,861.80,908.40,'2026-04-30','MES DE MAYO','REGISTRADO','2026-04-17 14:15:29','2026-05-18 05:46:19'),(80,8,5,5,1836.40,1866.20,'2026-04-30','MES DE MAYO','REGISTRADO','2026-04-17 14:15:29','2026-05-18 05:46:20'),(81,8,6,37,46.40,46.40,'2026-04-30','MES DE MAYO','REGISTRADO','2026-04-17 14:15:29','2026-05-18 05:46:20'),(82,8,7,NULL,52.10,52.10,'2026-04-30','MES DE MAYO','REGISTRADO','2026-04-17 14:15:29','2026-05-18 05:46:21'),(83,8,8,NULL,452.00,452.00,'2026-04-30','MES DE MAYO','REGISTRADO','2026-04-17 14:15:29','2026-05-18 05:46:24'),(84,8,9,9,344.40,351.40,'2026-04-30',NULL,'REGISTRADO','2026-04-17 14:15:29','2026-05-15 15:10:39'),(85,8,10,10,277.20,289.20,'2026-04-30',NULL,'REGISTRADO','2026-04-17 14:15:29','2026-05-15 15:10:39'),(86,8,11,NULL,6.70,6.70,'2026-04-30',NULL,'REGISTRADO','2026-04-17 14:15:29','2026-05-15 15:10:39'),(87,8,12,NULL,195.90,195.90,'2026-04-30',NULL,'REGISTRADO','2026-04-17 14:15:29','2026-05-15 15:10:39'),(88,8,13,11,61.80,73.50,'2026-04-30',NULL,'REGISTRADO','2026-04-17 14:15:29','2026-05-15 15:10:39'),(89,8,14,12,0.00,0.00,'2026-04-30',NULL,'REGISTRADO','2026-04-17 14:15:29','2026-05-15 15:10:39'),(90,9,1,1,16518.90,16616.70,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(91,9,2,38,664.40,679.20,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(92,9,3,3,592.80,625.60,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(93,9,4,4,908.40,965.50,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(94,9,5,39,1866.20,1887.70,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(95,9,6,37,46.40,54.70,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(96,9,7,NULL,52.10,52.10,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(97,9,8,NULL,452.00,452.00,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(98,9,9,9,351.40,356.40,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(99,9,10,10,289.20,294.70,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(100,9,11,NULL,6.70,6.70,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(101,9,12,NULL,195.90,195.90,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(102,9,13,11,73.50,86.00,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-06-18 11:46:24'),(103,9,14,12,0.00,0.00,'2026-05-15',NULL,'REGISTRADO','2026-05-18 05:25:11','2026-05-18 06:22:39'),(104,10,1,1,16616.70,16728.70,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:03','2026-06-25 18:14:02'),(105,10,2,38,679.20,689.80,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:03','2026-06-25 18:14:02'),(106,10,3,3,625.60,666.70,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:03','2026-06-25 18:14:02'),(107,10,4,4,965.50,1003.80,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:03','2026-06-25 18:14:02'),(108,10,5,39,1887.70,1932.20,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:03','2026-07-15 16:14:46'),(109,10,6,37,54.70,61.40,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:03','2026-06-25 18:14:02'),(110,10,7,NULL,52.10,52.10,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:03','2026-06-25 18:14:02'),(111,10,8,NULL,452.00,452.00,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:04','2026-06-25 18:14:02'),(112,10,9,9,356.40,361.40,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:04','2026-06-25 18:14:02'),(113,10,10,10,294.70,297.90,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:04','2026-06-25 18:14:02'),(114,10,11,NULL,6.70,6.70,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:04','2026-06-25 18:14:02'),(115,10,12,40,195.90,195.90,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:04','2026-06-25 18:14:02'),(116,10,13,11,86.00,99.70,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:04','2026-06-25 18:14:02'),(117,10,14,12,0.00,0.00,'2026-06-15',NULL,'REGISTRADO','2026-06-18 11:57:04','2026-06-25 18:14:02'),(118,11,1,1,16728.70,16818.30,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-21 22:55:29'),(119,11,2,38,689.80,702.50,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(120,11,3,3,666.70,666.70,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(121,11,4,41,1003.80,1057.40,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(122,11,5,39,1932.20,1931.30,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(123,11,6,37,61.40,68.00,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(124,11,7,NULL,52.10,52.10,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(125,11,8,NULL,452.00,452.00,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(126,11,9,9,361.40,366.30,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(127,11,10,10,297.90,301.80,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(128,11,11,NULL,6.70,6.70,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(129,11,12,40,195.90,236.90,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(130,11,13,11,99.70,118.80,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50'),(131,11,14,12,0.00,0.00,'2026-07-15',NULL,'REGISTRADO','2026-07-15 14:29:33','2026-07-22 03:54:50');
/*!40000 ALTER TABLE `lecturas_unidad` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=878 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liquidacion_luz_detalle`
--

LOCK TABLES `liquidacion_luz_detalle` WRITE;
/*!40000 ALTER TABLE `liquidacion_luz_detalle` DISABLE KEYS */;
INSERT INTO `liquidacion_luz_detalle` VALUES (39,2,1,1,1,12,2,105.20,0.515939,142.92,0.00,0.00,142.92,'GENERADO','Generado desde API PHP','2026-03-22 23:02:10'),(40,2,1,2,2,13,2,10.30,0.050515,13.99,0.00,0.00,13.99,'GENERADO','Generado desde API PHP','2026-03-22 23:02:10'),(41,2,1,3,8,14,2,0.00,0.000000,0.00,0.00,0.00,0.00,'GENERADO','Generado desde API PHP','2026-03-22 23:02:10'),(42,2,1,4,3,15,2,12.50,0.061305,16.98,0.00,0.00,16.98,'GENERADO','Generado desde API PHP','2026-03-22 23:02:10'),(43,2,1,5,4,16,2,57.00,0.279549,77.44,0.00,0.00,77.44,'GENERADO','Generado desde API PHP','2026-03-22 23:02:10'),(44,2,1,9,6,20,2,4.70,0.023051,6.38,0.00,0.00,6.38,'GENERADO','Generado desde API PHP','2026-03-22 23:02:10'),(45,2,1,10,7,21,2,14.20,0.069642,19.29,0.00,0.00,19.29,'GENERADO','Generado desde API PHP','2026-03-22 23:02:10'),(46,2,1,13,5,24,2,0.00,0.000000,0.00,0.00,0.00,0.00,'GENERADO','Generado desde API PHP','2026-03-22 23:02:10'),(47,2,1,14,5,25,2,0.00,0.000000,0.00,0.00,0.00,0.00,'GENERADO','Generado desde API PHP','2026-03-22 23:02:10'),(304,1,1,1,1,1,1,97.20,0.401321,66.70,18.74,0.00,85.44,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 08:56:23'),(305,1,1,2,2,2,1,20.50,0.084641,14.10,3.95,0.00,18.05,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 08:56:23'),(306,1,1,3,8,3,1,26.90,0.111065,18.50,5.19,0.00,23.69,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 08:56:23'),(307,1,1,4,3,4,1,39.10,0.161437,26.90,7.54,0.00,34.44,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 08:56:23'),(308,1,1,5,4,5,1,19.50,0.080512,13.40,3.76,0.00,17.16,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 08:56:23'),(309,1,1,9,6,9,1,4.50,0.018580,3.10,0.87,0.00,3.97,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 08:56:23'),(310,1,1,10,7,10,1,12.90,0.053262,8.90,2.49,0.00,11.39,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 08:56:23'),(311,1,1,12,5,26,1,18.70,0.077209,12.90,3.61,0.00,16.51,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 08:56:23'),(312,1,1,13,5,27,1,2.90,0.011974,2.00,0.56,0.00,2.56,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 08:56:23'),(313,6,1,1,1,33,5,117.30,0.361479,83.30,3.94,0.00,87.24,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 10:44:24'),(314,6,1,2,2,34,5,22.30,0.068721,15.90,0.75,0.00,16.65,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 10:44:24'),(315,6,1,3,8,35,5,54.10,0.166718,38.50,1.82,0.00,40.32,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 10:44:24'),(316,6,1,4,28,36,5,6.70,0.020647,4.80,0.23,0.00,5.03,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 10:44:24'),(317,6,1,5,4,37,5,78.50,0.241911,55.80,2.64,0.00,58.44,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 10:44:24'),(318,6,1,9,6,41,5,2.80,0.008629,2.00,0.09,0.00,2.09,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 10:44:24'),(319,6,1,10,7,42,5,12.60,0.038829,9.00,0.42,0.00,9.42,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 10:44:24'),(320,6,1,12,5,44,5,23.90,0.073652,17.00,0.80,0.00,17.80,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 10:44:24'),(321,6,1,13,30,45,5,6.30,0.019414,4.50,0.21,0.00,4.71,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-03-24 10:44:24'),(439,8,1,1,1,76,6,109.30,0.403470,75.30,5.57,0.00,80.87,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-05-15 15:07:48'),(440,8,1,2,2,77,6,23.00,0.084902,15.90,1.17,0.00,17.07,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-05-15 15:07:48'),(441,8,1,3,8,78,6,31.50,0.116279,21.70,1.60,0.00,23.30,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-05-15 15:07:48'),(442,8,1,4,3,79,6,46.60,0.172019,32.10,2.37,0.00,34.47,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-05-15 15:07:48'),(443,8,1,5,4,80,6,29.80,0.110004,20.60,1.52,0.00,22.12,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-05-15 15:07:48'),(444,8,1,9,6,84,6,7.00,0.025840,4.90,0.36,0.00,5.26,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-05-15 15:07:48'),(445,8,1,10,7,85,6,12.00,0.044297,8.30,0.61,0.00,8.91,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-05-15 15:07:48'),(446,8,1,13,5,88,6,11.70,0.043189,8.10,0.60,0.00,8.70,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-05-15 15:07:48'),(662,9,1,1,1,90,7,97.80,0.383079,69.00,8.04,-0.04,77.10,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-18 11:46:24'),(663,9,1,2,2,91,7,14.80,0.057971,10.50,1.22,5.28,17.00,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-18 11:46:24'),(664,9,1,3,8,92,7,32.80,0.128476,23.20,2.70,0.00,25.90,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-18 11:46:24'),(665,9,1,4,3,93,7,57.10,0.223658,40.30,4.70,0.00,45.00,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-18 11:46:24'),(666,9,1,5,4,94,7,21.50,0.084215,15.20,1.77,0.03,17.00,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-18 11:46:24'),(667,9,1,6,31,95,7,8.30,0.032511,5.90,0.68,5.02,11.70,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-18 11:46:24'),(668,9,1,9,6,98,7,5.00,0.019585,3.60,0.41,6.19,10.30,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-18 11:46:24'),(669,9,1,10,7,99,7,5.50,0.021543,3.90,0.45,6.25,10.70,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-18 11:46:24'),(670,9,1,13,5,102,7,12.50,0.048962,8.90,1.03,1.07,11.00,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-18 11:46:24'),(797,10,1,1,1,104,8,112.00,0.427155,81.10,3.82,0.00,85.00,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-25 18:50:34'),(798,10,1,2,2,105,8,10.60,0.040427,7.70,0.36,3.00,11.10,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-25 18:50:34'),(799,10,1,3,8,106,8,41.10,0.156751,29.80,1.40,0.00,31.30,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-25 18:50:34'),(800,10,1,4,3,107,8,38.30,0.146072,27.80,1.31,0.00,29.20,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-25 18:50:34'),(801,10,1,5,4,108,8,43.60,0.120519,31.60,1.08,1.90,34.60,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-25 18:50:34'),(802,10,1,6,31,109,8,6.70,0.025553,4.90,0.23,6.00,11.20,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-25 18:50:34'),(803,10,1,9,6,112,8,5.00,0.019069,3.70,0.17,7.00,10.90,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-25 18:50:34'),(804,10,1,10,7,113,8,3.20,0.012204,2.40,0.11,8.00,10.60,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-25 18:50:34'),(805,10,1,13,5,116,8,13.70,0.052250,10.00,0.47,0.00,10.50,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-06-25 18:50:34'),(870,11,1,1,1,118,9,89.60,0.387208,64.90,21.72,0.00,86.70,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-07-19 20:51:22'),(871,11,1,2,2,119,9,12.70,0.054883,9.20,3.08,0.00,12.30,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-07-19 20:51:22'),(872,11,1,4,3,121,9,53.60,0.231634,38.80,12.99,0.00,51.80,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-07-19 20:51:22'),(873,11,1,6,31,123,9,6.60,0.028522,4.80,1.60,6.00,12.50,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-07-19 20:51:22'),(874,11,1,9,6,126,9,4.90,0.021175,3.60,1.19,7.00,11.80,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-07-19 20:51:22'),(875,11,1,10,7,127,9,3.90,0.016854,2.90,0.95,8.00,11.90,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-07-19 20:51:22'),(876,11,1,12,33,129,9,41.00,0.177182,29.70,9.94,0.00,39.70,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-07-19 20:51:22'),(877,11,1,13,5,130,9,19.10,0.082541,13.90,4.63,0.00,18.60,'GENERADO','Generado desde API PHP (formula Excel v2)','2026-07-19 20:51:22');
/*!40000 ALTER TABLE `liquidacion_luz_detalle` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_07_22_031813_create_modules_table',2),(5,'2026_07_22_031814_create_payment_gateway_transactions_table',2),(6,'2026_07_22_031815_add_activa_flag_constraint_to_ocupacion_unidad_table',2),(7,'2026_07_22_031949_create_permission_tables',3);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `model_has_permissions`
--

LOCK TABLES `model_has_permissions` WRITE;
/*!40000 ALTER TABLE `model_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `model_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `model_has_roles`
--

LOCK TABLES `model_has_roles` WRITE;
/*!40000 ALTER TABLE `model_has_roles` DISABLE KEYS */;
INSERT INTO `model_has_roles` VALUES (1,'App\\Models\\User',1);
/*!40000 ALTER TABLE `model_has_roles` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES (1,'dashboard','Dashboard',NULL,10,'2026-07-21 21:34:21',NULL),(2,'periodos','Periodos',NULL,20,'2026-07-21 21:34:21',NULL),(3,'inquilinos','Inquilinos',NULL,30,'2026-07-21 21:34:21',NULL),(4,'unidades','Unidades',NULL,40,'2026-07-21 21:34:21',NULL),(5,'ocupaciones','Ocupaciones',NULL,50,'2026-07-21 21:34:21',NULL),(6,'recibo','Recibo de luz',NULL,60,'2026-07-21 21:34:21',NULL),(7,'lecturas','Lecturas',NULL,70,'2026-07-21 21:34:21',NULL),(8,'liquidacion','Liquidaci├│n',NULL,80,'2026-07-21 21:34:21',NULL),(9,'cobros','Cobros',NULL,90,'2026-07-21 21:34:21',NULL),(10,'avisos','Avisos',NULL,110,'2026-07-21 21:34:21',NULL),(11,'tarifas','Tarifas',NULL,120,'2026-07-21 21:34:21',NULL),(12,'config_cobranza','Config. cobranza',NULL,130,'2026-07-21 21:34:21',NULL),(13,'usuarios','Usuarios',NULL,140,'2026-07-21 21:34:21',NULL),(14,'cobros.pagos','Pagos',9,100,'2026-07-21 21:34:21',NULL);
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

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
  `activa_flag` tinyint(4) GENERATED ALWAYS AS (if(`estado` = 'ACTIVO',`id_unidad`,NULL)) STORED,
  PRIMARY KEY (`id_ocupacion`),
  UNIQUE KEY `uq_ocupacion_unidad_activa` (`id_unidad`,`activa_flag`),
  KEY `idx_ocupacion_unidad` (`id_unidad`),
  KEY `idx_ocupacion_persona` (`id_persona`),
  KEY `idx_ocupacion_estado` (`estado`),
  KEY `idx_ocupacion_fechas` (`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `fk_ocupacion_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`),
  CONSTRAINT `fk_ocupacion_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ocupacion_unidad`
--

LOCK TABLES `ocupacion_unidad` WRITE;
/*!40000 ALTER TABLE `ocupacion_unidad` DISABLE KEYS */;
INSERT INTO `ocupacion_unidad` VALUES (1,1,1,'2025-01-01',NULL,0.00,0.00,'ACTIVO','Ocupante primer piso','2026-03-22 19:53:38','2026-03-24 09:23:31',1),(2,2,2,'2025-11-12','2026-04-12',180.00,180.00,'FINALIZADO','Milena','2026-03-22 19:53:38','2026-05-18 06:09:35',NULL),(3,3,8,'2026-03-10','2026-06-18',180.00,180.00,'FINALIZADO','Chamo Nuevo','2026-03-22 19:53:38','2026-06-18 11:51:20',NULL),(4,4,3,'2026-01-15','2026-07-15',180.00,180.00,'FINALIZADO','Luis Quispe','2026-03-22 19:53:38','2026-07-15 14:27:39',NULL),(5,5,4,'2025-10-26','2026-04-26',180.00,180.00,'FINALIZADO','Juan dios','2026-03-22 19:53:38','2026-05-18 06:12:43',NULL),(9,9,6,'2026-02-07','2026-08-07',180.00,180.00,'ACTIVO','Jose Luis','2026-03-22 22:25:24',NULL,9),(10,10,7,'2026-03-22','2026-09-22',180.00,180.00,'ACTIVO','Richard Uribe','2026-03-22 22:27:54','2026-03-24 10:27:17',10),(11,13,5,'2026-03-22',NULL,360.00,180.00,'ACTIVO',NULL,'2026-03-22 22:28:40','2026-06-19 15:55:21',13),(12,14,5,'2026-03-22',NULL,360.00,180.00,'ACTIVO',NULL,'2026-03-22 22:28:59','2026-06-19 15:20:29',14),(30,12,5,'2026-01-01','2026-03-24',700.00,700.00,'FINALIZADO',NULL,'2026-03-23 12:29:08','2026-04-17 17:21:33',NULL),(32,4,28,'2026-01-01','2026-01-14',180.00,180.00,'FINALIZADO',NULL,'2026-03-24 09:30:32','2026-03-24 09:31:01',NULL),(33,3,8,'2026-01-01','2026-01-14',180.00,180.00,'FINALIZADO',NULL,'2026-03-24 09:32:33',NULL,NULL),(34,13,30,'2026-01-01','2026-03-14',180.00,180.00,'FINALIZADO',NULL,'2026-03-24 09:49:06',NULL,NULL),(35,10,7,'2026-01-01','2026-03-22',180.00,180.00,'FINALIZADO','Richard Uribe Antiguo Contrato','2026-03-24 10:30:09',NULL,NULL),(36,9,6,'2026-01-01','2026-02-06',180.00,0.00,'FINALIZADO','Historico enero 2026','2026-03-24 10:32:55',NULL,NULL),(37,6,31,'2026-04-07',NULL,200.00,200.00,'ACTIVO',NULL,'2026-04-17 17:14:54','2026-04-17 18:33:43',6),(38,2,2,'2026-04-12','2026-10-12',180.00,180.00,'ACTIVO','Renovacion','2026-05-18 06:10:45',NULL,2),(39,5,4,'2026-04-26','2026-07-15',180.00,180.00,'FINALIZADO','Renovacion','2026-05-18 06:13:20','2026-07-15 14:24:52',NULL),(40,12,33,'2026-06-15','2026-12-15',600.00,700.00,'ACTIVO',NULL,'2026-06-18 07:28:48','2026-07-19 20:54:14',12),(41,4,3,'2026-07-15',NULL,180.00,180.00,'ACTIVO',NULL,'2026-07-15 14:28:12',NULL,4);
/*!40000 ALTER TABLE `ocupacion_unidad` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (14,243,'2026-04-18',220.10,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI','2026-04-18 00:00:00','Anulación desde Cobros UI','2026-04-17 19:23:48','2026-04-17 19:24:14'),(15,241,'2026-04-18',226.65,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:25:33',NULL),(16,247,'2026-04-18',747.80,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:25:47',NULL),(17,242,'2026-04-18',250.32,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:26:05',NULL),(18,244,'2026-04-18',268.44,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:26:45',NULL),(19,246,'2026-04-18',220.10,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:26:53',NULL),(20,245,'2026-04-18',220.10,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:27:01',NULL),(21,248,'2026-04-18',220.10,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:27:22',NULL),(22,243,'2026-04-18',177.40,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:28:03',NULL),(23,33,'2026-04-18',208.99,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:28:39',NULL),(24,38,'2026-04-18',214.29,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:28:50',NULL),(25,35,'2026-04-18',211.98,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI','2026-04-18 00:00:00','Anulación desde Cobros UI','2026-04-17 19:29:01','2026-04-17 19:29:29'),(26,35,'2026-04-18',211.58,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:29:54',NULL),(27,36,'2026-04-18',272.44,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI','2026-04-18 00:00:00','Anulación desde Cobros UI','2026-04-17 19:30:19','2026-04-17 19:30:23'),(28,36,'2026-04-18',272.44,'YAPE','YAPE-0000000',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:30:53',NULL),(29,37,'2026-04-18',201.38,'YAPE','YAPE-00000',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:31:23',NULL),(30,39,'2026-04-18',195.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:32:53',NULL),(31,40,'2026-04-18',195.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:32:58',NULL),(32,34,'2026-04-18',195.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:33:36',NULL),(33,238,'2026-04-18',746.51,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:34:07',NULL),(34,239,'2026-04-18',220.10,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:34:12',NULL),(35,232,'2026-04-18',228.05,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:34:35',NULL),(36,233,'2026-04-18',233.69,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI','2026-04-18 00:00:00','Anulación desde Cobros UI','2026-04-17 19:34:49','2026-04-17 19:35:04'),(37,235,'2026-04-18',227.16,'YAPE','YAPE-000000',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:35:37',NULL),(38,236,'2026-04-18',220.10,'YAPE','YAPE-000000',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:36:05',NULL),(39,237,'2026-04-18',221.39,'YAPE','YAPE-000000',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:36:33',NULL),(40,234,'2026-04-18',244.44,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:38:49',NULL),(41,233,'2026-04-18',180.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-04-17 19:38:54',NULL),(42,303,'2026-05-11',110.35,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-05-11 15:53:23',NULL),(43,304,'2026-05-11',226.96,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-05-11 15:53:29',NULL),(44,306,'2026-05-11',244.25,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-05-11 15:53:34',NULL),(45,307,'2026-05-11',231.98,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-05-11 15:53:36',NULL),(46,309,'2026-05-11',220.60,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-05-11 15:54:06',NULL),(47,310,'2026-05-11',220.60,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-05-11 15:54:09',NULL),(48,308,'2026-05-15',240.60,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-05-15 15:10:08',NULL),(49,384,'2026-05-22',227.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-02 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:32:03','2026-06-01 23:38:43'),(50,387,'2026-05-28',227.00,'YAPE','YAPE',NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-02 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:33:06','2026-06-01 23:38:43'),(51,388,'2026-06-02',241.60,'YAPE','YAPE',NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-02 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:33:31','2026-06-01 23:38:43'),(52,389,'2026-06-02',220.20,'YAPE','YAPE','Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10','REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-02 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:35:34','2026-06-01 23:38:43'),(53,390,'2026-05-22',220.20,'YAPE','YAPE','Falta agregar ahi 40 centimos','REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI','2026-06-02 00:00:00','Anulación desde Cobros UI','2026-06-01 23:37:36','2026-06-01 23:38:08'),(54,384,'2026-05-22',227.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:38:43','2026-06-19 16:02:48'),(55,387,'2026-05-28',227.00,'YAPE','YAPE',NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:38:43','2026-06-19 16:02:49'),(56,388,'2026-06-02',241.60,'YAPE','YAPE',NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:38:43','2026-06-19 16:02:49'),(57,389,'2026-06-02',220.20,'YAPE','YAPE','Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10','REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:38:43','2026-06-19 16:02:49'),(58,390,'2026-06-02',220.60,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:38:51','2026-06-19 16:02:49'),(59,383,'2026-06-02',107.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-01 23:39:13','2026-06-19 16:02:49'),(60,305,'2026-06-02',180.00,'EFECTIVO','95',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-01 23:52:05',NULL),(61,305,'2026-06-19',53.16,'EFECTIVO','53.16',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 15:11:35',NULL),(62,311,'2026-06-19',220.60,'EFECTIVO','220.6',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 15:12:15',NULL),(63,233,'2026-06-19',53.69,'EFECTIVO','53.69',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 15:13:22',NULL),(64,35,'2026-06-19',0.40,'EFECTIVO','0.40',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 15:14:06',NULL),(65,386,'2026-06-19',255.00,'YAPE','YAPE-000',NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-19 15:15:28','2026-06-19 16:02:49'),(66,433,'2026-06-19',30.00,'EFECTIVO',NULL,'Pago con anticipacion','REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-19 15:19:26','2026-06-19 15:19:50'),(67,433,'2026-06-19',30.00,'EFECTIVO',NULL,'Pago con anticipacion','REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-19 15:19:51','2026-06-19 15:20:36'),(68,433,'2026-06-19',30.00,'EFECTIVO',NULL,'Pago con anticipacion','REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-19 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-19 15:20:36','2026-06-19 15:20:49'),(69,433,'2026-06-19',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-20 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-19 15:57:25','2026-06-19 21:48:59'),(70,384,'2026-05-22',227.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI_FORCE_REFRESH',NULL,NULL,NULL,'2026-06-19 16:02:49',NULL),(71,387,'2026-05-28',227.00,'YAPE','YAPE',NULL,'REGISTRADO','MANUAL','ADMIN_UI_FORCE_REFRESH',NULL,NULL,NULL,'2026-06-19 16:02:49',NULL),(72,388,'2026-06-02',241.60,'YAPE','YAPE',NULL,'REGISTRADO','MANUAL','ADMIN_UI_FORCE_REFRESH',NULL,NULL,NULL,'2026-06-19 16:02:49',NULL),(73,389,'2026-06-02',220.20,'YAPE','YAPE','Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10','REGISTRADO','MANUAL','ADMIN_UI_FORCE_REFRESH',NULL,NULL,NULL,'2026-06-19 16:02:49',NULL),(74,390,'2026-06-02',220.60,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI_FORCE_REFRESH',NULL,NULL,NULL,'2026-06-19 16:02:49',NULL),(75,383,'2026-06-02',107.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI_FORCE_REFRESH',NULL,NULL,NULL,'2026-06-19 16:02:49',NULL),(76,386,'2026-06-19',255.00,'YAPE','YAPE-000',NULL,'REGISTRADO','MANUAL','ADMIN_UI_FORCE_REFRESH',NULL,NULL,NULL,'2026-06-19 16:02:49',NULL),(77,239,'2026-06-19',180.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 16:08:49',NULL),(78,311,'2026-06-19',180.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 16:09:06',NULL),(79,383,'2026-06-20',0.10,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 21:20:38',NULL),(80,388,'2026-06-20',0.10,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 21:20:46',NULL),(81,389,'2026-06-20',0.10,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 21:20:52',NULL),(82,390,'2026-06-20',0.10,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-06-19 21:20:59',NULL),(83,433,'2026-06-19',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-19 21:48:59','2026-06-25 18:16:05'),(84,433,'2026-06-19',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:16:05','2026-06-25 18:16:46'),(85,433,'2026-06-19',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:16:47','2026-06-25 18:17:03'),(86,433,'2026-06-25',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:18:25','2026-06-25 18:36:11'),(87,433,'2026-06-25',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:36:11','2026-06-25 18:36:32'),(88,433,'2026-06-25',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:36:32','2026-06-25 18:37:58'),(89,433,'2026-06-25',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:37:58','2026-06-25 18:38:09'),(90,433,'2026-06-25',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:38:09','2026-06-25 18:40:41'),(91,433,'2026-06-25',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:40:41','2026-06-25 18:45:42'),(92,433,'2026-06-25',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:45:42','2026-06-25 18:49:41'),(93,433,'2026-06-25',30.00,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI_FORCE_REFRESH','ADMIN_UI_FORCE_REFRESH','2026-06-26 00:00:00','Actualizacion forzada de cobros del periodo','2026-06-25 18:49:41','2026-06-25 18:50:41'),(94,433,'2026-06-25',30.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI_FORCE_REFRESH',NULL,NULL,NULL,'2026-06-25 18:50:41',NULL),(95,433,'2026-07-15',211.20,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-07-15 14:07:04',NULL),(96,429,'2026-07-15',231.10,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-07-15 14:07:09',NULL),(97,430,'2026-07-15',255.30,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI','2026-07-15 00:00:00','Anulación desde Cobros UI','2026-07-15 14:07:12','2026-07-15 14:07:20'),(98,431,'2026-07-15',254.20,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-07-15 14:07:25',NULL),(99,432,'2026-07-15',274.60,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-07-15 14:07:32',NULL),(100,434,'2026-07-15',220.90,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-07-15 14:07:41',NULL),(101,435,'2026-07-15',230.60,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-07-15 14:07:44',NULL),(102,428,'2026-07-15',125.00,'YAPE','YAPE-002',NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-07-15 14:09:07',NULL),(103,436,'2026-07-15',415.50,'EFECTIVO',NULL,NULL,'REVERSADO','MANUAL','ADMIN_UI','ADMIN_UI','2026-07-15 00:00:00','Anulación desde Cobros UI','2026-07-15 14:16:15','2026-07-15 14:16:20'),(104,391,'2026-07-15',401.00,'EFECTIVO',NULL,NULL,'REGISTRADO','MANUAL','ADMIN_UI',NULL,NULL,NULL,'2026-07-15 14:16:25',NULL);
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;
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
) ENGINE=InnoDB AUTO_INCREMENT=266 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_auditoria`
--

LOCK TABLES `pagos_auditoria` WRITE;
/*!40000 ALTER TABLE `pagos_auditoria` DISABLE KEYS */;
INSERT INTO `pagos_auditoria` VALUES (39,14,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":14,\"id_cobro\":243,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":219,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":220,\"codigo\":\"LUZ\",\"monto_aplicado\":5.03},{\"id_cobro_detalle\":221,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":5.07},{\"id_cobro_detalle\":222,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:23:48'),(40,14,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":14,\"id_cobro\":243,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":219,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":220,\"codigo\":\"LUZ\",\"monto_aplicado\":5.03},{\"id_cobro_detalle\":221,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":5.07},{\"id_cobro_detalle\":222,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:23:48'),(41,14,'REVERSADO','ADMIN_UI','{\"id_pago\":14,\"id_cobro\":243,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":14,\"id_cobro\":243,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI\",\"fecha_reversa\":\"2026-04-18 00:00:00\",\"motivo_reversa\":\"Anulación desde Cobros UI\"}','2026-04-17 19:24:14'),(42,15,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":15,\"id_cobro\":241,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"226.65\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":213,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":214,\"codigo\":\"LUZ\",\"monto_aplicado\":16.65},{\"id_cobro_detalle\":215,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:25:33'),(43,15,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":15,\"id_cobro\":241,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"226.65\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":213,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":214,\"codigo\":\"LUZ\",\"monto_aplicado\":16.65},{\"id_cobro_detalle\":215,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:25:33'),(44,16,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":16,\"id_cobro\":247,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"747.80\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":234,\"codigo\":\"ALQUILER\",\"monto_aplicado\":700},{\"id_cobro_detalle\":235,\"codigo\":\"LUZ\",\"monto_aplicado\":17.8},{\"id_cobro_detalle\":236,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:25:47'),(45,16,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":16,\"id_cobro\":247,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"747.80\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":234,\"codigo\":\"ALQUILER\",\"monto_aplicado\":700},{\"id_cobro_detalle\":235,\"codigo\":\"LUZ\",\"monto_aplicado\":17.8},{\"id_cobro_detalle\":236,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:25:47'),(46,17,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":17,\"id_cobro\":242,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"250.32\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":216,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":217,\"codigo\":\"LUZ\",\"monto_aplicado\":40.32},{\"id_cobro_detalle\":218,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:26:05'),(47,17,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":17,\"id_cobro\":242,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"250.32\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":216,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":217,\"codigo\":\"LUZ\",\"monto_aplicado\":40.32},{\"id_cobro_detalle\":218,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:26:05'),(48,18,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":18,\"id_cobro\":244,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"268.44\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":223,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":224,\"codigo\":\"LUZ\",\"monto_aplicado\":58.44},{\"id_cobro_detalle\":225,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:26:45'),(49,18,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":18,\"id_cobro\":244,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"268.44\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":223,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":224,\"codigo\":\"LUZ\",\"monto_aplicado\":58.44},{\"id_cobro_detalle\":225,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:26:45'),(50,19,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":19,\"id_cobro\":246,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":230,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":231,\"codigo\":\"LUZ\",\"monto_aplicado\":9.42},{\"id_cobro_detalle\":232,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":0.68},{\"id_cobro_detalle\":233,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:26:53'),(51,19,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":19,\"id_cobro\":246,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":230,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":231,\"codigo\":\"LUZ\",\"monto_aplicado\":9.42},{\"id_cobro_detalle\":232,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":0.68},{\"id_cobro_detalle\":233,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:26:53'),(52,20,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":20,\"id_cobro\":245,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":226,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":227,\"codigo\":\"LUZ\",\"monto_aplicado\":2.09},{\"id_cobro_detalle\":228,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":8.01},{\"id_cobro_detalle\":229,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:27:01'),(53,20,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":20,\"id_cobro\":245,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":226,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":227,\"codigo\":\"LUZ\",\"monto_aplicado\":2.09},{\"id_cobro_detalle\":228,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":8.01},{\"id_cobro_detalle\":229,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:27:01'),(54,21,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":21,\"id_cobro\":248,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":237,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":238,\"codigo\":\"LUZ\",\"monto_aplicado\":4.71},{\"id_cobro_detalle\":239,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":5.39},{\"id_cobro_detalle\":240,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:27:22'),(55,21,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":21,\"id_cobro\":248,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":237,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":238,\"codigo\":\"LUZ\",\"monto_aplicado\":4.71},{\"id_cobro_detalle\":239,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":5.39},{\"id_cobro_detalle\":240,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:27:22'),(56,22,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":22,\"id_cobro\":243,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"177.40\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":219,\"codigo\":\"ALQUILER\",\"monto_aplicado\":137.3},{\"id_cobro_detalle\":220,\"codigo\":\"LUZ\",\"monto_aplicado\":5.03},{\"id_cobro_detalle\":221,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":5.07},{\"id_cobro_detalle\":222,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:28:03'),(57,22,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":22,\"id_cobro\":243,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"177.40\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":219,\"codigo\":\"ALQUILER\",\"monto_aplicado\":137.3},{\"id_cobro_detalle\":220,\"codigo\":\"LUZ\",\"monto_aplicado\":5.03},{\"id_cobro_detalle\":221,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":5.07},{\"id_cobro_detalle\":222,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:28:03'),(58,23,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":23,\"id_cobro\":33,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"208.99\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":2,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":19,\"codigo\":\"LUZ\",\"monto_aplicado\":13.99},{\"id_cobro_detalle\":37,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:28:39'),(59,23,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":23,\"id_cobro\":33,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"208.99\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":2,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":19,\"codigo\":\"LUZ\",\"monto_aplicado\":13.99},{\"id_cobro_detalle\":37,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:28:39'),(60,24,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":24,\"id_cobro\":38,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"214.29\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":7,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":23,\"codigo\":\"LUZ\",\"monto_aplicado\":19.29},{\"id_cobro_detalle\":42,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:28:50'),(61,24,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":24,\"id_cobro\":38,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"214.29\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":7,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":23,\"codigo\":\"LUZ\",\"monto_aplicado\":19.29},{\"id_cobro_detalle\":42,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:28:50'),(62,25,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":25,\"id_cobro\":35,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"211.98\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":4,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":20,\"codigo\":\"LUZ\",\"monto_aplicado\":16.98},{\"id_cobro_detalle\":39,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:29:01'),(63,25,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":25,\"id_cobro\":35,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"211.98\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":4,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":20,\"codigo\":\"LUZ\",\"monto_aplicado\":16.98},{\"id_cobro_detalle\":39,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:29:01'),(64,25,'REVERSADO','ADMIN_UI','{\"id_pago\":25,\"id_cobro\":35,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"211.98\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":25,\"id_cobro\":35,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"211.98\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI\",\"fecha_reversa\":\"2026-04-18 00:00:00\",\"motivo_reversa\":\"Anulación desde Cobros UI\"}','2026-04-17 19:29:29'),(65,26,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":26,\"id_cobro\":35,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"211.58\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":4,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":20,\"codigo\":\"LUZ\",\"monto_aplicado\":16.58},{\"id_cobro_detalle\":39,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:29:54'),(66,26,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":26,\"id_cobro\":35,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"211.58\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":4,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":20,\"codigo\":\"LUZ\",\"monto_aplicado\":16.58},{\"id_cobro_detalle\":39,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:29:54'),(67,27,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":27,\"id_cobro\":36,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"272.44\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":5,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":21,\"codigo\":\"LUZ\",\"monto_aplicado\":77.44},{\"id_cobro_detalle\":40,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:30:19'),(68,27,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":27,\"id_cobro\":36,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"272.44\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":5,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":21,\"codigo\":\"LUZ\",\"monto_aplicado\":77.44},{\"id_cobro_detalle\":40,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:30:19'),(69,27,'REVERSADO','ADMIN_UI','{\"id_pago\":27,\"id_cobro\":36,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"272.44\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":27,\"id_cobro\":36,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"272.44\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI\",\"fecha_reversa\":\"2026-04-18 00:00:00\",\"motivo_reversa\":\"Anulación desde Cobros UI\"}','2026-04-17 19:30:23'),(70,28,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":28,\"id_cobro\":36,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"272.44\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-0000000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":5,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":21,\"codigo\":\"LUZ\",\"monto_aplicado\":77.44},{\"id_cobro_detalle\":40,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:30:53'),(71,28,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":28,\"id_cobro\":36,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"272.44\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-0000000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":5,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":21,\"codigo\":\"LUZ\",\"monto_aplicado\":77.44},{\"id_cobro_detalle\":40,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:30:53'),(72,29,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":29,\"id_cobro\":37,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"201.38\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-00000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":6,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":22,\"codigo\":\"LUZ\",\"monto_aplicado\":6.38},{\"id_cobro_detalle\":41,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:31:23'),(73,29,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":29,\"id_cobro\":37,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"201.38\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-00000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":6,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":22,\"codigo\":\"LUZ\",\"monto_aplicado\":6.38},{\"id_cobro_detalle\":41,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:31:23'),(74,30,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":30,\"id_cobro\":39,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"195.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":8,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":43,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:32:53'),(75,30,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":30,\"id_cobro\":39,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"195.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":8,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":43,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:32:53'),(76,31,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":31,\"id_cobro\":40,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"195.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":9,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":44,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:32:58'),(77,31,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":31,\"id_cobro\":40,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"195.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":9,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":44,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:32:58'),(78,32,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":32,\"id_cobro\":34,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"195.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":3,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":38,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:33:36'),(79,32,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":32,\"id_cobro\":34,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"195.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":3,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":38,\"codigo\":\"AGUA\",\"monto_aplicado\":15}]}','2026-04-17 19:33:36'),(80,33,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":33,\"id_cobro\":238,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"746.51\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":204,\"codigo\":\"ALQUILER\",\"monto_aplicado\":700},{\"id_cobro_detalle\":205,\"codigo\":\"LUZ\",\"monto_aplicado\":16.51},{\"id_cobro_detalle\":206,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:34:07'),(81,33,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":33,\"id_cobro\":238,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"746.51\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":204,\"codigo\":\"ALQUILER\",\"monto_aplicado\":700},{\"id_cobro_detalle\":205,\"codigo\":\"LUZ\",\"monto_aplicado\":16.51},{\"id_cobro_detalle\":206,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:34:07'),(82,34,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":34,\"id_cobro\":239,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":207,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":208,\"codigo\":\"LUZ\",\"monto_aplicado\":2.56},{\"id_cobro_detalle\":209,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":7.54},{\"id_cobro_detalle\":210,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:34:12'),(83,34,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":34,\"id_cobro\":239,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":207,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":208,\"codigo\":\"LUZ\",\"monto_aplicado\":2.56},{\"id_cobro_detalle\":209,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":7.54},{\"id_cobro_detalle\":210,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:34:12'),(84,35,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":35,\"id_cobro\":232,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"228.05\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":185,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":186,\"codigo\":\"LUZ\",\"monto_aplicado\":18.05},{\"id_cobro_detalle\":187,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:34:35'),(85,35,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":35,\"id_cobro\":232,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"228.05\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":185,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":186,\"codigo\":\"LUZ\",\"monto_aplicado\":18.05},{\"id_cobro_detalle\":187,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:34:35'),(86,36,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":36,\"id_cobro\":233,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"233.69\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":188,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":189,\"codigo\":\"LUZ\",\"monto_aplicado\":23.69},{\"id_cobro_detalle\":190,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:34:49'),(87,36,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":36,\"id_cobro\":233,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"233.69\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":188,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":189,\"codigo\":\"LUZ\",\"monto_aplicado\":23.69},{\"id_cobro_detalle\":190,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:34:49'),(88,36,'REVERSADO','ADMIN_UI','{\"id_pago\":36,\"id_cobro\":233,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"233.69\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":36,\"id_cobro\":233,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"233.69\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI\",\"fecha_reversa\":\"2026-04-18 00:00:00\",\"motivo_reversa\":\"Anulación desde Cobros UI\"}','2026-04-17 19:35:04'),(89,37,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":37,\"id_cobro\":235,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"227.16\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":194,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":195,\"codigo\":\"LUZ\",\"monto_aplicado\":17.16},{\"id_cobro_detalle\":196,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:35:37'),(90,37,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":37,\"id_cobro\":235,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"227.16\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":194,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":195,\"codigo\":\"LUZ\",\"monto_aplicado\":17.16},{\"id_cobro_detalle\":196,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:35:37'),(91,38,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":38,\"id_cobro\":236,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":197,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":198,\"codigo\":\"LUZ\",\"monto_aplicado\":3.97},{\"id_cobro_detalle\":199,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":6.13},{\"id_cobro_detalle\":200,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:36:05'),(92,38,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":38,\"id_cobro\":236,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"220.10\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":197,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":198,\"codigo\":\"LUZ\",\"monto_aplicado\":3.97},{\"id_cobro_detalle\":199,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":6.13},{\"id_cobro_detalle\":200,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:36:05'),(93,39,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":39,\"id_cobro\":237,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"221.39\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":201,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":202,\"codigo\":\"LUZ\",\"monto_aplicado\":11.39},{\"id_cobro_detalle\":203,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:36:33'),(94,39,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":39,\"id_cobro\":237,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"221.39\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":201,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":202,\"codigo\":\"LUZ\",\"monto_aplicado\":11.39},{\"id_cobro_detalle\":203,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:36:33'),(95,40,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":40,\"id_cobro\":234,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"244.44\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":191,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":192,\"codigo\":\"LUZ\",\"monto_aplicado\":34.44},{\"id_cobro_detalle\":193,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:38:49'),(96,40,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":40,\"id_cobro\":234,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"244.44\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":191,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":192,\"codigo\":\"LUZ\",\"monto_aplicado\":34.44},{\"id_cobro_detalle\":193,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-04-17 19:38:49'),(97,41,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":41,\"id_cobro\":233,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"180.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":188,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180}]}','2026-04-17 19:38:54'),(98,41,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":41,\"id_cobro\":233,\"fecha_pago\":\"2026-04-18\",\"monto_pagado\":\"180.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":188,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180}]}','2026-04-17 19:38:54'),(99,42,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":42,\"id_cobro\":303,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"110.35\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":420,\"codigo\":\"LUZ\",\"monto_aplicado\":80.35},{\"id_cobro_detalle\":421,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:53:23'),(100,42,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":42,\"id_cobro\":303,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"110.35\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":420,\"codigo\":\"LUZ\",\"monto_aplicado\":80.35},{\"id_cobro_detalle\":421,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:53:23'),(101,43,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":43,\"id_cobro\":304,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"226.96\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":422,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":423,\"codigo\":\"LUZ\",\"monto_aplicado\":16.96},{\"id_cobro_detalle\":424,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:53:29'),(102,43,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":43,\"id_cobro\":304,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"226.96\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":422,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":423,\"codigo\":\"LUZ\",\"monto_aplicado\":16.96},{\"id_cobro_detalle\":424,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:53:29'),(103,44,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":44,\"id_cobro\":306,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"244.25\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":428,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":429,\"codigo\":\"LUZ\",\"monto_aplicado\":34.25},{\"id_cobro_detalle\":430,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:53:34'),(104,44,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":44,\"id_cobro\":306,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"244.25\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":428,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":429,\"codigo\":\"LUZ\",\"monto_aplicado\":34.25},{\"id_cobro_detalle\":430,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:53:34'),(105,45,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":45,\"id_cobro\":307,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"231.98\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":431,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":432,\"codigo\":\"LUZ\",\"monto_aplicado\":21.98},{\"id_cobro_detalle\":433,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:53:36'),(106,45,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":45,\"id_cobro\":307,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"231.98\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":431,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":432,\"codigo\":\"LUZ\",\"monto_aplicado\":21.98},{\"id_cobro_detalle\":433,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:53:36'),(107,46,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":46,\"id_cobro\":309,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":438,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":439,\"codigo\":\"LUZ\",\"monto_aplicado\":5.22},{\"id_cobro_detalle\":440,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":5.38},{\"id_cobro_detalle\":441,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:54:06'),(108,46,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":46,\"id_cobro\":309,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":438,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":439,\"codigo\":\"LUZ\",\"monto_aplicado\":5.22},{\"id_cobro_detalle\":440,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":5.38},{\"id_cobro_detalle\":441,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:54:06'),(109,47,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":47,\"id_cobro\":310,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":442,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":443,\"codigo\":\"LUZ\",\"monto_aplicado\":8.85},{\"id_cobro_detalle\":444,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":1.75},{\"id_cobro_detalle\":445,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:54:09'),(110,47,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":47,\"id_cobro\":310,\"fecha_pago\":\"2026-05-11\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":442,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":443,\"codigo\":\"LUZ\",\"monto_aplicado\":8.85},{\"id_cobro_detalle\":444,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":1.75},{\"id_cobro_detalle\":445,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-11 15:54:09'),(111,48,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":48,\"id_cobro\":308,\"fecha_pago\":\"2026-05-15\",\"monto_pagado\":\"240.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":434,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":435,\"codigo\":\"LUZ\",\"monto_aplicado\":1.28},{\"id_cobro_detalle\":436,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":9.32},{\"id_cobro_detalle\":437,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-15 15:10:08'),(112,48,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":48,\"id_cobro\":308,\"fecha_pago\":\"2026-05-15\",\"monto_pagado\":\"240.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":434,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":435,\"codigo\":\"LUZ\",\"monto_aplicado\":1.28},{\"id_cobro_detalle\":436,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":9.32},{\"id_cobro_detalle\":437,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-05-15 15:10:08'),(113,49,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":49,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":684,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":685,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":686,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:32:03'),(114,49,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":49,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":684,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":685,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":686,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:32:03'),(115,50,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":50,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":693,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":694,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":695,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:33:06'),(116,50,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":50,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":693,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":694,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":695,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:33:06'),(117,51,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":51,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":696,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":697,\"codigo\":\"LUZ\",\"monto_aplicado\":11.6},{\"id_cobro_detalle\":698,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:33:31'),(118,51,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":51,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":696,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":697,\"codigo\":\"LUZ\",\"monto_aplicado\":11.6},{\"id_cobro_detalle\":698,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:33:31'),(119,52,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":52,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":699,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":700,\"codigo\":\"LUZ\",\"monto_aplicado\":10.2},{\"id_cobro_detalle\":701,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:35:34'),(120,52,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":52,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":699,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":700,\"codigo\":\"LUZ\",\"monto_aplicado\":10.2},{\"id_cobro_detalle\":701,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:35:34'),(121,53,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":53,\"id_cobro\":390,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Falta agregar ahi 40 centimos\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":702,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":703,\"codigo\":\"LUZ\",\"monto_aplicado\":10.2},{\"id_cobro_detalle\":704,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:37:36'),(122,53,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":53,\"id_cobro\":390,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Falta agregar ahi 40 centimos\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":702,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":703,\"codigo\":\"LUZ\",\"monto_aplicado\":10.2},{\"id_cobro_detalle\":704,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:37:36'),(123,53,'REVERSADO','ADMIN_UI','{\"id_pago\":53,\"id_cobro\":390,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Falta agregar ahi 40 centimos\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":53,\"id_cobro\":390,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Falta agregar ahi 40 centimos\",\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI\",\"fecha_reversa\":\"2026-06-02 00:00:00\",\"motivo_reversa\":\"Anulación desde Cobros UI\"}','2026-06-01 23:38:08'),(124,49,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":49,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":49,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-02 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-01 23:38:43'),(125,50,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":50,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":50,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-02 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-01 23:38:43'),(126,51,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":51,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":51,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-02 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-01 23:38:43'),(127,52,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":52,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":52,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-02 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-01 23:38:43'),(128,54,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":54,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":684,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":685,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":686,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:43'),(129,54,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":54,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":684,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":685,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":686,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:43'),(130,55,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":55,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":693,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":694,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":695,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:43'),(131,55,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":55,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":693,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":694,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":695,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:43'),(132,56,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":56,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":696,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":697,\"codigo\":\"LUZ\",\"monto_aplicado\":11.6},{\"id_cobro_detalle\":698,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:43'),(133,56,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":56,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":696,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":697,\"codigo\":\"LUZ\",\"monto_aplicado\":11.6},{\"id_cobro_detalle\":698,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:43'),(134,57,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":57,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":699,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":700,\"codigo\":\"LUZ\",\"monto_aplicado\":10.2},{\"id_cobro_detalle\":701,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:43'),(135,57,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":57,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":699,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":700,\"codigo\":\"LUZ\",\"monto_aplicado\":10.2},{\"id_cobro_detalle\":701,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:43'),(136,58,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":58,\"id_cobro\":390,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":702,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":703,\"codigo\":\"LUZ\",\"monto_aplicado\":10.6},{\"id_cobro_detalle\":704,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:52'),(137,58,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":58,\"id_cobro\":390,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":702,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":703,\"codigo\":\"LUZ\",\"monto_aplicado\":10.6},{\"id_cobro_detalle\":704,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:38:52'),(138,59,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":59,\"id_cobro\":383,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"107.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":682,\"codigo\":\"LUZ\",\"monto_aplicado\":77},{\"id_cobro_detalle\":683,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:39:13'),(139,59,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":59,\"id_cobro\":383,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"107.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":682,\"codigo\":\"LUZ\",\"monto_aplicado\":77},{\"id_cobro_detalle\":683,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-01 23:39:13'),(140,60,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":60,\"id_cobro\":305,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"180.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"95\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":425,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180}]}','2026-06-01 23:52:05'),(141,60,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":60,\"id_cobro\":305,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"180.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"95\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":425,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180}]}','2026-06-01 23:52:05'),(142,61,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":61,\"id_cobro\":305,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"53.16\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"53.16\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":426,\"codigo\":\"LUZ\",\"monto_aplicado\":23.16},{\"id_cobro_detalle\":427,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:11:35'),(143,61,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":61,\"id_cobro\":305,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"53.16\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"53.16\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":426,\"codigo\":\"LUZ\",\"monto_aplicado\":23.16},{\"id_cobro_detalle\":427,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:11:35'),(144,62,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":62,\"id_cobro\":311,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"220.6\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":446,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":447,\"codigo\":\"LUZ\",\"monto_aplicado\":8.64},{\"id_cobro_detalle\":448,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":1.96},{\"id_cobro_detalle\":449,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:12:15'),(145,62,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":62,\"id_cobro\":311,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"220.6\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":446,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":447,\"codigo\":\"LUZ\",\"monto_aplicado\":8.64},{\"id_cobro_detalle\":448,\"codigo\":\"AJUSTE_MINIMO_LUZ\",\"monto_aplicado\":1.96},{\"id_cobro_detalle\":449,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:12:15'),(146,63,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":63,\"id_cobro\":233,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"53.69\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"53.69\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":189,\"codigo\":\"LUZ\",\"monto_aplicado\":23.69},{\"id_cobro_detalle\":190,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:13:22'),(147,63,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":63,\"id_cobro\":233,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"53.69\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"53.69\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":189,\"codigo\":\"LUZ\",\"monto_aplicado\":23.69},{\"id_cobro_detalle\":190,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:13:22'),(148,64,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":64,\"id_cobro\":35,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"0.40\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"0.40\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":20,\"codigo\":\"LUZ\",\"monto_aplicado\":0.4}]}','2026-06-19 15:14:06'),(149,64,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":64,\"id_cobro\":35,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"0.40\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":\"0.40\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":20,\"codigo\":\"LUZ\",\"monto_aplicado\":0.4}]}','2026-06-19 15:14:06'),(150,65,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":65,\"id_cobro\":386,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"255.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":690,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":691,\"codigo\":\"LUZ\",\"monto_aplicado\":45},{\"id_cobro_detalle\":692,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:15:28'),(151,65,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":65,\"id_cobro\":386,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"255.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":690,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":691,\"codigo\":\"LUZ\",\"monto_aplicado\":45},{\"id_cobro_detalle\":692,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:15:28'),(152,66,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":66,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:19:26'),(153,66,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":66,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:19:26'),(154,66,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":66,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":66,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 15:19:51'),(155,67,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":67,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:19:51'),(156,67,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":67,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:19:51'),(157,67,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":67,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":67,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 15:20:36'),(158,68,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":68,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:20:36'),(159,68,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":68,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:20:36'),(160,68,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":68,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":68,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":\"Pago con anticipacion\",\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 15:20:49'),(161,69,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":69,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:57:25'),(162,69,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":69,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 15:57:25'),(163,54,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":54,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":54,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 16:02:49'),(164,55,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":55,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":55,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 16:02:49'),(165,56,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":56,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":56,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 16:02:49'),(166,57,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":57,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":57,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 16:02:49'),(167,58,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":58,\"id_cobro\":390,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":58,\"id_cobro\":390,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 16:02:49'),(168,59,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":59,\"id_cobro\":383,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"107.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":59,\"id_cobro\":383,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"107.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 16:02:49'),(169,65,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":65,\"id_cobro\":386,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"255.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":65,\"id_cobro\":386,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"255.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000\",\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-19 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 16:02:49'),(170,70,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":70,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":684,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":685,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":686,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(171,70,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":70,\"id_cobro\":384,\"fecha_pago\":\"2026-05-22\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":684,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":685,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":686,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(172,71,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":71,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":693,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":694,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":695,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(173,71,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":71,\"id_cobro\":387,\"fecha_pago\":\"2026-05-28\",\"monto_pagado\":\"227.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":693,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":694,\"codigo\":\"LUZ\",\"monto_aplicado\":17},{\"id_cobro_detalle\":695,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(174,72,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":72,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":696,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":697,\"codigo\":\"LUZ\",\"monto_aplicado\":11.6},{\"id_cobro_detalle\":698,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(175,72,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":72,\"id_cobro\":388,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"241.60\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":696,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":697,\"codigo\":\"LUZ\",\"monto_aplicado\":11.6},{\"id_cobro_detalle\":698,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(176,73,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":73,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":699,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":700,\"codigo\":\"LUZ\",\"monto_aplicado\":10.2},{\"id_cobro_detalle\":701,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(177,73,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":73,\"id_cobro\":389,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.20\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE\",\"observacion\":\"Cancelo todo pero no se por que se le cobro solo 20 soles en el agua. Se debe restar 10\",\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":699,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":700,\"codigo\":\"LUZ\",\"monto_aplicado\":10.2},{\"id_cobro_detalle\":701,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(178,74,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":74,\"id_cobro\":390,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":702,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":703,\"codigo\":\"LUZ\",\"monto_aplicado\":10.6},{\"id_cobro_detalle\":704,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(179,74,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":74,\"id_cobro\":390,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"220.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":702,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":703,\"codigo\":\"LUZ\",\"monto_aplicado\":10.6},{\"id_cobro_detalle\":704,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(180,75,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":75,\"id_cobro\":383,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"107.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":682,\"codigo\":\"LUZ\",\"monto_aplicado\":77},{\"id_cobro_detalle\":683,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(181,75,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":75,\"id_cobro\":383,\"fecha_pago\":\"2026-06-02\",\"monto_pagado\":\"107.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":682,\"codigo\":\"LUZ\",\"monto_aplicado\":77},{\"id_cobro_detalle\":683,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(182,76,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":76,\"id_cobro\":386,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"255.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":690,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":691,\"codigo\":\"LUZ\",\"monto_aplicado\":45},{\"id_cobro_detalle\":692,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(183,76,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":76,\"id_cobro\":386,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"255.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-000\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":690,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":691,\"codigo\":\"LUZ\",\"monto_aplicado\":45},{\"id_cobro_detalle\":692,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 16:02:49'),(184,77,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":77,\"id_cobro\":239,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"180.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":207,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180}]}','2026-06-19 16:08:49'),(185,77,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":77,\"id_cobro\":239,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"180.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":207,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180}]}','2026-06-19 16:08:49'),(186,78,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":78,\"id_cobro\":311,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"180.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":446,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180}]}','2026-06-19 16:09:06'),(187,78,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":78,\"id_cobro\":311,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"180.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":446,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180}]}','2026-06-19 16:09:06'),(188,79,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":79,\"id_cobro\":383,\"fecha_pago\":\"2026-06-20\",\"monto_pagado\":\"0.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":682,\"codigo\":\"LUZ\",\"monto_aplicado\":0.1}]}','2026-06-19 21:20:38'),(189,79,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":79,\"id_cobro\":383,\"fecha_pago\":\"2026-06-20\",\"monto_pagado\":\"0.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":682,\"codigo\":\"LUZ\",\"monto_aplicado\":0.1}]}','2026-06-19 21:20:38'),(190,80,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":80,\"id_cobro\":388,\"fecha_pago\":\"2026-06-20\",\"monto_pagado\":\"0.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":697,\"codigo\":\"LUZ\",\"monto_aplicado\":0.1}]}','2026-06-19 21:20:46'),(191,80,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":80,\"id_cobro\":388,\"fecha_pago\":\"2026-06-20\",\"monto_pagado\":\"0.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":697,\"codigo\":\"LUZ\",\"monto_aplicado\":0.1}]}','2026-06-19 21:20:46'),(192,81,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":81,\"id_cobro\":389,\"fecha_pago\":\"2026-06-20\",\"monto_pagado\":\"0.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":700,\"codigo\":\"LUZ\",\"monto_aplicado\":0.1}]}','2026-06-19 21:20:52'),(193,81,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":81,\"id_cobro\":389,\"fecha_pago\":\"2026-06-20\",\"monto_pagado\":\"0.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":700,\"codigo\":\"LUZ\",\"monto_aplicado\":0.1}]}','2026-06-19 21:20:52'),(194,82,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":82,\"id_cobro\":390,\"fecha_pago\":\"2026-06-20\",\"monto_pagado\":\"0.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":703,\"codigo\":\"LUZ\",\"monto_aplicado\":0.1}]}','2026-06-19 21:20:59'),(195,82,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":82,\"id_cobro\":390,\"fecha_pago\":\"2026-06-20\",\"monto_pagado\":\"0.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":703,\"codigo\":\"LUZ\",\"monto_aplicado\":0.1}]}','2026-06-19 21:20:59'),(196,69,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":69,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":69,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-20 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-19 21:48:59'),(197,83,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":83,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 21:48:59'),(198,83,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":83,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-19 21:48:59'),(199,83,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":83,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":83,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:16:05'),(200,84,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":84,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:16:05'),(201,84,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":84,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:16:05'),(202,84,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":84,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":84,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:16:46'),(203,85,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":85,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:16:47'),(204,85,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":85,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:16:47'),(205,85,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":85,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":85,\"id_cobro\":433,\"fecha_pago\":\"2026-06-19\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:17:03'),(206,86,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":86,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:18:27'),(207,86,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":86,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:18:27'),(208,86,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":86,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":86,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:36:11'),(209,87,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":87,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:36:11'),(210,87,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":87,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:36:11'),(211,87,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":87,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":87,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:36:32'),(212,88,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":88,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:36:32'),(213,88,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":88,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:36:32'),(214,88,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":88,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":88,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:37:58'),(215,89,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":89,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:37:58'),(216,89,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":89,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:37:58'),(217,89,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":89,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":89,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:38:09'),(218,90,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":90,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:38:09'),(219,90,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":90,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:38:09'),(220,90,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":90,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":90,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:40:41'),(221,91,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":91,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:40:41'),(222,91,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":91,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:40:41'),(223,91,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":91,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":91,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:45:42'),(224,92,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":92,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:45:42'),(225,92,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":92,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:45:42'),(226,92,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":92,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":92,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:49:41'),(227,93,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":93,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:49:41'),(228,93,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":93,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:49:41'),(229,93,'REVERSADO','ADMIN_UI_FORCE_REFRESH','{\"id_pago\":93,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":93,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"fecha_reversa\":\"2026-06-26 00:00:00\",\"motivo_reversa\":\"Actualizacion forzada de cobros del periodo\"}','2026-06-25 18:50:41'),(230,94,'CREADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":94,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:50:41'),(231,94,'APLICADO','ADMIN_UI_FORCE_REFRESH',NULL,'{\"id_pago\":94,\"id_cobro\":433,\"fecha_pago\":\"2026-06-25\",\"monto_pagado\":\"30.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI_FORCE_REFRESH\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":828,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-06-25 18:50:41'),(232,95,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":95,\"id_cobro\":433,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"211.20\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":826,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":827,\"codigo\":\"LUZ\",\"monto_aplicado\":11.2}]}','2026-07-15 14:07:04'),(233,95,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":95,\"id_cobro\":433,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"211.20\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":826,\"codigo\":\"ALQUILER\",\"monto_aplicado\":200},{\"id_cobro_detalle\":827,\"codigo\":\"LUZ\",\"monto_aplicado\":11.2}]}','2026-07-15 14:07:04'),(234,96,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":96,\"id_cobro\":429,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"231.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":814,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":815,\"codigo\":\"LUZ\",\"monto_aplicado\":11.1},{\"id_cobro_detalle\":816,\"codigo\":\"AGUA\",\"monto_aplicado\":40}]}','2026-07-15 14:07:09'),(235,96,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":96,\"id_cobro\":429,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"231.10\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":814,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":815,\"codigo\":\"LUZ\",\"monto_aplicado\":11.1},{\"id_cobro_detalle\":816,\"codigo\":\"AGUA\",\"monto_aplicado\":40}]}','2026-07-15 14:07:09'),(236,97,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":97,\"id_cobro\":430,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"255.30\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":817,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":818,\"codigo\":\"LUZ\",\"monto_aplicado\":31.3},{\"id_cobro_detalle\":819,\"codigo\":\"AGUA\",\"monto_aplicado\":40},{\"id_cobro_detalle\":839,\"codigo\":\"OTROS\",\"monto_aplicado\":4}]}','2026-07-15 14:07:13'),(237,97,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":97,\"id_cobro\":430,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"255.30\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":817,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":818,\"codigo\":\"LUZ\",\"monto_aplicado\":31.3},{\"id_cobro_detalle\":819,\"codigo\":\"AGUA\",\"monto_aplicado\":40},{\"id_cobro_detalle\":839,\"codigo\":\"OTROS\",\"monto_aplicado\":4}]}','2026-07-15 14:07:13'),(238,97,'REVERSADO','ADMIN_UI','{\"id_pago\":97,\"id_cobro\":430,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"255.30\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":97,\"id_cobro\":430,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"255.30\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI\",\"fecha_reversa\":\"2026-07-15 00:00:00\",\"motivo_reversa\":\"Anulación desde Cobros UI\"}','2026-07-15 14:07:20'),(239,98,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":98,\"id_cobro\":431,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"254.20\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":820,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":821,\"codigo\":\"LUZ\",\"monto_aplicado\":29.2},{\"id_cobro_detalle\":822,\"codigo\":\"AGUA\",\"monto_aplicado\":45}]}','2026-07-15 14:07:25'),(240,98,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":98,\"id_cobro\":431,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"254.20\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":820,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":821,\"codigo\":\"LUZ\",\"monto_aplicado\":29.2},{\"id_cobro_detalle\":822,\"codigo\":\"AGUA\",\"monto_aplicado\":45}]}','2026-07-15 14:07:25'),(241,99,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":99,\"id_cobro\":432,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"274.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":823,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":824,\"codigo\":\"LUZ\",\"monto_aplicado\":34.6},{\"id_cobro_detalle\":825,\"codigo\":\"AGUA\",\"monto_aplicado\":60}]}','2026-07-15 14:07:32'),(242,99,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":99,\"id_cobro\":432,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"274.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":823,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":824,\"codigo\":\"LUZ\",\"monto_aplicado\":34.6},{\"id_cobro_detalle\":825,\"codigo\":\"AGUA\",\"monto_aplicado\":60}]}','2026-07-15 14:07:32'),(243,100,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":100,\"id_cobro\":434,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"220.90\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":829,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":830,\"codigo\":\"LUZ\",\"monto_aplicado\":10.9},{\"id_cobro_detalle\":831,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-07-15 14:07:41'),(244,100,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":100,\"id_cobro\":434,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"220.90\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":829,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":830,\"codigo\":\"LUZ\",\"monto_aplicado\":10.9},{\"id_cobro_detalle\":831,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-07-15 14:07:41'),(245,101,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":101,\"id_cobro\":435,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"230.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":832,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":833,\"codigo\":\"LUZ\",\"monto_aplicado\":10.6},{\"id_cobro_detalle\":834,\"codigo\":\"AGUA\",\"monto_aplicado\":40}]}','2026-07-15 14:07:44'),(246,101,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":101,\"id_cobro\":435,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"230.60\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":832,\"codigo\":\"ALQUILER\",\"monto_aplicado\":180},{\"id_cobro_detalle\":833,\"codigo\":\"LUZ\",\"monto_aplicado\":10.6},{\"id_cobro_detalle\":834,\"codigo\":\"AGUA\",\"monto_aplicado\":40}]}','2026-07-15 14:07:44'),(247,102,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":102,\"id_cobro\":428,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"125.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-002\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":812,\"codigo\":\"LUZ\",\"monto_aplicado\":85},{\"id_cobro_detalle\":813,\"codigo\":\"AGUA\",\"monto_aplicado\":40}]}','2026-07-15 14:09:07'),(248,102,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":102,\"id_cobro\":428,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"125.00\",\"metodo_pago\":\"YAPE\",\"numero_operacion\":\"YAPE-002\",\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":812,\"codigo\":\"LUZ\",\"monto_aplicado\":85},{\"id_cobro_detalle\":813,\"codigo\":\"AGUA\",\"monto_aplicado\":40}]}','2026-07-15 14:09:07'),(249,103,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":103,\"id_cobro\":436,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"415.50\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":835,\"codigo\":\"ALQUILER\",\"monto_aplicado\":360},{\"id_cobro_detalle\":836,\"codigo\":\"LUZ\",\"monto_aplicado\":10.5},{\"id_cobro_detalle\":837,\"codigo\":\"AGUA\",\"monto_aplicado\":45}]}','2026-07-15 14:16:15'),(250,103,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":103,\"id_cobro\":436,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"415.50\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":835,\"codigo\":\"ALQUILER\",\"monto_aplicado\":360},{\"id_cobro_detalle\":836,\"codigo\":\"LUZ\",\"monto_aplicado\":10.5},{\"id_cobro_detalle\":837,\"codigo\":\"AGUA\",\"monto_aplicado\":45}]}','2026-07-15 14:16:15'),(251,103,'REVERSADO','ADMIN_UI','{\"id_pago\":103,\"id_cobro\":436,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"415.50\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null}','{\"id_pago\":103,\"id_cobro\":436,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"415.50\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REVERSADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":\"ADMIN_UI\",\"fecha_reversa\":\"2026-07-15 00:00:00\",\"motivo_reversa\":\"Anulación desde Cobros UI\"}','2026-07-15 14:16:20'),(252,104,'CREADO','ADMIN_UI',NULL,'{\"id_pago\":104,\"id_cobro\":391,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"401.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":705,\"codigo\":\"ALQUILER\",\"monto_aplicado\":360},{\"id_cobro_detalle\":706,\"codigo\":\"LUZ\",\"monto_aplicado\":11},{\"id_cobro_detalle\":707,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-07-15 14:16:25'),(253,104,'APLICADO','ADMIN_UI',NULL,'{\"id_pago\":104,\"id_cobro\":391,\"fecha_pago\":\"2026-07-15\",\"monto_pagado\":\"401.00\",\"metodo_pago\":\"EFECTIVO\",\"numero_operacion\":null,\"observacion\":null,\"estado\":\"REGISTRADO\",\"origen_registro\":\"MANUAL\",\"registrado_por\":\"ADMIN_UI\",\"reversado_por\":null,\"fecha_reversa\":null,\"motivo_reversa\":null,\"aplicaciones\":[{\"id_cobro_detalle\":705,\"codigo\":\"ALQUILER\",\"monto_aplicado\":360},{\"id_cobro_detalle\":706,\"codigo\":\"LUZ\",\"monto_aplicado\":11},{\"id_cobro_detalle\":707,\"codigo\":\"AGUA\",\"monto_aplicado\":30}]}','2026-07-15 14:16:25');
/*!40000 ALTER TABLE `pagos_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=269 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_detalle`
--

LOCK TABLES `pagos_detalle` WRITE;
/*!40000 ALTER TABLE `pagos_detalle` DISABLE KEYS */;
INSERT INTO `pagos_detalle` VALUES (32,14,219,180.00,'AUTOMATICA',NULL,'2026-04-17 19:23:48',NULL),(33,14,220,5.03,'AUTOMATICA',NULL,'2026-04-17 19:23:48',NULL),(34,14,221,5.07,'AUTOMATICA',NULL,'2026-04-17 19:23:48',NULL),(35,14,222,30.00,'AUTOMATICA',NULL,'2026-04-17 19:23:48',NULL),(36,15,213,180.00,'AUTOMATICA',NULL,'2026-04-17 19:25:33',NULL),(37,15,214,16.65,'AUTOMATICA',NULL,'2026-04-17 19:25:33',NULL),(38,15,215,30.00,'AUTOMATICA',NULL,'2026-04-17 19:25:33',NULL),(39,16,234,700.00,'AUTOMATICA',NULL,'2026-04-17 19:25:47',NULL),(40,16,235,17.80,'AUTOMATICA',NULL,'2026-04-17 19:25:47',NULL),(41,16,236,30.00,'AUTOMATICA',NULL,'2026-04-17 19:25:47',NULL),(42,17,216,180.00,'AUTOMATICA',NULL,'2026-04-17 19:26:05',NULL),(43,17,217,40.32,'AUTOMATICA',NULL,'2026-04-17 19:26:05',NULL),(44,17,218,30.00,'AUTOMATICA',NULL,'2026-04-17 19:26:05',NULL),(45,18,223,180.00,'AUTOMATICA',NULL,'2026-04-17 19:26:45',NULL),(46,18,224,58.44,'AUTOMATICA',NULL,'2026-04-17 19:26:45',NULL),(47,18,225,30.00,'AUTOMATICA',NULL,'2026-04-17 19:26:45',NULL),(48,19,230,180.00,'AUTOMATICA',NULL,'2026-04-17 19:26:53',NULL),(49,19,231,9.42,'AUTOMATICA',NULL,'2026-04-17 19:26:53',NULL),(50,19,232,0.68,'AUTOMATICA',NULL,'2026-04-17 19:26:53',NULL),(51,19,233,30.00,'AUTOMATICA',NULL,'2026-04-17 19:26:53',NULL),(52,20,226,180.00,'AUTOMATICA',NULL,'2026-04-17 19:27:01',NULL),(53,20,227,2.09,'AUTOMATICA',NULL,'2026-04-17 19:27:01',NULL),(54,20,228,8.01,'AUTOMATICA',NULL,'2026-04-17 19:27:01',NULL),(55,20,229,30.00,'AUTOMATICA',NULL,'2026-04-17 19:27:01',NULL),(56,21,237,180.00,'AUTOMATICA',NULL,'2026-04-17 19:27:22',NULL),(57,21,238,4.71,'AUTOMATICA',NULL,'2026-04-17 19:27:22',NULL),(58,21,239,5.39,'AUTOMATICA',NULL,'2026-04-17 19:27:22',NULL),(59,21,240,30.00,'AUTOMATICA',NULL,'2026-04-17 19:27:22',NULL),(60,22,219,137.30,'MANUAL',NULL,'2026-04-17 19:28:03',NULL),(61,22,220,5.03,'MANUAL',NULL,'2026-04-17 19:28:03',NULL),(62,22,221,5.07,'MANUAL',NULL,'2026-04-17 19:28:03',NULL),(63,22,222,30.00,'MANUAL',NULL,'2026-04-17 19:28:03',NULL),(64,23,2,180.00,'AUTOMATICA',NULL,'2026-04-17 19:28:39',NULL),(65,23,19,13.99,'AUTOMATICA',NULL,'2026-04-17 19:28:39',NULL),(66,23,37,15.00,'AUTOMATICA',NULL,'2026-04-17 19:28:39',NULL),(67,24,7,180.00,'AUTOMATICA',NULL,'2026-04-17 19:28:50',NULL),(68,24,23,19.29,'AUTOMATICA',NULL,'2026-04-17 19:28:50',NULL),(69,24,42,15.00,'AUTOMATICA',NULL,'2026-04-17 19:28:50',NULL),(70,25,4,180.00,'AUTOMATICA',NULL,'2026-04-17 19:29:01',NULL),(71,25,20,16.98,'AUTOMATICA',NULL,'2026-04-17 19:29:01',NULL),(72,25,39,15.00,'AUTOMATICA',NULL,'2026-04-17 19:29:01',NULL),(73,26,4,180.00,'MANUAL',NULL,'2026-04-17 19:29:54',NULL),(74,26,20,16.58,'MANUAL',NULL,'2026-04-17 19:29:54',NULL),(75,26,39,15.00,'MANUAL',NULL,'2026-04-17 19:29:54',NULL),(76,27,5,180.00,'AUTOMATICA',NULL,'2026-04-17 19:30:19',NULL),(77,27,21,77.44,'AUTOMATICA',NULL,'2026-04-17 19:30:19',NULL),(78,27,40,15.00,'AUTOMATICA',NULL,'2026-04-17 19:30:19',NULL),(79,28,5,180.00,'MANUAL',NULL,'2026-04-17 19:30:53',NULL),(80,28,21,77.44,'MANUAL',NULL,'2026-04-17 19:30:53',NULL),(81,28,40,15.00,'MANUAL',NULL,'2026-04-17 19:30:53',NULL),(82,29,6,180.00,'MANUAL',NULL,'2026-04-17 19:31:23',NULL),(83,29,22,6.38,'MANUAL',NULL,'2026-04-17 19:31:23',NULL),(84,29,41,15.00,'MANUAL',NULL,'2026-04-17 19:31:23',NULL),(85,30,8,180.00,'AUTOMATICA',NULL,'2026-04-17 19:32:53',NULL),(86,30,43,15.00,'AUTOMATICA',NULL,'2026-04-17 19:32:53',NULL),(87,31,9,180.00,'AUTOMATICA',NULL,'2026-04-17 19:32:58',NULL),(88,31,44,15.00,'AUTOMATICA',NULL,'2026-04-17 19:32:58',NULL),(89,32,3,180.00,'AUTOMATICA',NULL,'2026-04-17 19:33:36',NULL),(90,32,38,15.00,'AUTOMATICA',NULL,'2026-04-17 19:33:36',NULL),(91,33,204,700.00,'AUTOMATICA',NULL,'2026-04-17 19:34:07',NULL),(92,33,205,16.51,'AUTOMATICA',NULL,'2026-04-17 19:34:07',NULL),(93,33,206,30.00,'AUTOMATICA',NULL,'2026-04-17 19:34:07',NULL),(94,34,207,180.00,'AUTOMATICA',NULL,'2026-04-17 19:34:12',NULL),(95,34,208,2.56,'AUTOMATICA',NULL,'2026-04-17 19:34:12',NULL),(96,34,209,7.54,'AUTOMATICA',NULL,'2026-04-17 19:34:12',NULL),(97,34,210,30.00,'AUTOMATICA',NULL,'2026-04-17 19:34:12',NULL),(98,35,185,180.00,'AUTOMATICA',NULL,'2026-04-17 19:34:35',NULL),(99,35,186,18.05,'AUTOMATICA',NULL,'2026-04-17 19:34:35',NULL),(100,35,187,30.00,'AUTOMATICA',NULL,'2026-04-17 19:34:35',NULL),(101,36,188,180.00,'AUTOMATICA',NULL,'2026-04-17 19:34:49',NULL),(102,36,189,23.69,'AUTOMATICA',NULL,'2026-04-17 19:34:49',NULL),(103,36,190,30.00,'AUTOMATICA',NULL,'2026-04-17 19:34:49',NULL),(104,37,194,180.00,'AUTOMATICA',NULL,'2026-04-17 19:35:37',NULL),(105,37,195,17.16,'AUTOMATICA',NULL,'2026-04-17 19:35:37',NULL),(106,37,196,30.00,'AUTOMATICA',NULL,'2026-04-17 19:35:37',NULL),(107,38,197,180.00,'AUTOMATICA',NULL,'2026-04-17 19:36:05',NULL),(108,38,198,3.97,'AUTOMATICA',NULL,'2026-04-17 19:36:05',NULL),(109,38,199,6.13,'AUTOMATICA',NULL,'2026-04-17 19:36:05',NULL),(110,38,200,30.00,'AUTOMATICA',NULL,'2026-04-17 19:36:05',NULL),(111,39,201,180.00,'AUTOMATICA',NULL,'2026-04-17 19:36:33',NULL),(112,39,202,11.39,'AUTOMATICA',NULL,'2026-04-17 19:36:33',NULL),(113,39,203,30.00,'AUTOMATICA',NULL,'2026-04-17 19:36:33',NULL),(114,40,191,180.00,'AUTOMATICA',NULL,'2026-04-17 19:38:49',NULL),(115,40,192,34.44,'AUTOMATICA',NULL,'2026-04-17 19:38:49',NULL),(116,40,193,30.00,'AUTOMATICA',NULL,'2026-04-17 19:38:49',NULL),(117,41,188,180.00,'MANUAL',NULL,'2026-04-17 19:38:54',NULL),(118,42,420,80.35,'AUTOMATICA',NULL,'2026-05-11 15:53:23',NULL),(119,42,421,30.00,'AUTOMATICA',NULL,'2026-05-11 15:53:23',NULL),(120,43,422,180.00,'AUTOMATICA',NULL,'2026-05-11 15:53:29',NULL),(121,43,423,16.96,'AUTOMATICA',NULL,'2026-05-11 15:53:29',NULL),(122,43,424,30.00,'AUTOMATICA',NULL,'2026-05-11 15:53:29',NULL),(123,44,428,180.00,'AUTOMATICA',NULL,'2026-05-11 15:53:34',NULL),(124,44,429,34.25,'AUTOMATICA',NULL,'2026-05-11 15:53:34',NULL),(125,44,430,30.00,'AUTOMATICA',NULL,'2026-05-11 15:53:34',NULL),(126,45,431,180.00,'AUTOMATICA',NULL,'2026-05-11 15:53:36',NULL),(127,45,432,21.98,'AUTOMATICA',NULL,'2026-05-11 15:53:36',NULL),(128,45,433,30.00,'AUTOMATICA',NULL,'2026-05-11 15:53:36',NULL),(129,46,438,180.00,'AUTOMATICA',NULL,'2026-05-11 15:54:06',NULL),(130,46,439,5.22,'AUTOMATICA',NULL,'2026-05-11 15:54:06',NULL),(131,46,440,5.38,'AUTOMATICA',NULL,'2026-05-11 15:54:06',NULL),(132,46,441,30.00,'AUTOMATICA',NULL,'2026-05-11 15:54:06',NULL),(133,47,442,180.00,'AUTOMATICA',NULL,'2026-05-11 15:54:09',NULL),(134,47,443,8.85,'AUTOMATICA',NULL,'2026-05-11 15:54:09',NULL),(135,47,444,1.75,'AUTOMATICA',NULL,'2026-05-11 15:54:09',NULL),(136,47,445,30.00,'AUTOMATICA',NULL,'2026-05-11 15:54:09',NULL),(137,48,434,200.00,'AUTOMATICA',NULL,'2026-05-15 15:10:08',NULL),(138,48,435,1.28,'AUTOMATICA',NULL,'2026-05-15 15:10:08',NULL),(139,48,436,9.32,'AUTOMATICA',NULL,'2026-05-15 15:10:08',NULL),(140,48,437,30.00,'AUTOMATICA',NULL,'2026-05-15 15:10:08',NULL),(141,49,684,180.00,'AUTOMATICA',NULL,'2026-06-01 23:32:03',NULL),(142,49,685,17.00,'AUTOMATICA',NULL,'2026-06-01 23:32:03',NULL),(143,49,686,30.00,'AUTOMATICA',NULL,'2026-06-01 23:32:03',NULL),(144,50,693,180.00,'AUTOMATICA',NULL,'2026-06-01 23:33:06',NULL),(145,50,694,17.00,'AUTOMATICA',NULL,'2026-06-01 23:33:06',NULL),(146,50,695,30.00,'AUTOMATICA',NULL,'2026-06-01 23:33:06',NULL),(147,51,696,200.00,'AUTOMATICA',NULL,'2026-06-01 23:33:31',NULL),(148,51,697,11.60,'AUTOMATICA',NULL,'2026-06-01 23:33:31',NULL),(149,51,698,30.00,'AUTOMATICA',NULL,'2026-06-01 23:33:31',NULL),(150,52,699,180.00,'AUTOMATICA',NULL,'2026-06-01 23:35:34',NULL),(151,52,700,10.20,'AUTOMATICA',NULL,'2026-06-01 23:35:34',NULL),(152,52,701,30.00,'AUTOMATICA',NULL,'2026-06-01 23:35:34',NULL),(153,53,702,180.00,'AUTOMATICA',NULL,'2026-06-01 23:37:36',NULL),(154,53,703,10.20,'AUTOMATICA',NULL,'2026-06-01 23:37:36',NULL),(155,53,704,30.00,'AUTOMATICA',NULL,'2026-06-01 23:37:36',NULL),(156,54,684,180.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(157,54,685,17.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(158,54,686,30.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(159,55,693,180.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(160,55,694,17.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(161,55,695,30.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(162,56,696,200.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(163,56,697,11.60,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(164,56,698,30.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(165,57,699,180.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(166,57,700,10.20,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(167,57,701,30.00,'MANUAL',NULL,'2026-06-01 23:38:43',NULL),(168,58,702,180.00,'AUTOMATICA',NULL,'2026-06-01 23:38:51',NULL),(169,58,703,10.60,'AUTOMATICA',NULL,'2026-06-01 23:38:51',NULL),(170,58,704,30.00,'AUTOMATICA',NULL,'2026-06-01 23:38:52',NULL),(171,59,682,77.00,'AUTOMATICA',NULL,'2026-06-01 23:39:13',NULL),(172,59,683,30.00,'AUTOMATICA',NULL,'2026-06-01 23:39:13',NULL),(173,60,425,180.00,'MANUAL',NULL,'2026-06-01 23:52:05',NULL),(174,61,426,23.16,'AUTOMATICA',NULL,'2026-06-19 15:11:35',NULL),(175,61,427,30.00,'AUTOMATICA',NULL,'2026-06-19 15:11:35',NULL),(176,62,446,180.00,'AUTOMATICA',NULL,'2026-06-19 15:12:15',NULL),(177,62,447,8.64,'AUTOMATICA',NULL,'2026-06-19 15:12:15',NULL),(178,62,448,1.96,'AUTOMATICA',NULL,'2026-06-19 15:12:15',NULL),(179,62,449,30.00,'AUTOMATICA',NULL,'2026-06-19 15:12:15',NULL),(180,63,189,23.69,'AUTOMATICA',NULL,'2026-06-19 15:13:22',NULL),(181,63,190,30.00,'AUTOMATICA',NULL,'2026-06-19 15:13:22',NULL),(182,64,20,0.40,'AUTOMATICA',NULL,'2026-06-19 15:14:06',NULL),(183,65,690,180.00,'AUTOMATICA',NULL,'2026-06-19 15:15:28',NULL),(184,65,691,45.00,'AUTOMATICA',NULL,'2026-06-19 15:15:28',NULL),(185,65,692,30.00,'AUTOMATICA',NULL,'2026-06-19 15:15:28',NULL),(186,66,828,30.00,'MANUAL',NULL,'2026-06-19 15:19:26',NULL),(187,67,828,30.00,'MANUAL',NULL,'2026-06-19 15:19:51',NULL),(188,68,828,30.00,'MANUAL',NULL,'2026-06-19 15:20:36',NULL),(189,69,828,30.00,'MANUAL',NULL,'2026-06-19 15:57:25',NULL),(190,70,684,180.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(191,70,685,17.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(192,70,686,30.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(193,71,693,180.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(194,71,694,17.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(195,71,695,30.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(196,72,696,200.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(197,72,697,11.60,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(198,72,698,30.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(199,73,699,180.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(200,73,700,10.20,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(201,73,701,30.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(202,74,702,180.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(203,74,703,10.60,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(204,74,704,30.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(205,75,682,77.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(206,75,683,30.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(207,76,690,180.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(208,76,691,45.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(209,76,692,30.00,'MANUAL',NULL,'2026-06-19 16:02:49',NULL),(210,77,207,180.00,'AUTOMATICA',NULL,'2026-06-19 16:08:49',NULL),(211,78,446,180.00,'AUTOMATICA',NULL,'2026-06-19 16:09:06',NULL),(212,79,682,0.10,'AUTOMATICA',NULL,'2026-06-19 21:20:38',NULL),(213,80,697,0.10,'AUTOMATICA',NULL,'2026-06-19 21:20:46',NULL),(214,81,700,0.10,'AUTOMATICA',NULL,'2026-06-19 21:20:52',NULL),(215,82,703,0.10,'AUTOMATICA',NULL,'2026-06-19 21:20:59',NULL),(216,83,828,30.00,'MANUAL',NULL,'2026-06-19 21:48:59',NULL),(217,84,828,30.00,'MANUAL',NULL,'2026-06-25 18:16:05',NULL),(218,85,828,30.00,'MANUAL',NULL,'2026-06-25 18:16:47',NULL),(219,86,828,30.00,'MANUAL',NULL,'2026-06-25 18:18:26',NULL),(220,87,828,30.00,'MANUAL',NULL,'2026-06-25 18:36:11',NULL),(221,88,828,30.00,'MANUAL',NULL,'2026-06-25 18:36:32',NULL),(222,89,828,30.00,'MANUAL',NULL,'2026-06-25 18:37:58',NULL),(223,90,828,30.00,'MANUAL',NULL,'2026-06-25 18:38:09',NULL),(224,91,828,30.00,'MANUAL',NULL,'2026-06-25 18:40:41',NULL),(225,92,828,30.00,'MANUAL',NULL,'2026-06-25 18:45:42',NULL),(226,93,828,30.00,'MANUAL',NULL,'2026-06-25 18:49:41',NULL),(227,94,828,30.00,'MANUAL',NULL,'2026-06-25 18:50:41',NULL),(228,95,826,200.00,'AUTOMATICA',NULL,'2026-07-15 14:07:04',NULL),(229,95,827,11.20,'AUTOMATICA',NULL,'2026-07-15 14:07:04',NULL),(230,96,814,180.00,'AUTOMATICA',NULL,'2026-07-15 14:07:09',NULL),(231,96,815,11.10,'AUTOMATICA',NULL,'2026-07-15 14:07:09',NULL),(232,96,816,40.00,'AUTOMATICA',NULL,'2026-07-15 14:07:09',NULL),(233,97,817,180.00,'AUTOMATICA',NULL,'2026-07-15 14:07:12',NULL),(234,97,818,31.30,'AUTOMATICA',NULL,'2026-07-15 14:07:12',NULL),(235,97,819,40.00,'AUTOMATICA',NULL,'2026-07-15 14:07:12',NULL),(236,97,839,4.00,'AUTOMATICA',NULL,'2026-07-15 14:07:12',NULL),(237,98,820,180.00,'AUTOMATICA',NULL,'2026-07-15 14:07:25',NULL),(238,98,821,29.20,'AUTOMATICA',NULL,'2026-07-15 14:07:25',NULL),(239,98,822,45.00,'AUTOMATICA',NULL,'2026-07-15 14:07:25',NULL),(240,99,823,180.00,'AUTOMATICA',NULL,'2026-07-15 14:07:32',NULL),(241,99,824,34.60,'AUTOMATICA',NULL,'2026-07-15 14:07:32',NULL),(242,99,825,60.00,'AUTOMATICA',NULL,'2026-07-15 14:07:32',NULL),(243,100,829,180.00,'AUTOMATICA',NULL,'2026-07-15 14:07:41',NULL),(244,100,830,10.90,'AUTOMATICA',NULL,'2026-07-15 14:07:41',NULL),(245,100,831,30.00,'AUTOMATICA',NULL,'2026-07-15 14:07:41',NULL),(246,101,832,180.00,'AUTOMATICA',NULL,'2026-07-15 14:07:44',NULL),(247,101,833,10.60,'AUTOMATICA',NULL,'2026-07-15 14:07:44',NULL),(248,101,834,40.00,'AUTOMATICA',NULL,'2026-07-15 14:07:44',NULL),(249,102,812,85.00,'AUTOMATICA',NULL,'2026-07-15 14:09:07',NULL),(250,102,813,40.00,'AUTOMATICA',NULL,'2026-07-15 14:09:07',NULL),(251,103,835,360.00,'AUTOMATICA',NULL,'2026-07-15 14:16:15',NULL),(252,103,836,10.50,'AUTOMATICA',NULL,'2026-07-15 14:16:15',NULL),(253,103,837,45.00,'AUTOMATICA',NULL,'2026-07-15 14:16:15',NULL),(254,104,705,360.00,'AUTOMATICA',NULL,'2026-07-15 14:16:25',NULL),(255,104,706,11.00,'AUTOMATICA',NULL,'2026-07-15 14:16:25',NULL),(256,104,707,30.00,'AUTOMATICA',NULL,'2026-07-15 14:16:25',NULL);
/*!40000 ALTER TABLE `pagos_detalle` ENABLE KEYS */;
UNLOCK TABLES;
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
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `payment_gateway_transactions`
--

LOCK TABLES `payment_gateway_transactions` WRITE;
/*!40000 ALTER TABLE `payment_gateway_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_gateway_transactions` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `periodos`
--

LOCK TABLES `periodos` WRITE;
/*!40000 ALTER TABLE `periodos` DISABLE KEYS */;
INSERT INTO `periodos` VALUES (1,2026,3,'2026-03-01','2026-03-31','CERRADO','Periodo de facturacion marzo 2026','2026-03-22 19:53:38','2026-05-18 05:28:42'),(2,2026,2,'2026-02-01','2026-02-28','CERRADO','Periodo febrero 2026','2026-03-22 21:39:32',NULL),(6,2026,1,'2025-12-15','2026-01-14','CERRADO','Periodo facturacion enero 2026','2026-03-24 08:34:11','2026-03-24 10:04:56'),(8,2026,4,'2026-04-01','2026-04-14','CERRADO','Periodo facturacion abril 2026','2026-04-17 08:34:11','2026-05-18 06:11:58'),(9,2026,5,'2026-04-15','2026-05-14','CERRADO','Periodo facturación mayo 2026','2026-05-18 05:22:00','2026-06-18 11:50:43'),(10,2026,6,'2026-05-15','2026-06-14','CERRADO','Periodo de facturación Junio 2026','2026-06-18 11:50:43','2026-07-15 14:28:28'),(11,2026,7,'2026-06-15','2026-07-15','ABIERTO',NULL,'2026-07-15 14:28:52',NULL);
/*!40000 ALTER TABLE `periodos` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'dashboard.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(2,'periodos.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(3,'periodos.crear','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(4,'periodos.cerrar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(5,'inquilinos.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(6,'inquilinos.crear','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(7,'inquilinos.editar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(8,'inquilinos.eliminar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(9,'unidades.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(10,'unidades.crear','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(11,'unidades.editar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(12,'ocupaciones.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(13,'ocupaciones.crear','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(14,'ocupaciones.finalizar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(15,'lecturas.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(16,'lecturas.registrar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(17,'lecturas.sincronizar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(18,'recibo.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(19,'recibo.crear','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(20,'recibo.editar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(21,'liquidacion.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(22,'liquidacion.generar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(23,'liquidacion.recalcular','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(24,'cobros.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(25,'cobros.generar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(26,'cobros.forzar_actualizacion','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(27,'cobros.pagos.registrar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(28,'cobros.pagos.reversar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(29,'cobros.pagos.anular','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(30,'avisos.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(31,'avisos.enviar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(32,'tarifas.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(33,'tarifas.editar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(34,'config_cobranza.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(35,'config_cobranza.editar','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(36,'usuarios.ver','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(37,'usuarios.crear','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(38,'usuarios.asignar_rol','web','2026-07-22 08:20:46','2026-07-22 08:20:46');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personas`
--

LOCK TABLES `personas` WRITE;
/*!40000 ALTER TABLE `personas` DISABLE KEYS */;
INSERT INTO `personas` VALUES (1,'INQUILINO','Jeferson','Bujaico Rodriguez','DNI','70000001','999111111','jeferson@example.com',NULL,NULL,'ACTIVO','2026-03-22 19:53:38','2026-03-22 22:12:56'),(2,'INQUILINO','Milena','Ramirez','DNI','70000002','956733335','milena@example.com',NULL,NULL,'ACTIVO','2026-03-22 19:53:38','2026-03-22 22:16:23'),(3,'INQUILINO','Adolfo','Belen Sanchez','DNI','70000003','944809326','chamo@example.com',NULL,NULL,'ACTIVO','2026-03-22 19:53:38','2026-03-22 22:14:33'),(4,'INQUILINO','Juan','Dios Quispe','DNI','70000004','999111114','luis.quispe@example.com',NULL,NULL,'INACTIVO','2026-03-22 19:53:38','2026-07-15 15:12:28'),(5,'INQUILINO','Jim','Manihuari','DNI','70000005','999111115','kevin@example.com',NULL,NULL,'ACTIVO','2026-03-22 19:53:38','2026-03-22 22:17:16'),(6,'INQUILINO','Jose Luis','Arena C.','DNI','70000055','999111116','jose.luis@example.com',NULL,'asdasd','ACTIVO','2026-03-22 19:53:38','2026-03-23 02:02:53'),(7,'INQUILINO','Richard','Uribe','DNI','70000007','999111117','richard.uribe@example.com',NULL,NULL,'ACTIVO','2026-03-22 19:53:38',NULL),(8,'INQUILINO','Julio','Manihuari','DNI','99999999','958563245','julio.manihuari@gmail.com',NULL,NULL,'INACTIVO','2026-03-22 22:18:19','2026-07-15 15:12:23'),(9,'INQUILINO','asd','asd','CE','asd','asd','asd','asd','asd','INACTIVO','2026-03-23 02:03:04','2026-03-23 02:03:25'),(28,'INQUILINO','Adrian','Chamo','DNI','12345678','959564587','adrian@gmail.com',NULL,'Se fue','ACTIVO','2026-03-24 08:25:45','2026-03-24 09:30:04'),(30,'INQUILINO','Miguel','Peruano','DNI','12345672','951268357','miguel@gmail.com',NULL,'Se fue','ACTIVO','2026-03-24 08:26:21',NULL),(31,'INQUILINO','Jackeline','Alvarez Juanama','DNI','76017348','asasd','personal@gmail.com','Asoc. Pequeños Co-Propietarios Mz A Lt 1','Inquilina del Cuarto 5A','ACTIVO','2026-04-17 17:12:47','2026-04-17 18:32:28'),(33,'INQUILINO','Christian','Moya Giron','DNI','77645486','123456789','asdasd@gmail.com','Asoc. Pequeños CoPropietarios Mz A Lt1','Todo bien','ACTIVO','2026-06-18 07:27:02','2026-07-19 20:49:01');
/*!40000 ALTER TABLE `personas` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `recibos_luz`
--

LOCK TABLES `recibos_luz` WRITE;
/*!40000 ALTER TABLE `recibos_luz` DISABLE KEYS */;
INSERT INTO `recibos_luz` VALUES (1,1,1,'REC-MAR-2026-001','1723684','2026-03-17','2026-04-01',30513.70,30795.40,281.70,0.5814,163.78,2.16,1.61,10.43,177.98,32.04,3.10,0.08,0.00,213.20,'Recibo MARZO 2026 - Luz del Sur','ACTIVO','2026-03-22 19:53:38','2026-04-17 14:13:16'),(2,1,2,'REC-FEB-2026-002','1723684','2026-02-18','2026-03-15',30236.70,30513.70,277.00,0.5958,277.00,2.17,1.62,10.75,179.58,32.33,3.05,0.02,-0.08,214.90,'Recibo FEBRERO 2026 - Luz del Sur','INACTIVO','2026-03-22 22:32:29','2026-03-24 09:08:40'),(5,1,6,'REC-ENE-2026-006','1723684','2026-01-17','2026-01-30',29932.40,30236.70,304.30,0.6018,304.30,2.18,1.62,15.05,201.98,36.35,3.35,0.04,-0.02,241.70,'Recibo ENERO 2026 - Luz del Sur','ACTIVO','2026-03-24 08:34:11','2026-03-24 09:08:23'),(6,1,8,'REC-ABR-2026-008','1723684','2026-04-15','2026-05-02',30795.40,31058.40,263.00,0.5832,153.38,2.19,1.64,10.43,167.64,30.18,2.89,0.00,-0.01,200.70,'Lectura del mes de Abril 2026','ACTIVO','2026-04-17 17:20:32',NULL),(7,1,9,'REC-MAY-2026-009','1723684','2026-05-14','2026-05-31',31058.40,31316.30,257.90,0.5972,154.02,2.26,1.68,10.43,168.39,30.31,2.84,0.01,-0.05,201.50,'Lectura del mes de Mayo 2026','ACTIVO','2026-05-18 05:25:06','2026-05-18 06:01:23'),(8,1,10,'REC-JUN-2026-010','1723684','2026-05-14','2026-06-30',31316.30,31574.00,257.70,0.6134,158.07,2.27,1.69,11.80,173.83,31.29,2.83,0.05,-0.06,207.94,'Lectura del mes de Mayo 2026','ACTIVO','2026-06-18 11:51:40','2026-06-18 11:56:56'),(9,1,11,'REC-JUL-2026-011','1723684','2026-07-17','2026-07-31',31574.00,31852.20,278.20,0.6130,170.54,2.26,1.68,12.60,187.08,33.67,3.06,0.09,0.00,223.90,NULL,'ACTIVO','2026-07-19 19:49:45','2026-07-21 21:42:16');
/*!40000 ALTER TABLE `recibos_luz` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `role_has_permissions`
--

LOCK TABLES `role_has_permissions` WRITE;
/*!40000 ALTER TABLE `role_has_permissions` DISABLE KEYS */;
INSERT INTO `role_has_permissions` VALUES (1,1),(1,2),(2,1),(2,2),(3,1),(4,1),(5,1),(5,2),(6,1),(7,1),(8,1),(9,1),(9,2),(10,1),(11,1),(12,1),(12,2),(13,1),(14,1),(15,1),(15,2),(16,1),(16,2),(17,1),(17,2),(18,1),(18,2),(19,1),(20,1),(21,1),(21,2),(22,1),(23,1),(24,1),(24,2),(25,1),(26,1),(27,1),(27,2),(28,1),(29,1),(30,1),(30,2),(31,1),(32,1),(32,2),(33,1),(34,1),(34,2),(35,1),(36,1),(36,2),(37,1),(38,1);
/*!40000 ALTER TABLE `role_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','web','2026-07-22 08:20:46','2026-07-22 08:20:46'),(2,'Supervisor','web','2026-07-22 08:20:46','2026-07-22 08:20:46');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('5n2NvFU67bzL7rLrWfLLRvpzbSNOtQgIOEcOtydM',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/148.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJrMkNPTDZ2U3hTeVBHMXp5UGJiMlU1dVJPdjFqcWlMenhNaWRxbmI1IiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==',1784690788),('cfntvOjjvGHWv15xFq4HSlHA82R56GRwacgzd7Az',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/148.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJjajFnTExDWlhyU3l1YVdKOEN1SllYSGkzT3FZeHBBOGJtVUl2Um5oIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC91bmlkYWRlcyIsInJvdXRlIjoidW5pZGFkZXMuaW5kZXgifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6MX0=',1784692018),('fnA6MYNrGMRbgNFjptJeUOko6LxfBrOKAXy9AJnM',NULL,'127.0.0.1','curl/7.75.0','eyJfdG9rZW4iOiI4RWtuSUV1RGR3SUN3M3EwSFVybVU0UDhlUVN4bHZzQ1Zub1k0NmdOIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==',1784691988),('H56i49KAvhwlKE3FUVTLQofR16Jc11K5C0n6qq7X',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/148.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJkN0h6SVNmOGk4aW5oOE9XdldUQVRYOHpiZUhYZWxOTkZNbzl0bEFKIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6MX0=',1784690871),('q2XRWXx0O6IpcTmz5GqBawHPnFbw8gVEZNU2SpPO',NULL,'127.0.0.1','curl/7.75.0','eyJfdG9rZW4iOiJwcFJXVFJRdWxaUGRhZmpjWGlCUjVFRVV6czJCeHVZR1pxdjBXZWFOIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==',1784690654),('SxZOHrfmZi6fKMdc7tqP6Mo2cxbOfbodsnD9HKCs',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/148.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJ4V3lHWFh5SENwWTBqTHFNRE5ibkRvd05SOTg4bXNNeko3WU82clVaIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9yZWNpYm8iLCJyb3V0ZSI6InJlY2liby5pbmRleCJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX0sImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjoxfQ==',1784692491),('uLjz6Kn5lMQK6vTdxyba3nHBNHwXjyvIUtrJEpvf',NULL,'127.0.0.1','curl/7.75.0','eyJfdG9rZW4iOiJSOHp3MjVrZUNqOTYxbWttVXRmcnUyUDByNHZvZEJhWXhRVkpZWGdCIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==',1784692463);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `tarifas_auditoria`
--

LOCK TABLES `tarifas_auditoria` WRITE;
/*!40000 ALTER TABLE `tarifas_auditoria` DISABLE KEYS */;
INSERT INTO `tarifas_auditoria` VALUES (1,1,'ACTUALIZADO','ADMIN_UI','{\"id_tarifa\":1,\"id_inmueble\":1,\"servicio\":\"AGUA\",\"descripcion\":\"Servicio de agua mensual por unidad\",\"monto\":\"30.00\",\"por_unidad\":1,\"activo\":1,\"created_at\":\"2026-03-22 23:18:03\",\"updated_at\":\"2026-03-22 23:25:41\"}','{\"id_tarifa\":1,\"id_inmueble\":1,\"servicio\":\"AGUA\",\"descripcion\":\"Servicio de agua mensual por unidad\",\"monto\":\"40.00\",\"por_unidad\":1,\"activo\":1,\"created_at\":\"2026-03-22 23:18:03\",\"updated_at\":\"2026-06-18 12:08:54\"}','2026-06-18 12:08:54');
/*!40000 ALTER TABLE `tarifas_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `tarifas_servicios`
--

LOCK TABLES `tarifas_servicios` WRITE;
/*!40000 ALTER TABLE `tarifas_servicios` DISABLE KEYS */;
INSERT INTO `tarifas_servicios` VALUES (1,1,'AGUA','Servicio de agua mensual por unidad',40.00,1,1,'2026-03-22 23:18:03','2026-06-18 12:08:54'),(2,1,'GAS','Servicio de gas mensual por unidad',0.00,1,1,'2026-03-22 23:18:03','2026-03-22 23:18:03'),(3,1,'MANTENIMIENTO','Mantenimiento y limpieza por unidad',0.00,1,1,'2026-03-22 23:18:03','2026-05-18 06:55:55');
/*!40000 ALTER TABLE `tarifas_servicios` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidades`
--

LOCK TABLES `unidades` WRITE;
/*!40000 ALTER TABLE `unidades` DISABLE KEYS */;
INSERT INTO `unidades` VALUES (1,1,'101','Primer Piso - Jeferson',1,'DEPARTAMENTO','SI','MED-101',0.00,'Unidad primer piso','ACTIVO','2026-03-22 19:53:38','2026-03-22 23:33:54'),(2,1,'201','Segundo Piso 1A',2,'CUARTO','SI','MED-201',180.00,'Milena','ACTIVO','2026-03-22 19:53:38','2026-03-22 21:31:10'),(3,1,'202','Segundo Piso 2A',2,'CUARTO','SI','MED-202',180.00,'Julio papa de GIN','ACTIVO','2026-03-22 19:53:38','2026-03-22 22:01:24'),(4,1,'203','Segundo Piso 3A',2,'CUARTO','SI','MED-203',180.00,'Adolfo Belen Sanchez','ACTIVO','2026-03-22 19:53:38','2026-03-22 22:02:58'),(5,1,'204','Segundo Piso 4A',2,'CUARTO','SI','MED-204',180.00,'Juan Dios Quispe','ACTIVO','2026-03-22 19:53:38','2026-03-22 22:03:34'),(6,1,'205','Segundo Piso 5A',2,'CUARTO','SI','MED-205',180.00,'Era almacen anterior','ACTIVO','2026-03-22 19:53:38','2026-03-22 22:04:02'),(7,1,'206','Segundo Piso 1B',2,'CUARTO','SI','MED-206',180.00,'Almacen Nuevo','ACTIVO','2026-03-22 19:53:38','2026-03-22 22:04:35'),(8,1,'207','Segundo Piso 2B',2,'CUARTO','SI','MED-207',180.00,'Donde se encuentra la cocina','ACTIVO','2026-03-22 19:53:38','2026-03-22 22:06:05'),(9,1,'208','Segundo Piso 3B',2,'CUARTO','SI','MED-208',180.00,'José Luis','ACTIVO','2026-03-22 19:53:38','2026-03-22 22:05:46'),(10,1,'209','Segundo Piso 4B',2,'CUARTO','SI','MED-209',180.00,'Richard Uribe','ACTIVO','2026-03-22 19:53:38','2026-03-22 22:08:31'),(11,1,'301','Tercer Piso 1A',2,'DEPARTAMENTO','SI','MED-301',700.00,'Medidor de un departamento de Nancy','ACTIVO','2026-03-22 19:53:38','2026-03-22 22:09:04'),(12,1,'302','Tercer Piso 1B',3,'DEPARTAMENTO','SI','MED-302',600.00,'Departamento','ACTIVO','2026-03-22 22:08:01','2026-07-19 20:49:45'),(13,1,'401','Cuarto Piso 1B',4,'CUARTO','SI','MED-401',180.00,'Cuarto de JIM','ACTIVO','2026-03-22 22:10:50',NULL),(14,1,'402','Cuarto Piso',4,'CUARTO','SI','MED-402',180.00,'El otro lado de JIM','ACTIVO','2026-03-22 22:12:19',NULL);
/*!40000 ALTER TABLE `unidades` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidades_medidor_compartido`
--

LOCK TABLES `unidades_medidor_compartido` WRITE;
/*!40000 ALTER TABLE `unidades_medidor_compartido` DISABLE KEYS */;
/*!40000 ALTER TABLE `unidades_medidor_compartido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Jeferson Bujaico','jefersonbujaico@gmail.com',NULL,'$2y$12$YQBSQuDnPjNrapObptVA0O6POEeTc9YhJgR7umUcAnCNuf2PbIj42',NULL,'2026-07-22 08:20:46','2026-07-22 08:20:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

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

-- Dump completed on 2026-07-21 23:18:56
