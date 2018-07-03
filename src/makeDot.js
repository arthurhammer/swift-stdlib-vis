const styles = {
    node: {
        class:     '[color="#9C0027", fillcolor="#CF1C5AE6"]',
        enum:      '[color="#0577E6", fillcolor="#1E90FFE6"]',
        protocol:  '[color="#07871B", fillcolor="#3ABA4EE6"]',
        struct:    '[color="#7B0FBC", fillcolor="#AE42EFE6"]',
        typealias: '[color="#C88200", fillcolor="#FBB52EE6"]',
        undefined: '[color="#3E4756", fillcolor="#57606FE6"]'
    },
    edge: {
        // Overrides from `node`
        struct: '[color="#7B0FBC77", fillcolor="#AE42EFE6"]'  // purple is too strong, more alpha
    }
};

function makeDot(data) {
    const nodesDot = nodes(data).join("\n");
    const edgesDot = edges(data).join("\n");
    const leafsDot = leafs(data).join("\n");
    const legendDot = legend();

    return `
    strict digraph {
        rankdir=RL
        ranksep=0.3 // 3
        nodesep=0.12
        center=true
        splines=false
        outputorder=edgesfirst
        pad="0.4, 0.8"
        bgcolor="#F7F7F7"

        // Styles
        node [
          shape=box,
          style="rounded, filled",
          color="black",
          fillcolor="gray",
          fontcolor="white",
          penwidth=2.0,
          margin="0.25, 0.15",
          fontname="helvetica-bold",
          fontsize=20
        ]

        edge [
          color="#31ACFCF2",
          penwidth=1.2
        ]

        // Legend
        ${legendDot}

        // Nodes, edges
        ${nodesDot}
        ${edgesDot}

        // Leafs on last level
        subgraph {
          rank="min"
          ${leafsDot}
        }
    }`;
}

function legend() {
    return `
    subgraph cluster_legend {
        label="Types and Relationships"
        fontname="helvetica-bold"
        fontsize=30
        color=invis

        node [fontsize=20]
        edge [fontname="helvetica-bold", fontsize=14]

        // Nodes
        Class, Class1, Class2 [label="Class"] ${styles.node.class}
        Protocol, Protocol1, Protocol2 [label="Protocol"] ${styles.node.protocol}
        Enum, Enum2 [label="Enum"] ${styles.node.enum}
        Struct, Struct2 [label="Struct"] ${styles.node.struct}
        Typealias ${styles.node.typealias}
        Unknown ${styles.node.undefined}

        // Edges
        Enum -> Protocol [label="conforms to protocol"]
        Struct -> Protocol ${styles.edge.struct || styles.node.struct}
        Class -> Protocol ${styles.edge.class || styles.node.class}
        Protocol1 -> Protocol2 [label="inherits from protocol"] ${styles.edge.protocol || styles.node.protocol}
        Class1 -> Class2 [label="inherits from class"] ${styles.edge.class || styles.node.class}
        Enum2 -> Struct2 [label="type of raw values"] ${styles.edge.enum || styles.node.enum}
    }`;
}

function nodes(data) {
    function node(type) {
        const name = type.qualifiedName;
        const kind = type.kind;
        return `"${name}" ${styles.node[kind]} [tooltip="${name} (${kind})"]`;
    }

    return data.map(node);
}

function edges(data) {
    function edge(type, inherit) {
        const name = type.qualifiedName;
        const kind = type.kind;
        return `"${name}" -> "${inherit}" ${styles.edge[kind] || styles.node[kind]}`;
    }

    const edges = data.map(type =>
        type.inherits.map(i => edge(type, i))
    );

    return [].concat(...edges);
}

function leafs(data) {
    const inherits = data.map(t => t.inherits);
    const allInherits = new Set([].concat(...inherits));

    const noInherits = data.filter(t =>
        !allInherits.has(t.qualifiedName) && !allInherits.has(t.name)
    );

    return noInherits.map(t => `"${t.qualifiedName}"`);
}

module.exports = makeDot;