#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
  echo "Usage: ./scripts/release.sh <major.minor.patch>"
  exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version '$VERSION'. Expected SemVer format: x.y.z"
  exit 1
fi

npm version "$VERSION" --no-git-tag-version

echo "Updated package version to $VERSION"
echo "Next steps:"
echo "1) Update CHANGELOG.md with release notes"
echo "2) Commit and tag: git tag v$VERSION"
echo "3) Push branch and tag to trigger CD"
