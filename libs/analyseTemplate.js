const { lintCode } = require('./lintCode');
const { getRender, getOptions, getScriptContent } = require('./parseVue');
const getKeys = require('./getKeys');

async function analyseTemplate(code) {
  const render = getRender(code);
  const scriptContent = getScriptContent(code);
  const options = getOptions(code);
  const { props, data, methods, computed } = options;

  function renderVars(obj) {
    const keys = getKeys(obj);
    return keys.length === 0 ? '' : `var ${keys.join(',')};`
  }

  const resolvedCode = `
    ${renderVars(props)}
    ${renderVars(data)}
    ${renderVars(methods)}
    ${renderVars(computed)}

    ${render.substring(17, render.length - 1)}
`

  const unusedIds = await lintCode(resolvedCode);
  const unusedIdsInTemplate = unusedIds.filter(id => getKeys(data).includes(id)
    || getKeys(props).includes(id)
    || getKeys(methods).includes(id)
    || getKeys(computed).includes(id));

  return unusedIdsInTemplate;
}

module.exports = {
  analyseTemplate
}