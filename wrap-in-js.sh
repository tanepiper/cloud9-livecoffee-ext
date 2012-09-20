#!/bin/bash -e
if [ $# == 0 ]; then
  echo No files specified
  exit 1
fi
for F in $*; do
  echo -n '// Wrapped in JavaScript, to avoid cross-origin restrictions, created using wrap-in-js.sh
define(function() {
return ' > "$F".js
  cat "$F" | sed 's/\\/\\\\/g;'" s/'/\\\\'/g; s/^/'/g; s/$/\\\\n' +/g" >> "$F".js
  echo "'';});" >> "$F".js
done

