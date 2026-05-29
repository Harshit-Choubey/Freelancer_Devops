# Prometheus & cAdvisor Integration Report

## Configuration
Added the `cadvisor` scrape job to `docker/prometheus/prometheus.yml`:
```yaml
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

## Internal Networking
- Prometheus accesses cAdvisor via Docker's internal DNS (`cadvisor:8080`).
- No public port exposure is required for Prometheus to scrape cAdvisor.

**STATUS: SUCCESS.** Configuration injected and Prometheus restarted.
