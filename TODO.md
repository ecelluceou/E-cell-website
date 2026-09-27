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
- [ ] Upload banner for "Building a Startup? E-Cell Wants to Help!" initiative from Admin Panel.
- [ ] Configure Google OAuth Consent Screen branding (App name: E-Cell UCEOU + logo).
