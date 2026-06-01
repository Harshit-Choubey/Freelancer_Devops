# Jenkins Resource Impact Analysis Report

## Resource Constraints
- **Host System:** Windows 11, Docker Desktop (WSL2), **8GB Total RAM**
- **Existing Stack Consumption:** ~520MB RAM
- **Jenkins Requirements:** Heavy JVM application. Recommended minimum 1GB, but restricted to 768MB here.

## Analysis
Running a full DevOps stack locally (API, Mongo, Redis, Prometheus, Grafana, cAdvisor) alongside a heavy CI/CD tool (Jenkins) on an 8GB machine puts the system at severe risk of resource exhaustion and engine lock-ups (as witnessed during the Trivy phase).

- **Always-on vs On-demand:** 
  If Jenkins is left running constantly, it will consume a baseline of ~500MB RAM even when idle, leaving very little overhead for actual pipeline executions (which involve spinning up *more* containers for building and scanning).

## Final Recommendation
**Jenkins should run ON-DEMAND.**
For local development, Jenkins should remain stopped to preserve RAM for the application and monitoring stack. It should only be started (`docker compose start jenkins`) when actively working on or testing CI/CD pipelines, and stopped immediately after (`docker compose stop jenkins`).

**STATUS: ✅ RESOURCE ANALYSIS COMPLETE**
