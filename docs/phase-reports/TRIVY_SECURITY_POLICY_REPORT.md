# Trivy Security Policy Report

## Current Enforcement Mode: REPORT-ONLY

All Trivy scans run with `--exit-code 0` (or `exit-code: 0` in GitHub Actions).

This means:
- Scans **always complete** and upload results
- Builds are **never failed** by Trivy findings at this stage
- All findings are **visible in the GitHub Security tab** (via SARIF upload)

## Severity Classification Policy
| Severity | Current Action | Future Jenkins Action |
|---|---|---|
| CRITICAL | ⚠️ Report only | ❌ Fail build |
| HIGH | ⚠️ Report only | ⚠️ Report + notify |
| MEDIUM | ⚠️ Report only | ⚠️ Report only |
| LOW | ⚠️ Report only | ℹ️ Report only |

## Future Jenkins Quality Gate Policy
When Jenkins is introduced, the pipeline will enforce:
```groovy
sh 'docker run --rm aquasec/trivy image --exit-code 1 --severity CRITICAL gigmatrix-api:latest'
```
This will abort the build if any CRITICAL vulnerability is found in application images.

## Secret Detection Policy
- Trivy's built-in secret scanner is active during filesystem scans
- Any detected secrets will trigger an **immediate CRITICAL alert** regardless of phase

**STATUS: ✅ SECURITY POLICY DEFINED**
