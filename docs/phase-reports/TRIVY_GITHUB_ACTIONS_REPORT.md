# Trivy GitHub Actions Report

## Workflow File
**Path:** `.github/workflows/trivy.yml`

## Jobs
| Job | Trigger | Target |
|---|---|---|
| `trivy-fs-scan` | push / pull_request | Repository filesystem |
| `trivy-image-scan` | push / pull_request | `gigmatrix-api:latest`, `gigmatrix-nginx:latest` |

## Key Design Decisions
- **`exit-code: 0`** — Report-only mode. Builds never fail at this stage.
- **SARIF output** — Results automatically appear in GitHub repository Security tab under "Code scanning alerts"
- **Matrix strategy** — Both images are scanned in parallel, reducing total workflow time
- **`aquasecurity/trivy-action@master`** — Official Trivy GitHub Action, always uses latest Trivy version

## Results Visibility
After the first workflow run, findings will be visible at:
`GitHub → Security → Code scanning → Trivy alerts`

**STATUS: ✅ GITHUB ACTIONS WORKFLOW CREATED**
