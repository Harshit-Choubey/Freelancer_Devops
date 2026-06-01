# Trivy Security Architecture Report

## Architecture Overview
Trivy is integrated as a **purely ephemeral, containerized scanner** — it runs as a short-lived `docker run --rm` container and exits completely after each scan. Zero persistent containers, zero persistent RAM footprint.

## Scan Modes Implemented
| Mode | Target | Command Pattern |
|---|---|---|
| **Filesystem Scan** | Repository source code & dependencies | `docker run --rm -v $PWD:/project aquasec/trivy fs /project` |
| **Image Scan** | `gigmatrix-api`, `gigmatrix-nginx` | `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image <name>` |

## Detection Capabilities
- **Vulnerabilities:** OS packages, language-specific libraries (npm, pip, etc.)
- **Misconfigurations:** Dockerfile issues, K8s YAML issues, Terraform issues
- **Secrets:** Hardcoded tokens, API keys, passwords in source files

## Future CI/CD Integration Points
```
GitHub Actions (NOW)
    └─ aquasec/trivy-action  →  SARIF upload to GitHub Security tab

Jenkins (FUTURE)
    └─ sh 'docker run --rm aquasec/trivy ...'
    └─ Fail on CRITICAL (exit-code 1)

Kubernetes (FUTURE)
    └─ Trivy Operator (cluster-native scanning)
    └─ Admission controller integration

AWS (FUTURE)
    └─ ECR image scanning (native Trivy integration)

ArgoCD (FUTURE)
    └─ Pre-sync hook: trivy scan before deployment
```

**STATUS: ✅ ARCHITECTURE DESIGN COMPLETE**
