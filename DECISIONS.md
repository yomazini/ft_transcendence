# Architecture Decision Records (ADR)

One line per real architecture choice — date, decision, one-line reason.

- **2026-08-06:** Adopt 2-tier permanent branching model (`main` production + `dev` integration sandbox) with short-lived feature branches and milestone syncs (W4, W7, W8) — protects `main` for evaluation while providing daily integration testing across all 13 containers.
