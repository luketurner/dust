#!/usr/bin/env bash
set -euo pipefail

MOUNT_DIR="/data"
LLAMAFILE="$MOUNT_DIR/llamafile"

LLAMAFILE_URL="https://huggingface.co/jartine/phi-2-llamafile/resolve/main/phi-2.Q2_K.llamafile?download=true"

if [ -a "$LLAMAFILE" ]; then
    echo "Found existing Llamafile at $LLAMAFILE. Download skipped."
else
    echo "Downloading $LLAMAFILE_URL..."
    wget -qO "$LLAMAFILE" "$LLAMAFILE_URL"
    chmod 700 "$LLAMAFILE"
    echo "Done."
fi

"$LLAMAFILE" --server --host "fly-local-6pn" --embedding --nobrowser