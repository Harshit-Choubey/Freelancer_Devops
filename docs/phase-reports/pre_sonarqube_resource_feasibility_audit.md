# Pre-SonarQube Resource Feasibility Audit

## 1. Current System Resource Profile
- **Host Total RAM:** 8 GB
- **Host Available RAM:** ~350 MB (Windows dynamically yielding memory)
- **Docker Desktop Allocation Limit:** ~3.7 GB
- **Current Docker Consumption (GigMatrix Stack):** ~280 MB (Highly optimized)
- **Available Internal Docker Headroom:** ~3.4 GB

## 2. SonarQube Technical Requirements
Running SonarQube locally requires a massive footprint due to its internal Java/Elasticsearch architecture:
- **SonarQube Container (Minimum):** `2GB` RAM (Production recommendation is often higher).
- **Database (PostgreSQL):** `500MB` RAM (Embedded H2 is deprecated and not viable for persistent scans).
- **Host Kernel Requirement:** `vm.max_map_count` must be set to at least `262144` for Elasticsearch to start.

## 3. Feasibility & Risk Assessment
**RISK LEVEL: SEVERE 🔴**

If we attempt to run SonarQube and PostgreSQL concurrently with the existing GigMatrix stack:
1. **Total Docker Memory Demand** will spike to `~2.8 GB` (Base Stack + Sonar + DB).
2. While this technically fits within Docker's `3.7 GB` limit, the **Host Machine (Windows)** is already running with less than 400 MB of free physical memory. 
3. **Implications:** Docker will heavily rely on WSL2 memory swapping to disk, leading to extreme system sluggishness, potential freezing of Docker Desktop, and high likelihood of OOM (Out Of Memory) container crashes during an active Sonar scan.

## 4. Recommended Mitigation Strategies

Before integrating SonarQube, we must select one of the following architectural strategies:

* **Strategy A (On-Demand Ephemeral Deployment):**
  Only start SonarQube and Postgres when a scan is actively required (`docker compose --profile security up -d`), and shut them down immediately after the scan completes. This prevents constant background resource drain.
  
* **Strategy B (SonarCloud / Remote Execution):**
  Do not run the SonarQube server locally. Instead, integrate with SonarCloud (SaaS) and only run the lightweight `sonar-scanner` container locally to push code analysis results to the cloud.
  
* **Strategy C (Aggressive Resource Limiting):**
  Attempt to force SonarQube to run on `1.5GB` and Postgres on `256MB` using `mem_limit`. **Warning:** This is below official requirements and may cause Elasticsearch crash loops.

**AWAITING STRATEGY DECISION:**
Please review the risks and select an implementation strategy (A, B, or C) before we begin the Phase 4 SonarQube Implementation Master Prompt.
