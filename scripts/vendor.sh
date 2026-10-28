#!/bin/sh
# supabase-js'i tek dosyalık ES modülü olarak yeniden üretir (sürüm yükseltmek için).
#   sh scripts/vendor.sh 2.117.2
set -e
V=${1:-2.117.2}
T=$(mktemp -d)
cd "$T" && npm init -y >/dev/null && npm i --silent "@supabase/supabase-js@$V" esbuild@0.24.0
echo "export { createClient } from '@supabase/supabase-js';" > entry.js
./node_modules/.bin/esbuild entry.js --bundle --format=esm --minify --target=es2020 --legal-comments=eof --outfile=out.js
cd - >/dev/null && cp "$T/out.js" "public/vendor/supabase-js-$V.js" && rm -rf "$T"
echo "public/vendor/supabase-js-$V.js güncellendi; app/supa.js ve sw.js içindeki sürümü de değiştirin."
