const deepRenameKeys = require("deep-rename-keys");
const deepFilter = require("deep-filter");

/**
 * `data` is a json object as generated with `sourcekitten`.
 */
function collectTypes(data, filterOptions) {
    const structures = preprocess(data, {
        kindsToKeep: ["class", "enum", "protocol", "struct", "extension", "typealias"],
        keysToRemove: ["length", "offset", "namelength", "nameoffset", "bodylength", "bodyoffset", "doclength", "docoffset"]
    });

    const types = collectTypesFromStructures(structures);
    return filterTypes(types, filterOptions);
}

function preprocess(data, options) {
    // Ditch `key.` prefix
    data = deepRenameKeys(data, k => k.replace(/^key\./, ""));

    return deepFilter(data.substructure, (value, key, obj) => {
        // Update `value`
        switch (key) {
        case "kind":
            value = value.replace("source.lang.swift.decl.", ""); break;
        case "accessibility":
            value = value.replace("source.lang.swift.accessibility.", ""); break;
        }

        obj[key] = value;

        // Ditch boring keys and kinds
        if (options.keysToRemove.includes(key)) return false;
        if (value.kind && !options.kindsToKeep.includes(value.kind)) return false;

        return true;
    });
}

/**
 * Collects any type encountered in the nested `substructure` hierarchy.
 *
 * It is possible that the collective `inherits` for all types include
 * symbols not themselves present in the result. Example: `class`, or types that
 * inherit from typealiases but no structure is encountered by that typealias
 * name (only their original names).
 */
function collectTypesFromStructures(structures) {

    function traverseStructure(node, qualifiedName, collectedTypes) {
        if (!node || !isType(node)) return;

        // Found new type
        if (!collectedTypes[qualifiedName]) {
            collectedTypes[qualifiedName] = {
                qualifiedName,
                name: undefined,
                accessibility: undefined,
                kind: undefined,
                attributes: undefined,
                inherits: [],
                inheritedBy: []
            };
        }

        const type = collectedTypes[qualifiedName];

        // Found original type declaration
        if (node.kind !== "extension") {
            type.name = node.name;
            type.accessibility = node.accessibility;
            type.attributes = node.attributes;
            type.kind = node.kind;
        }

        // Collect inherits
        // todo: might want to collect access levels for extensions if those occur?
        if (node.inheritedtypes) {
            const inherits = node.inheritedtypes
                .map(i => i.name.replace(/<.*>/g, ''));  // Remove generics
            type.inherits = type.inherits.concat(inherits).sort();
        }

        // Descend
        if (node.substructure) {
            node.substructure.forEach(child => {
                const name = `${qualifiedName}.${child.name}`;
                traverseStructure(child, name, collectedTypes);
            });
        }
    }

    const typesByName = {};

    structures.forEach(s =>
        traverseStructure(s, s.name, typesByName)
    );

    const types = Object.values(typesByName)
        .sort((a, b) => stringCompare(a.qualifiedName, b.qualifiedName));

    // Collect `inheritedBy`
    types.forEach(type => {
        type.inherits
            .map(i => typesByName[i])
            .filter(i => i)
            .forEach(i => i.inheritedBy.push(type.qualifiedName));
    });

    return types;
}

function filterTypes(types, options) {
    if (!options) return types;

    const typesByName = {};
    types.forEach(t =>
        typesByName[t.qualifiedName] = t
    );

    return types
        .filter(type => shouldIncludeType(type, options))  // Filter types
        .map(type => {
            const inherits = type.inherits.filter(i => shouldIncludeType(typesByName[i], options));  // Filter inherits
            return Object.assign({}, type, { inherits });
        });
}

function shouldIncludeType(type, options) {
    // An inherit without detailed info. Include to be safe.
    if (!type) return true;

    if (!options.kinds.includes(type.kind)) return false;
    if (!options.accessLevels.includes(type.accessibility)) return false;
    if (!options.includeNested && type.qualifiedName.includes(".")) return false;
    if (!options.includeUnderscored && (type.name || type.qualifiedName).includes("_")) return false;
    if (!options.includeDeprecated && options.deprecations.includes(type.qualifiedName)) return false;

    return true;
}

/**
 * Note: Returns `true` for `undefined`.
 */
function isType(structure) {
    return [
        undefined,
        "class",
        "enum",
        "protocol",
        "struct",
        "typealias",
        "extension"
    ].includes(structure.kind);
}

function stringCompare(a, b) {
    return (a < b) ? -1 :
           (a > b) ?  1 : 0;
}

module.exports = collectTypes;