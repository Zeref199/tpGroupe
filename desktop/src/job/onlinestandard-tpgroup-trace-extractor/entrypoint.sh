#!/bin/sh

if [ -f /vault/secrets/env_vars.txt ]; then
  source /vault/secrets/env_vars.txt
fi

if [ -f /vault/secrets/workflows_env_vars.txt ]; then
  source /vault/secrets/workflows_env_vars.txt
fi

set -eo pipefail

python -m onlinestandardtpgrouptraceextractor $@
