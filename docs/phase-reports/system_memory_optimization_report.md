# System Memory Optimization Report

## 1. Current Resource Snapshot
- **Total Physical Memory:** 7.97 GB (7,975 MB)
- **Available Physical Memory:** 0.57 GB (573 MB) 🚨 **CRITICALLY LOW**
- **CPU Utilization:** 96% (Spiky/High Load)

## 2. Top Memory Consumers (Host OS)
The host operating system is under heavy memory pressure. The top allocations are:
1. **Memory Compression:** ~1,033 MB (Indicates Windows is heavily swapping/compressing RAM to survive)
2. **vmmemWSL (Docker / WSL2):** ~738 MB
3. **IDE / Editor:** ~573 MB (Multiple Antigravity IDE / VS Code processes)
4. **Google Chrome:** ~296 MB
5. **Windows Defender (MsMpEng):** ~179 MB
6. **Docker Desktop GUI/Backend:** ~193 MB

## 3. Docker Resource Analysis
**Docker Desktop Allocation:**
- **Assigned RAM:** 3.717 GiB (Standard WSL2 50% allocation of 8GB total)
- **CPUs:** 8
- **Running Containers:** 11 containers across 2 active projects.

**GigMatrix Consumption:** (~170 MB Total)
- `gigmatrix-mongo`: ~90 MB
- `gigmatrix-prometheus`: ~35 MB
- `gigmatrix-api`: ~28 MB
- `gigmatrix-nginx`: ~9 MB
- `gigmatrix-redis`: ~6.6 MB

**Rogue Workload Detected (PathPilot):** (~800 MB Total) 🚨
An entirely separate project stack is currently running and draining Docker's memory allocation:
- `pathpilot-ml_service-1`: ~295 MB
- `pathpilot-backend-1`: ~286 MB
- `pathpilot-celery_worker-1`: ~163 MB
- `pathpilot-db-1`: ~34 MB
- `pathpilot-redis-1`: ~10 MB
- `pathpilot-frontend-1`: ~9.5 MB

## 4. Quick Wins (Immediate RAM Recovery)
1. **STOP PathPilot Stack:** You are running `pathpilot` in the background. Running `docker stop $(docker ps -q -f name=pathpilot)` will instantly free up **~800 MB** of Docker RAM and lower CPU utilization significantly.
2. **Restart IDE/Chrome:** Restarting your editor and browser will clear stale memory caches, potentially recovering **~200-300 MB**.

## 5. Recommended Docker Desktop Settings
For an 8GB machine running an enterprise stack:
- Keep the current WSL2 dynamic allocation (~3.7 GiB max), but use `.wslconfig` to hard-cap memory to **4.5 GB** if you plan to run heavier Java tools.
- Implement strict `mem_limit` constraints on ALL future Docker Compose services (as done with Prometheus).

## 6. Recommended Service Strategy
Because you only have 8GB total system RAM, you **CANNOT** run an "Always-On" enterprise DevSecOps stack. 
You must adopt an **On-Demand / Ephemeral Strategy**:
- **Core App (Always-On):** NGINX, API, Mongo, Redis
- **Observability (Always-On with Limits):** Prometheus, cAdvisor, Grafana
- **CI/CD & Security (On-Demand):** SonarQube, Trivy, Jenkins MUST be started *only* when executing a pipeline, and stopped immediately after.

## 7. Resource Readiness Assessment
*Current Available RAM (with PathPilot stopped): ~1.3 GB*

| Service | Estimated RAM Req. | Status | Readiness | Optimization Strategy |
|---------|-------------------|--------|-----------|-----------------------|
| **cAdvisor** | ~50 - 100 MB | 🟢 Ready | Can integrate | Add `mem_limit: 128m` |
| **Grafana** | ~150 - 200 MB | 🟢 Ready | Can integrate | Add `mem_limit: 256m` |
| **Trivy** | ~500 MB (Spikes) | 🟡 Warning | Needs On-Demand | Run as ephemeral CLI container (`--rm`) |
| **SonarQube** | ~1.5 - 2.0 GB | 🔴 **BLOCKED**| Fails to boot | Requires dedicated 2GB limit; must stop Grafana/Prometheus during analysis. |
| **Jenkins** | ~1.0 GB | 🔴 **BLOCKED**| Fails/OOM | Must run standalone without SonarQube running. |
| **K3s** | ~1.0 GB (Control) | 🔴 **BLOCKED**| Severe Thrashing | Not recommended on 8GB host alongside CI/CD. Requires isolated test. |

## 8. Summary & Next Steps
**Estimated Recoverable RAM:** ~800 MB (by stopping PathPilot).
**Estimated Required for Next Phase (Grafana + cAdvisor):** ~300 MB.

**Conclusion:**
You are cleared to proceed with **cAdvisor and Grafana**, provided you strictly limit their memory to `128m` and `256m` respectively. However, before proceeding to SonarQube or Jenkins, we will need to fundamentally alter the orchestration strategy to spin services up and down dynamically.
