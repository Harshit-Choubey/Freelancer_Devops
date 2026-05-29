# cAdvisor Integration Report

## 1. Objective
Deploy `cAdvisor` into the GigMatrix cloud-native stack to collect real-time container resource metrics (CPU, Memory, Network) and expose them to Prometheus without violating memory constraints.

## 2. Architecture Changes
- Integrated `gcr.io/cadvisor/cadvisor:v0.47.0` into `docker-compose.yml`.
- Configured Prometheus to scrape `cadvisor:8080`.
- Applied strict `128m` memory limits.
- Configured host-level read-only mounts.

## 3. Files Added
- `docs/phase-reports/cadvisor_*`

## 4. Files Modified
- `docker-compose.yml`
- `docker/prometheus/prometheus.yml`

## 5. Branch Used
`feature/cadvisor`

## 6. Commit Hash
*(See subsequent commit)*

## 7. Commands Executed
```bash
docker compose -p pathpilot down
docker compose up -d cadvisor
docker restart gigmatrix-prometheus
```

## 8. Validation Results
- **cAdvisor Container:** Healthy and running on port 8081.
- **Prometheus Targeting:** `cadvisor` is UP.
- **Prometheus Queries:** Successfully returning `container_memory_usage_bytes` and `container_cpu_usage_seconds_total`.
- **System Stability:** Clean `docker compose ps` with 0 restarts.

## 9. Screenshots Required
- Prometheus Targets dashboard showing cAdvisor UP.
- Prometheus Query executing `container_memory_usage_bytes`.
- cAdvisor standalone dashboard at `localhost:8081`.

## 10. Rollback Point
**Tag:** `CADVISOR_CHECKPOINT`

## 11. Kubernetes Compatibility Notes
- Will translate to a DaemonSet using `hostPath` mounts for `/rootfs`, `/var/run`, `/sys`, and `/var/lib/docker`.
- `mem_limit` directly translates to `resources.limits`.
