/* eslint-env node */
const path = require("path");

module.exports = {
  meta: {
    type: "suggestion",
    messages: {
      noRelativeImport: "Don't use relative imports",
    },
    fixable: "code",
  },

  create(context) {
    const absoluteRoots = Array.from(
      Object.entries(context.options.roots || {}),
    ).map(([rootName, relativePath]) => [rootName, path.resolve(relativePath)]);

    return {
      ImportDeclaration(node) {
        if (
          node.source.type === "Literal" &&
          node.source.value.startsWith(".")
        ) {
          context.report({
            node,
            messageId: "noRelativeImport",

            fix(fixer) {
              const filename = context.getFilename();
              const importSpecifier = node.source.value;
              for (const [root, rootPath] of absoluteRoots) {
                if (filename.startsWith(rootPath)) {
                  const absoluteFsImport = path.normalize(
                    path.join(path.dirname(filename), importSpecifier),
                  );
                  const rootedImport = path.join(
                    root,
                    path.relative(rootPath, absoluteFsImport),
                  );
                  return fixer.replaceTextRange(
                    [node.source.start + 1, node.source.end - 1],
                    rootedImport,
                  );
                }
              }

              return undefined;
            },
          });
        }
      },
    };
  },
};
