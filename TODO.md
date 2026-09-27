# Project To-Do List

## High Priority (Tomorrow)
- [ ] **Fix Vercel Deployment Author Mismatch:**
  - Update local Git author to match college club GitHub account:
    ```bash
    git config user.email "<club-email>"
    git config user.name "<club-username>"
    git commit --amend --reset-author --no-edit
    git push --force-with-lease origin main
    ```
  - Verify automated build triggers on Vercel Hobby tier without collaboration block.

## Backlog / Enhancements
- [ ] **Case Study Registration & Dashboard:**
  - Implement Create/Join Team workflows.
  - Real-time dashboard showing 5 capacity slots.
  - **Leader Controls:** Allow team leader to remove members or delete the entire team.
- [ ] Upload banner for "Building a Startup? E-Cell Wants to Help!" initiative from Admin Panel.
- [ ] Configure Google OAuth Consent Screen branding (App name: E-Cell UCEOU + logo).
