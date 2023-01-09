#!/usr/bin/env bash

files=(door43-library door43-library-start)

for file in "${files[@]}"
do
    printf "   Compiling ${file}.ts... "
    tsc --sourcemap -d "src/ts/${file}.ts" --outDir build/js --declarationDir src/ts/d --removeComments

    printf "uglifying... "
    uglifyjs "build/js/${file}.js" -o "build/js/${file}.min.js" --compress --mangle

    printf "finished.\n"
done

