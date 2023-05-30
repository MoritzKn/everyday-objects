module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {},
};

// module.exports = {
//     root: true,
//     extends: ["eslint:recommended", "plugin:prettier/recommended"],
//     parser: "@babel/eslint-parser",
//     requireConfigFile: false,
//   };
