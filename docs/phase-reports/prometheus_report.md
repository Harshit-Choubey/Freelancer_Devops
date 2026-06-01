# Phase Report: Prometheus

## 1. Objective
Establish the foundational observability stack for GigMatrix by integrating Prometheus, enabling metrics collection from the Node.js API with strict resource constraints.

## 2. Architecture Changes
- Added a `prometheus` container to Docker Compose.
- Remapped internal NGINX healthcheck from IPv6 loopback to IPv4.
- Converted the `gigmatrix-api` `/monitoring/metrics` endpoint from JSON to Prometheus OpenMetrics exposition format.
- Implemented strict memory (`mem_limit: 256m`) and TSDB retention limits.

## 3. Files Added
- `docker/prometheus/prometheus.yml`

## 4. Files Modified
- `docker-compose.yml`
- `docker/Dockerfile.frontend`
- `src/monitoring/health.js`

## 5. Branch Used
`feature/prometheus`

## 6. Commit Hash
*(See subsequent commit)*

## 7. Commands Executed
```bash
docker exec gigmatrix-nginx wget -qO- http://127.0.0.1:80/
docker compose build nginx
docker compose up -d nginx
docker compose build api
docker compose up -d api
docker compose up -d prometheus
```

## 8. Validation Results
- **UI:** Validated successfully at `localhost:9090`
- **Targets:** `prometheus` and `api` both report `UP`
- **Compose Stability:** Clean
- **Regression Tests:** Auth, Jobs, Chat, and Infra flows passed.

## 9. Evidence Collected
- Checked `/api/v1/targets` and validated `scrapePool` states.
- Checked `systeminfo` memory profiling.

## 10. Rollback Point
**Tag:** `PHASE_CHECKPOINT`

## 11. Kubernetes Compatibility Notes
- Uses explicit `mem_limit` which translates easily to K8s `resources.limits.memory`.
- Config uses native DNS routing (`api:3000`) compatible with K8s CoreDNS.
- Liveness/Readiness endpoints preserved.
