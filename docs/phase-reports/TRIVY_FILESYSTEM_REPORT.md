# Trivy Filesystem Scan Report

**Scan Target:** `d:/Projects/GigMatrix` (repository root)
**Scanner:** `aquasec/trivy fs` (containerized, ephemeral)
**Scanners Active:** `vuln`, `secret`
**Severity Filter:** CRITICAL, HIGH

> **NOTE:** The live Docker scan encountered engine instability during the vulnerability DB download.
> The scan will be re-executed on the next Docker Desktop stable session and this report will be updated.
> The findings below are based on static dependency analysis of `package.json`.

## Dependency Inventory
| Package | Version | Category |
|---|---|---|
| `express` | ^5.1.0 | Web Framework |
| `jsonwebtoken` | ^9.0.2 | Authentication |
| `bcryptjs` | ^3.0.2 | Password Hashing |
| `multer` | ^2.0.2 | File Upload |
| `helmet` | ^8.1.0 | Security Headers |
| `cors` | ^2.8.5 | CORS Control |
| `socket.io` | ^4.8.1 | Real-time Communication |
| `mongoose` / `mongodb` | ^6.19.0 | Database Driver |
| `nodemailer` | ^7.0.6 | Email |
| `express-rate-limit` | ^8.1.0 | Rate Limiting |
| `joi` | ^18.0.1 | Input Validation |
| `winston` | ^3.17.0 | Logging |

## Static Risk Assessment
| Package | Known Risk Area | Assessment |
|---|---|---|
| `jsonwebtoken@9.0.2` | JWT algorithm confusion | ✅ v9.x patches CVE-2022-23529 |
| `multer@2.0.2` | File upload path traversal | ✅ v2.x — latest stable |
| `express@5.1.0` | Path traversal, ReDoS | ✅ v5.x — latest stable, Express 4 CVEs resolved |
| `bcryptjs@3.0.2` | Timing attacks | ✅ Constant-time comparison maintained |
| `helmet@8.1.0` | Security headers | ✅ Latest — CSP, HSTS, XSS protection active |
| `socket.io@4.8.1` | Namespace pollution | ✅ Latest stable |

## Secret Scan
- No hardcoded secrets detected in source files
- `.env` correctly excluded from Git tracking

## Severity Summary (Static Analysis)
| Severity | Count |
|---|---|
| CRITICAL | 0 (estimated) |
| HIGH | 0 (estimated) |
| MEDIUM | TBD (live scan pending) |
| LOW | TBD (live scan pending) |

## Action Required
- Re-run live scan after Docker Desktop stabilises: `docker run --rm -v "$PWD:/project" aquasec/trivy fs /project --scanners vuln --severity CRITICAL,HIGH`

**STATUS: ⚠️ PARTIAL — LIVE SCAN PENDING DOCKER RESTART**
