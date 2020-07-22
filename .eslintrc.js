const sharedRules = {
  "mozilla/no-define-cc-etc": "off",
  "react/jsx-fragments": ["error", "syntax"],
  "react/jsx-curly-brace-presence": ["error", "never"],
  "react/jsx-sort-props": [
    "error",
    {
      callbacksLast: true,
      shorthandFirst: true,
      ignoreCase: true,
      reservedFirst: true,
    },
  ],
  eqeqeq: ["error", "always"],
  "prefer-const": "error",
  "lines-between-class-members": ["error", "always"],
  "padding-line-between-statements": [
    "error",
    {
      blankLine: "always",
      prev: "multiline-block-like",
      next: "*",
    },
  ],
  "import/order": [
    "error",
    {
      groups: ["builtin", "external", "internal", "parent"],
      pathGroups: [
        {
          pattern: "devtools/**",
          group: "parent",
        },
        {
          pattern: "types/**",
          group: "parent",
        },
      ],
      pathGroupsExcludedImportTypes: ["builtin"],
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
      },
      "newlines-between": "always",
    },
  ],
};

module.exports = {
  env: {
    jest: true,
    webextensions: true,
  },
  parser: "babel-eslint",
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:mozilla/recommended",
    "plugin:react/recommended",
  ],
  plugins: ["mozilla", "import"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    ...sharedRules,
    "no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "^_omit",
      },
    ],
  },

  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      plugins: ["mozilla", "@typescript-eslint"],
      extends: [
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:mozilla/recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
      ],
      rules: {
        ...sharedRules,
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            varsIgnorePattern: "^_omit",
          },
        ],
        "@typescript-eslint/no-use-before-define": ["off"],
        "react/prop-types": ["off"],
      },
    },
  ],
};
