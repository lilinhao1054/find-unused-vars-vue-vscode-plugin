const { lintCode } = require('./lintCode');
const { getRender, getOptions, getScriptContent } = require('./parseVue');

async function analyseTemplate(code) {
  const render = getRender(code);
  const scriptContent = getScriptContent(code);
  const options = getOptions(code);
  const { props, data, methods, computed } = options;

  function renderVars(obj) {
    const keys = Object.keys(obj);
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
  const unusedIdsInTemplate = unusedIds.filter(id => Object.keys(data).includes(id)
    || Object.keys(props).includes(id)
    || Object.keys(methods).includes(id)
    || Object.keys(computed).includes(id));

  return unusedIdsInTemplate;
}

module.exports = {
  analyseTemplate
}