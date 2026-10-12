# Publicar la agenda

GitHub Pages solo publica archivos estáticos: no ejecuta `GestionAdmin/server.py`. La página necesita una API Python publicada por separado para consultar y guardar turnos.

## Publicar el servidor de agenda

Usa un servicio de hosting para Python que permita configurar variables de entorno y montar almacenamiento persistente. En el servicio configura:

- Comando de inicio: `python GestionAdmin/server.py`
- `HOST`: `0.0.0.0`
- `PORT`: el puerto asignado por el proveedor. El servidor usa `8000` localmente si esta variable no existe.
- `MARCI_DATA_DIR`: ruta del disco o volumen persistente, por ejemplo `/var/data`.
- `MARCI_ALLOWED_ORIGIN`: el origen del sitio de GitHub Pages, por ejemplo `https://usuario.github.io`. Es solo esquema y dominio, sin `/repositorio`.

El disco debe ser persistente: sin él, las reservas podrían desaparecer al reiniciarse el servidor. Conserva la misma carpeta de datos al actualizar el servicio.

## Conectar GitHub Pages con la API

Copia el dominio público HTTPS del servicio Python y configúralo en `index.html`:

```html
<meta name="marci-api-url" content="https://TU-SERVIDOR.example.com">
```

No agregues `/api/appointments` al valor; la página concatena esa ruta automáticamente. Publica de nuevo los cambios de GitHub Pages. El origen configurado en `MARCI_ALLOWED_ORIGIN` debe coincidir con el dominio de GitHub Pages para que el navegador permita la conexión.

En local, deja el contenido del meta vacío; la página continuará usando el servidor local en `/api/appointments`.
