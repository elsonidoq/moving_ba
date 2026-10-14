# Buenos Aires te mueve — mockup fotográfico v7

## Abrir el mockup

1. Abrí **`index.html`** con Chrome, Safari o Firefox.
2. Las fotos se cargan de Pexels cuando hay conexión. No dependen de librerías JS ni de servicios de la aplicación.
3. **Para guardar las fotografías en archivos separados y abrir el mockup sin conexión**, ejecutá desde esta carpeta:

   ```bash
   python3 descargar_fotos.py
   ```

   El programa descarga **29 fotografías** en `assets/photos/`. El HTML prefiere automáticamente esos archivos locales y usa sus direcciones remotas solo mientras todavía no están descargados.

## Contenido

- `index.html` — mockup interactivo (HTML, CSS y JS sin dependencias).
- `assets/image_manifest.json` — foto asignada a cada deporte, clase, ejercicio y escena, con **URL de fuente** y de descarga.
- `assets/photos/` — carpeta de fotografías (se llena al ejecutar el descargador).
- `galeria_fotos.html` — catálogo visual de las 29 fotografías con enlaces a las fuentes.
- `fuentes_fotos.csv` — tabla simple para el coding agent con cada imagen y su origen.
- `descargar_fotos.py` — descarga reproducible de los assets.

## Flujo que podés probar

1. Bienvenida → onboarding (elegir una de las tres situaciones) → Inicio.
2. Calistenia / Yoga / Natación → **Entrenar por mi cuenta** → cinco ejercicios diferentes → sesión completada.
3. Deporte → **Sumarme a una clase** → elegir clase concreta → "Voy a ir" → confirmación → Inicio y próxima clase.
4. Círculo del perfil → historial / logros / desafíos → cuatro escenarios: entrenamiento sostenido, volver después de una pausa, dejó de entrenar y de usar la app, y pensaba ir a clase pero no fue.
5. Los últimos dos escenarios: notificación → conversación con respuestas predefinidas → próximo paso.
6. "Volver a hoy" retira la simulación; no cambia registros reales. La tarjeta "Tu próxima clase" se oculta mientras se exploran escenarios.

## Alcance y fuentes

El contenido de clases y horarios es ilustrativo. No existen reservas, notificaciones ni verificaciones de asistencia reales. El objetivo es visualizar el producto.

Todas las fotografías son referencias de Pexels, con enlaces a sus páginas originales y descripción en `assets/image_manifest.json`. Revisar la **[licencia de Pexels](https://www.pexels.com/license/)** antes de redistribuirlas o reutilizarlas en un producto público. El set fotográfico fue elegido por su **correspondencia explícita con el ejercicio** descrito en cada tarjeta.

> Nota técnica: este entorno no permitió descargar los archivos externos; por eso el ZIP contiene el manifiesto y el descargador además del HTML, y la versión online usa directamente las URL de Pexels. Cualquier máquina con acceso a internet puede completar la carpeta con un solo comando.
