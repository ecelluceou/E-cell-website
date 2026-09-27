# Project To-Do List

## High Priority (Tomorrow)
- [ ] **Fix Vercel Deployment Author Mismatch:**
  - Ensure commits use your authorized contributor identity:
    ```bash
    git config user.email "<your-linked-email>"
    git config user.name "<your-name>"
    # Incorporate and review latest origin/main
    git fetch origin
    # Require explicit expected commit when force-pushing
    git push --force-with-lease=main:<expected-commit-hash> origin main
    ```
  - Note: Use an authorized collaboration plan for private Hobby deployments when needed.

## Backlog / Enhancements
- [x] **Case Study Registration & Dashboard:**
  - [x] Implement Create/Join Team workflows.
  - [x] Real-time dashboard showing capacity slots.
  - [x] **Leader Controls:** Allow team leader to remove members or delete the entire team.
- [ ] Upload banner for "Building a Startup? E-Cell Wants to Help!" initiative from Admin Panel.
- [ ] Configure Google OAuth Consent Screen branding (App name: E-Cell UCEOU + logo).
