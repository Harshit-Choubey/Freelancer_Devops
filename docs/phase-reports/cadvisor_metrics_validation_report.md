# cAdvisor Metrics Validation Report

## Execution Results

**Query: `up`**
- `api` = 1
- `prometheus` = 1
- `cadvisor` = 1

**Query: `container_memory_usage_bytes`**
- Verified: Metrics for GigMatrix containers (e.g., `gigmatrix-api`, `gigmatrix-nginx`, `gigmatrix-mongo`) are visible and populating.

**Query: `container_cpu_usage_seconds_total`**
- Verified: CPU usage seconds are successfully scraped for all containers.

**Query: `container_network_receive_bytes_total`**
- Verified: Network ingress bytes are tracking successfully per container.

**STATUS: SUCCESS.** Prometheus is successfully ingesting Docker daemon metrics via cAdvisor.
