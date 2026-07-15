# Opciones de hosting gratuito para Alquileres App

Guía de opciones evaluadas para sacar esta app (PHP + MySQL) de XAMPP local y ponerla accesible en internet, sin costo. Se divide en dos grupos: **hosting real** (la app vive en un servidor de terceros) y **túneles** (tu XAMPP local sigue corriendo, solo se expone temporalmente a internet — como se hacía antes con ngrok).

## Hosting real (PHP + MySQL en un servidor)

### InfinityFree
- **Descripción:** hosting compartido clásico tipo cPanel, gratis de por vida, con PHP + MySQL incluidos.
- **Pros:** migración casi directa desde XAMPP (exportas la base, subes los archivos por FTP tal cual están en `htdocs`); sin límite de tiempo; sin tarjeta de crédito.
- **Contras:** sin acceso SSH; recursos compartidos limitados (puede sentirse lento bajo carga); a veces bloquean cuentas si detectan uso "tipo producción" con mucho tráfico.
- **Mejor para:** subir la app ya mismo para probarla en internet o compartirla con el propietario/inquilinos sin tocar el código.

### 000webhost (Hostinger)
- **Descripción:** hosting gratuito PHP + MySQL de Hostinger.
- **Pros:** panel simple, fácil de usar, soporte oficial de una empresa grande.
- **Contras:** límite de almacenamiento bajo (~300MB); el sitio se "duerme" si no tiene visitas; agrega banner propio en algunos planes.
- **Mejor para:** demos rápidas o portafolio, no para uso diario real con datos importantes.

### AwardSpace / ByetHost
- **Descripción:** hosting gratuito PHP + MySQL, alternativas más antiguas al estilo InfinityFree.
- **Pros:** gratis, con panel de control y bases de datos incluidas.
- **Contras:** límites de recursos más agresivos, publicidad, soporte más limitado, uptime menos confiable.
- **Mejor para:** respaldo si InfinityFree/000webhost fallan o están saturados.

### Oracle Cloud "Always Free"
- **Descripción:** te da una o varias VMs reales gratis **para siempre** (hasta 4 OCPU / 24GB RAM en arquitectura ARM Ampere), donde instalas tu propio LAMP (Apache/Nginx + PHP + MySQL) — básicamente tu XAMPP pero en un servidor real 24/7.
- **Pros:** el más generoso en recursos; sin sleep ni límite de tráfico; control total del servidor.
- **Contras:** requiere tarjeta para verificar identidad (no cobra si no sales del free tier); a veces la capacidad ARM gratuita no está disponible en tu región al crear la cuenta; requiere que sepas administrar un servidor Linux (instalar y configurar Apache/PHP/MySQL a mano).
- **Mejor para:** cuando quieras dejar de depender de XAMPP local definitivamente y tener rendimiento serio, sin pagar.

### Google Cloud "Always Free" (e2-micro)
- **Descripción:** una VM pequeña gratis para siempre en regiones específicas de EE.UU., más 30GB de disco.
- **Pros:** igual de "para siempre" que Oracle, buena integración si ya usas otros servicios de Google.
- **Contras:** la VM es bastante más chica que la de Oracle (recursos limitados); también requiere tarjeta y administrar el servidor tú mismo.
- **Mejor para:** alternativa a Oracle si esa no tiene capacidad disponible en tu región.

### Render.com + base de datos externa
- **Descripción:** plataforma moderna con despliegue automático desde GitHub.
- **Pros:** muy fácil de conectar con un repo y que se actualice solo en cada push; buena documentación.
- **Contras:** no ofrece MySQL gratis (solo Postgres gratis); el servicio web gratuito "se duerme" tras 15 minutos sin uso y tarda unos segundos en despertar; tendrías que adaptar el backend a Postgres o conectar una MySQL externa (Clever Cloud, Aiven trial).
- **Mejor para:** si en algún momento decides modernizar el despliegue con CI/CD automático y no te molesta migrar de MySQL a Postgres.

