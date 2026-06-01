# Jenkins Architecture Report

## Deployment Model
- **Platform:** Docker container (Docker Compose)
- **Image:** `jenkins/jenkins:lts`
- **Access Port:** `8082` (Mapped from `8080` internally to avoid NGINX collision)

## Resource Protection
Given the host constraint (8GB RAM), Jenkins must be heavily restricted to prevent OOM errors:
- **Docker limit:** `mem_limit: 768m`
- **CPU limit:** `cpus: "1.5"`
- **JVM limits:** `JAVA_OPTS=-Xmx512m` (Ensures Java stays within the 768m Docker limit)

## Integration Points
- **Docker Socket:** `/var/run/docker.sock` mounted to allow Jenkins to build containers for the CI/CD pipeline (Docker-out-of-Docker).
- **Persistent Storage:** Docker volume `jenkins_data` mapped to `/var/jenkins_home`.

**STATUS: ✅ ARCHITECTURE DESIGN COMPLETE**
