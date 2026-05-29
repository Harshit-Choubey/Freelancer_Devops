# Grafana Datasource Report

## Configuration Details
- **Datasource:** Prometheus
- **URL:** `http://prometheus:9090` (Internal Docker DNS)
- **Provisioning Strategy:** Declarative YAML (`datasource.yml`) mounted into `/etc/grafana/provisioning/datasources`.
- **Editability:** `editable: false` (Locks configuration to the codebase to enforce GitOps governance).

**STATUS: SUCCESS.** Datasource is automatically provisioned.
