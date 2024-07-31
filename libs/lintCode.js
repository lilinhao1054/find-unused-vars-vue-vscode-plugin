global.structuredClone = (val) => JSON.parse(JSON.stringify(val))

const { ESLint } = require("eslint");

function getUnusedVarId(messages) {
  return messages.map(item => {
    const match = item.message.match(/'(.*)' is defined but never used./);
    return match && match[1];
  });
}

function createESLintInstance(overrideConfig) {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig,
    fix: true
  });
}

async function lintCode(code) {
  const overrideConfig = {
    rules: {
      "no-unused-vars": "error",
    },
  };

  const eslint = createESLintInstance(overrideConfig);
  const results = await eslint.lintText(code);
  return getUnusedVarId(results[0].messages);
}

module.exports = { lintCode }