### Fly.io
- **Descripción:** plataforma con asignación gratuita (3 VMs compartidas pequeñas) donde corres contenedores Docker.
- **Pros:** puedes correr PHP + MySQL en el mismo contenedor/volumen persistente; buen rendimiento para el tier gratis; sin sleep.
- **Contras:** requiere saber Docker (no hay buildpack automático de PHP); configuración más técnica que las demás opciones; requiere tarjeta.
- **Mejor para:** si ya sabes o quieres aprender Docker y prefieres más control que un hosting compartido tradicional.

### Railway
- **Descripción:** plataforma similar a Render/Heroku.
- **Pros:** experiencia de desarrollador muy pulida, deploy con un clic desde GitHub.
- **Contras:** ya **no tiene tier gratuito indefinido** — solo da un crédito de prueba (~$5) que se agota; después hay que pagar.
- **Mejor para:** pruebas cortas o evaluarla antes de decidir pagar; no para dejarla como hosting permanente gratis.

### Replit
- **Descripción:** IDE en la nube que también permite alojar el proyecto (parecido en espíritu a lo que era Cloud9, pero con hosting incluido).
- **Pros:** todo en el navegador, cero instalación, soporta PHP vía Nix.
- **Contras:** los proyectos gratuitos "duermen" si no tienen actividad; recursos limitados; no pensado para producción real.
- **Mejor para:** prototipar o mostrar la app desde cualquier dispositivo sin instalar nada.

### Heroku (nota histórica)
- **Descripción:** fue la opción más popular de este tipo durante años.
- **Estado actual:** eliminó por completo su tier gratuito en noviembre 2022. Se menciona solo para que no la busques esperando que siga siendo gratis.

## Túneles (exponer tu XAMPP local, sin migrar nada)

Esta opción no reemplaza tu servidor: sigue siendo tu PC con XAMPP corriendo, solo se le da una URL pública temporal. Es el enfoque que ya conocías con **ngrok**.

### ngrok
- **Descripción:** crea un túnel desde una URL pública (`https://algo.ngrok-free.app`) hacia tu `localhost` de XAMPP.
- **Pros:** funciona en minutos, HTTPS automático, muy conocido y bien documentado.
- **Contras:** en el plan gratis la URL cambia cada vez que reinicias el túnel (a menos que pagues por una URL fija); límite de conexiones/ancho de banda; tu PC tiene que estar prendida y XAMPP corriendo todo el tiempo que quieras que funcione.
- **Mejor para:** mostrarle la app a alguien puntualmente (ej. una demo al propietario) sin desplegar nada.

### Cloudflare Tunnel (cloudflared)
- **Descripción:** alternativa gratuita de Cloudflare al mismo concepto de ngrok.
- **Pros:** completamente gratis sin límite de tiempo de uso; si tienes un dominio propio puedes darle una URL fija y estable; muy estable en general.
- **Contras:** configuración inicial un poco más técnica que ngrok; igual depende de que tu PC esté encendida.
- **Mejor para:** reemplazo directo y gratuito de ngrok si necesitas algo más permanente que una demo puntual.

### LocalTunnel
- **Descripción:** herramienta open-source, más simple, mismo concepto.
- **Pros:** instalación con un solo comando (`npx localtunnel`), sin necesidad de crear cuenta.
- **Contras:** menos estable que ngrok/Cloudflare, URLs públicas compartidas a veces se caen o son lentas.
- **Mejor para:** pruebas rápidas de un momento, sin siquiera registrarte en un servicio.

## Recomendación para este proyecto

Dado que la app ya es PHP + MySQL tal cual XAMPP la corre hoy:

1. **Corto plazo / probarla ya:** InfinityFree — subir tal cual, sin cambiar código.
2. **Mediano/largo plazo, uso real:** Oracle Cloud Always Free — mismo stack (LAMP), gratis para siempre, sin los límites de un hosting compartido.
3. **Para una demo puntual sin desplegar nada:** Cloudflare Tunnel (o ngrok si ya lo tienes configurado) apuntando a tu XAMPP local.
