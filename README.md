# swift-stdlib-vis

A visualization of the Swift (4.2) standard library, its types and relationships.

![Example](example-stdlib-4.2.svg)

## Motivation

Swift is often described as a [protocol-oriented](https://developer.apple.com/videos/play/wwdc2015/408/) language. The Swift standard library makes extensive use of these concepts. In place of traditional class-based inheritance, its main design factors are first-class value types with compositions of protocols.

This visualization gives a nice overview of these ideas. It makes it easy to see how interconnected the types in the standard library are. The official documentation makes it hard to discover these relationships, they tend to get lost. For example, the complexity of Swift's number types can be seen at a glance. Finally, it is interesting to note how few class-based types are present in the standard library. (The contrast is very stark when comparing the standard library to Apple's [Foundation](https://developer.apple.com/documentation/foundation) framework.)

**Note**: The generated graph gives a workable overview of the Swift standard library but it is not guaranteed to be accurate and should not be used as an official reference.

## Generating Visualizations

The data is extracted from the [Swift standard library source code](https://github.com/apple/swift/tree/master/stdlib/public/core), parsed with [`sourcekitten`](https://github.com/jpsim/SourceKitten) and graphed with [`graphviz`](https://graphviz.gitlab.io/).

First, you need [`node`](https://nodejs.org/), [`npm`](https://www.npmjs.com/) and [`homebrew`](https://brew.sh/).

**Install dependencies**:

    brew install sourcekitten
    brew install graphviz
    npm install

**Get the Swift source code**:

    mkdir swift-source
    git clone https://github.com/apple/swift.git swift-source

**Select a Swift version**:

    cd swift-source/swift
    git checkout swift-4.2-DEVELOPMENT-SNAPSHOT-2018-06-28-a
    
You can checkout any specific branch or tag, or just leave it at `master`.

**Generate visualization**:

    cd swift-source
    npm run builddata swift-4.2-DEVELOPMENT-SNAPSHOT-2018-06-28-a  # name optional

The results live in the [`data`](data) directory.

The `builddata` script does the following:

1. Builds Swift [`.gyb` files](https://oleb.net/blog/2016/10/swift-stdlib-source/) into `.swift` files in the standard library.
2. Runs `sourcekitten` on the result.
3. Extracts the relevant data.
4. Builds a `graphviz dot` graph.
5. Generates a PDF with `graphviz`.


## Limitations

### Deprecated Symbols

Unfortunately, the `sourcekitten` input data does not contain detailed info about deprecated/obsoleted symbols. To exclude these, the `bin/collect-types` script hard-codes a bunch of deprecated symbols that where hand-collected from the standard library source, version *swift-4.2-DEVELOPMENT-SNAPSHOT-2018-06-28-a*. You probably need to adjust this if you work with a different version.
