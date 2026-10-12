# Releasing safe-calc

A version bump or GitHub release is not evidence of a successful npm publication.
The publish job must succeed and the exact version must be visible in npm.

## One-time trusted publisher configuration

In the npm package settings, add a GitHub Actions trusted publisher:

- Owner: `geo318`
- Repository: `js-calc-extension`
- Workflow filename: `publish.yml`
- Environment: `npm`
- Permit direct `npm publish` (not only staged publishing).

Create/review the GitHub `npm` environment and require maintainer approval as
appropriate. Configure the npm publisher shortly before the first release:
an unused new configuration expires after two days. This workflow uses
GitHub-hosted Node 24, npm >=11.5.1, `id-token: write`, no release cache,
SHA-pinned actions, and no long-lived npm write token.

Official documentation: https://docs.npmjs.com/trusted-publishers/

## Release checklist

1. Update both manifests together (`npm version ... --no-git-tag-version`),
   finalize CHANGELOG.md and migration notes, and merge only after CI passes.
2. Run `npm ci --ignore-scripts`, `npm run check`, and `npm run test:reference`.
   Reference tests require Python 3 for development/CI only. Inspect
   `npm pack --dry-run` for unexpected files.
3. Choose one explicit release trigger, pointing at a commit already in main:
   - Run the **Publish npm release** Actions workflow and enter the exact
     stable version (for example `2.0.0`).
   - Create/push the dedicated branch `release/npm-2.0.0` from the merged
     release commit. The branch suffix must match package.json exactly.
   - Publish a GitHub release tagged `v2.0.0` at that commit.
4. Approve any environment gate and inspect the workflow. It checks the npm
   registry first, refuses existing versions or backwards latest-tag movement,
   repeats validation, publishes through OIDC, and verifies the exact version.
5. When triggered manually or through a release branch, a separate job creates
   the GitHub tag/release with CHANGELOG.md notes only after npm verification.
   An existing GitHub release is never overwritten.

Ordinary main/feature pushes and PRs do not publish packages. Only explicit
release-branch pushes, workflow dispatches, and published release events do.
A failed npm authentication attempt must be corrected in npm package settings;
then rerun the failed workflow or manually dispatch it with the same version.
Do not increment a version solely because authentication failed.

`prepublishOnly` also runs package validation. Never ignore lifecycle scripts
to bypass a failed check. npm versions are immutable. If npm publication
succeeds but the GitHub release job fails, retry only that job or create the
GitHub release manually; do not attempt to publish the version again.

## Local alternative

A maintainer with authorized npm access can publish the checked-out release
with `npm publish --access public` and complete npm's authentication/2FA flow.
Do not paste credentials into source code, PRs, workflow YAML, or chat.
