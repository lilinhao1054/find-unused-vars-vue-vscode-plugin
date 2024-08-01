const { lintCode } = require('./lintCode');
const { getRender, getOptions, getScriptContent } = require('./parseVue');

async function analyseTemplate(code) {
  const render = getRender(code);
  const scriptContent = getScriptContent(code);
  const options = getOptions(code);
  const { props, data, methods, computed } = options;

  function renderVars(keys) {
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
  const unusedIdsInTemplate = unusedIds.filter(id => data.includes(id)
    || props.includes(id)
    || methods.includes(id)
    || computed.includes(id));

  return unusedIdsInTemplate;
}

module.exports = {
  analyseTemplate
}