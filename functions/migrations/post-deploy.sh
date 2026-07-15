#!/usr/bin/env bash
# Invoked as the "functions" postdeploy hook (see firebase.json) so pending
# migrations run automatically right after `firebase deploy` finishes
# deploying functions. $GCLOUD_PROJECT is provided by the Firebase CLI hook
# environment.
set -euo pipefail

REGION="us-central1"
URL="https://${REGION}-${GCLOUD_PROJECT}.cloudfunctions.net/runMigrations"

echo "Running migrations: ${URL}"
curl --fail --silent --show-error "${URL}"
echo
