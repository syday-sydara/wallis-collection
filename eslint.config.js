import next from "eslint-config-next";

export default [
  next(),
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];