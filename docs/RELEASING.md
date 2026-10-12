# Releasing safe-calc

## State of this change

`package.json` and `package-lock.json` are prepared for **2.0.0**, with release
notes in CHANGELOG.md. A source version bump is not an npm publication. No npm
credential or token is stored in this repository, and this change does not
claim a live npm 2.0.0 release.

## One-time trusted publisher configuration

In the npm package settings, add a GitHub Actions trusted publisher:

- Owner: `geo318`
- Repository: `js-calc-extension`
- Workflow filename: `publish.yml`
- Environment: `npm`
- Permit direct `npm publish` for this workflow (new configurations may default
  to staging only).

Create/review the GitHub `npm` environment and require maintainer approval as
appropriate. Configure the npm publisher shortly before the first release:
current npm documentation says an unused new configuration expires after two
days. The workflow uses GitHub-hosted Node 24, npm >=11.5.1, `id-token: write`,
no release cache, SHA-pinned actions, and no long-lived npm write token.

Official documentation: https://docs.npmjs.com/trusted-publishers/

## Release checklist

1. Merge reviewed changes only after CI passes. Confirm the target version is
   not already published using `npm view @geo318/safe-calc versions --json`.
2. Run `npm ci --ignore-scripts`, `npm run check`, and `npm run test:reference`.
   The independent reference test requires Python 3; GitHub-hosted Ubuntu
   provides it. Inspect `npm pack --dry-run` for unexpected files.
3. Set the changelog's release date when the release is actually going out.
   Remove the README's release-preparation note. Future bumps must update both
   package manifests together (`npm version ... --no-git-tag-version`).
4. Publish a GitHub release with tag `v2.0.0` on the reviewed commit and paste
   the 2.0.0 changelog entry as release notes. This explicit action triggers
   `.github/workflows/publish.yml`; ordinary pushes/PRs do not publish packages.
5. Approve the environment gate, inspect the publish workflow, and verify the
   exact package version and provenance in npm after success.

`prepublishOnly` runs package validation too. Never work around a failed check
by publishing with ignored lifecycle scripts. npm versions are immutable;
authentication failures should be corrected before retrying the same release.
A GitHub release alone is not evidence that the npm publish step succeeded.

## Local alternative

A maintainer with authorized npm access can publish the checked-out release
with `npm publish --access public` and complete npm's authentication/2FA flow.
Do not paste credentials into source code, PRs, workflow YAML, or chat.
