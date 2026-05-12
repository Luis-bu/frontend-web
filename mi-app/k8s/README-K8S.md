# ProcessFlow — Despliegue en Kubernetes local

La aplicación se desplegó en Kubernetes local usando dos Deployments: uno para el frontend Angular servido con Nginx y otro para el backend Spring Boot. La base de datos PostgreSQL se mantiene externa y sus credenciales se inyectan mediante Kubernetes Secrets. El frontend se expone con NodePort 30080 y el backend con NodePort 30081.

---

## 1. Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y ejecutándose
- Kubernetes **activado** en Docker Desktop → Settings → Kubernetes → Enable Kubernetes
- `kubectl` disponible (viene incluido con Docker Desktop)

---

## 2. Verificar que Kubernetes está activo

```bash
kubectl get nodes
```

Debe mostrar un nodo con estado `Ready`.

---

## 3. Crear el Secret con credenciales reales

```bash
cp k8s/backend-secret.example.yaml k8s/backend-secret.yaml
```

Edita `k8s/backend-secret.yaml` y reemplaza los valores con tus credenciales reales:

```yaml
stringData:
  DB_URL: "jdbc:postgresql://TU_HOST:TU_PORT/TU_BD"
  DB_USERNAME: "tu_usuario"
  DB_PASSWORD: "tu_contraseña"
  MAIL_USERNAME: "tu_correo@gmail.com"
  MAIL_PASSWORD: "tu_app_password"
```

> **IMPORTANTE:** `backend-secret.yaml` está en `.gitignore` y nunca se sube al repositorio.

---

## 4. Construir las imágenes Docker

Ejecuta los siguientes comandos desde la carpeta `frontend-web/mi-app`:

```bash
# Backend (desde frontend-web/mi-app)
docker build -t processflow-backend:latest ../../BackendWeb/backend-web

# Frontend (desde frontend-web/mi-app)
docker build -t processflow-frontend:latest .
```

Verifica que las imágenes quedaron disponibles:

```bash
docker images | grep processflow
```

---

## 5. Aplicar los manifests en Kubernetes

```bash
kubectl apply -f k8s/backend-secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

---

## 6. Verificar que los pods están corriendo

```bash
kubectl get pods
kubectl get services
```

Espera a que los pods muestren estado `Running`. Puede tardar 1-2 minutos la primera vez.

---

## 7. Probar la aplicación

| Componente | URL |
|---|---|
| Frontend | http://localhost:30080 |
| Backend (health check) | http://localhost:30081/api/empresas |

---

## 8. Ver logs

```bash
# Logs del backend
kubectl logs deployment/processflow-backend

# Logs del frontend (Nginx)
kubectl logs deployment/processflow-frontend
```

---

## 9. Reiniciar un deployment

```bash
kubectl rollout restart deployment/processflow-backend
kubectl rollout restart deployment/processflow-frontend
```

---

## 10. Borrar todo

```bash
kubectl delete -f k8s/frontend-service.yaml
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/backend-service.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/backend-secret.yaml
```

---

## 11. Qué mostrar en la sustentación

```bash
# Mostrar nodos y pods activos
kubectl get nodes
kubectl get pods
kubectl get services

# Mostrar imágenes locales construidas
docker images | grep processflow
```

- Frontend funcionando en **http://localhost:30080**
- Backend respondiendo en **http://localhost:30081/api/empresas**

---

## 12. Solución de problemas

### Pod en `CrashLoopBackOff` o `Error`

```bash
# Ver el error exacto
kubectl logs deployment/processflow-backend
kubectl describe pod -l app=processflow-backend
```

Causas comunes:

| Síntoma en logs | Causa | Solución |
|---|---|---|
| `Connection refused` a la BD | Credenciales incorrectas o BD no accesible | Editar `backend-secret.yaml` y re-aplicar |
| `ImagePullBackOff` | Imagen no encontrada localmente | Re-ejecutar `docker build` |
| `CrashLoopBackOff` sin logs | Imagen construida con error | Revisar el build con `docker run processflow-backend:latest` |
| Frontend carga pero no llama al backend | `apiUrl` incorrecto | Verificar que `environment.ts` apunta a `http://localhost:30081/api` |

### Re-aplicar el secret después de editarlo

```bash
kubectl delete secret processflow-backend-secret
kubectl apply -f k8s/backend-secret.yaml
kubectl rollout restart deployment/processflow-backend
```
