#!/bin/bash
# Toni Suter:
#   https://gist.github.com/tonisuter/e47267a25b3dcc90fe75a24d3ed2063a
for f in `ls *.gyb`
do
	echo "Processing $f"
	name=${f%.gyb}
	../../../utils/gyb -D CMAKE_SIZEOF_VOID_P=8 -o $name $f --line-directive ""
done
