const { analyseTemplate } = require('./libs/analyseTemplate');
const { analyseScript } = require('./libs/analyseScript');
const { lintCode } = require('./libs/lintCode');
const { getRender, getOptions, getScriptContent } = require('./libs/parseVue');
const findVarPos = require('./libs/findVarPos');


module.exports = async (code) => {
  const { data, props, methods, computed } = getOptions(code);

  const unusedIdsInTemplate = await analyseTemplate(code);
  const unusedIdsInScript = analyseScript(code);
  // 取交集
  const unusedIds = unusedIdsInTemplate.filter(id => unusedIdsInScript.includes(id));

  // 按功能分流
  const unusedIdsInData = unusedIds.filter(id => Object.keys(data).includes(id));
  const unusedIdsInProps = unusedIds.filter(id => Object.keys(props).includes(id));
  const unusedIdsInMethods = unusedIds.filter(id => Object.keys(methods).includes(id));
  const unusedIdsInComputed = unusedIds.filter(id => Object.keys(computed).includes(id));

  // 找位置，打标签
  const { propsLocArr, methodsLocArr, dataLocArr, computedLocArr } = findVarPos(code);
  const unusedPropsLocArr = propsLocArr.filter(sl => unusedIdsInProps.includes(sl.identifierName)).map(sl => ({ ...sl, _t: 'props' }));
  const unusedMethodsLocArr = methodsLocArr.filter(sl => unusedIdsInMethods.includes(sl.identifierName)).map(sl => ({ ...sl, _t: 'methods' }));
  const unusedDataLocArr = dataLocArr.filter(sl => unusedIdsInData.includes(sl.identifierName)).map(sl => ({ ...sl, _t: "data" }));
  const unusedComputedLocArr = computedLocArr.filter(sl => unusedIdsInComputed.includes(sl.identifierName)).map(sl => ({ ...sl, _t: "computed" }));

  return [...unusedPropsLocArr, ...unusedMethodsLocArr, ...unusedDataLocArr, ...unusedComputedLocArr]
}