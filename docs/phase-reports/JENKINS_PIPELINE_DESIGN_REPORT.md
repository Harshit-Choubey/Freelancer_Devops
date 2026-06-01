# Jenkins Pipeline Design Report

## CI/CD Pipeline Architecture

The future `Jenkinsfile` (Declarative Pipeline) will follow this structure:

### Stage 1: Checkout
- Pulls code from GitHub `feature/*`, `develop`, or `main`.

### Stage 2: SonarCloud Static Analysis
- Executes SonarScanner.
- Code coverage and code smells are analyzed.
- Quality Gate status is checked using `waitForQualityGate abortPipeline: true`.

### Stage 3: Docker Build
- Builds `gigmatrix-api` and `gigmatrix-nginx` images.
- Tags images with the Git commit hash.

### Stage 4: Trivy Container Scan
- Runs Trivy against the newly built images.
- Enforces security policy: Fails the pipeline if any CRITICAL vulnerability is detected.

### Stage 5: Push to Registry (Future Phase)
- Authenticates with Docker Hub or AWS ECR.
- Pushes validated, secure images to the registry.

### Stage 6: Deployment Trigger (Future Phase)
- Triggers Kubernetes/ArgoCD sync or Terraform updates.

**STATUS: ✅ PIPELINE DESIGN COMPLETE**
