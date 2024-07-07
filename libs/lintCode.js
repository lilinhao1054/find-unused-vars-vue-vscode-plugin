global.structuredClone = (val) => JSON.parse(JSON.stringify(val))

const { ESLint } = require("eslint");

function getUnusedVarId(messages) {
  return messages.map(item => {
    const match = item.message.match(/'(.*)' is defined but never used./);
    return match && match[1];
  });
}

// Create an instance of ESLint with the configuration passed to the function
function createESLintInstance(overrideConfig) {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig,
    fix: true
  });
}

// Put previous functions all together
async function lintCode(code) {

  // The ESLint configuration. Alternatively, you could load the configuration
  // from an eslint.config.js file or just use the default config.
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