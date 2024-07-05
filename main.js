const { lintCode } = require('./libs/lintCode');
const { getRender, getOptions, getScriptContent } = require('./libs/parseVue');
const findVarPos = require('./libs/findVarPos');


module.exports = async (code) => {
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

  const unusedIdsInTemplate = await lintCode(resolvedCode);
  const unusedIds = unusedIdsInTemplate.filter(id => !scriptContent.includes(`this.${id}`));

  const unusedIdsInData = unusedIds.filter(id => Object.keys(data).includes(id));
  const unusedIdsInProps = unusedIds.filter(id => Object.keys(props).includes(id));
  const unusedIdsInMethods = unusedIds.filter(id => Object.keys(methods).includes(id));
  const unusedIdsInComputed = unusedIds.filter(id => Object.keys(computed).includes(id));

  const { propsLocArr, methodsLocArr, dataLocArr, computedLocArr } = findVarPos(code);
  const unusedPropsLocArr = propsLocArr.filter(sl => unusedIdsInProps.includes(sl.identifierName)).map(sl => ({...sl, _t: 'props'}));
  const unusedMethodsLocArr = methodsLocArr.filter(sl => unusedIdsInMethods.includes(sl.identifierName)).map(sl => ({...sl, _t: 'methods'}));
  const unusedDataLocArr = dataLocArr.filter(sl => unusedIdsInData.includes(sl.identifierName)).map(sl => ({...sl, _t: "data"}));
  const unusedComputedLocArr = computedLocArr.filter(sl => unusedIdsInComputed.includes(sl.identifierName)).map(sl => ({...sl, _t: "computed"}));
  
  return [...unusedPropsLocArr, ...unusedMethodsLocArr, ...unusedDataLocArr, ...unusedComputedLocArr]
}