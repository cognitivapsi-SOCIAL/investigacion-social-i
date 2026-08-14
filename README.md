# Investigación Social I — V8 Cloud Run + Classroom

Lista para repositorio y Cloud Run.

1. Suba todos estos archivos a un repositorio.
2. Despliegue el repositorio en Cloud Run.
3. Copie la URL HTTPS resultante.
4. Registre esa URL como Origen JavaScript autorizado en el cliente OAuth V8.
5. Edite `app.js` y coloque SOLO el ID de cliente en `CLASSROOM_CONFIG.OAUTH_CLIENT_ID`.
6. No coloque nunca el secreto OAuth en GitHub ni en `app.js`.
7. Vuelva a desplegar.

La primera integración usa únicamente:
`https://www.googleapis.com/auth/classroom.courses.readonly`

Permite consultar cursos activos y seleccionar el curso que se vinculará con la plataforma.
