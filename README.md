# swift-stdlib-vis

A visualization of the Swift (4.2) standard library, its types and relationships.

![Example](example-stdlib-4.2.svg)

The data is extracted from the [Swift standard library source code](https://github.com/apple/swift/tree/master/stdlib/public/core), parsed with [`sourcekitten`](https://github.com/jpsim/SourceKitten) and graphed with [`graphviz`](https://graphviz.gitlab.io/).

**Note**: The generated graph gives a workable overview of the Swift standard library but it is not completely accurate and should not be used as reference.

## Build/Run

Warning: This is a bunch of ad-hoc scripts I quickly thrown together to extract the data I needed. Not pretty.

You need [`node`](https://nodejs.org/), [`npm`](https://www.npmjs.com/) and [`homebrew`](https://brew.sh/).

**Install other dependencies**:

    brew install sourcekitten
    brew install graphviz
    npm install

**Get Swift source code**:

    mkdir swift-source
    git clone https://github.com/apple/swift.git swift-source

**Pick data to work with**, e.g. leave at `master` or pick a branch or tag:

    cd swift-source/swift
    git checkout swift-4.2-DEVELOPMENT-SNAPSHOT-2018-06-28-a

**Build data** (back in root folder):

    npm run builddata swift-4.2-DEVELOPMENT-SNAPSHOT-2018-06-28-a  # name optional

This:

1. Builds Swift [`.gyb` files](https://oleb.net/blog/2016/10/swift-stdlib-source/) into `.swift` files in the standard library.
2. Runs `sourcekitten` on the result.
3. Extracts the relevant data.
4. Builds a `graphviz dot` graph.
5. Generates a PDF with `graphviz`.

The result lives in [`data`](data).

## Limitations

### Deprecated Symbols

Unfortunately, the `sourcekitten` input data does not contain detailed info about deprecated/obsoleted symbols. To exclude these, the `bin/collect-types` script hard-codes a bunch of deprecated symbols that where hand-collected from the standard library source, version *swift-4.2-DEVELOPMENT-SNAPSHOT-2018-06-28-a*. You probably need to adjust this if you work with a different version.