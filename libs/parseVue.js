const { compile } = require('vue-template-compiler');
const transformScriptContent = require('./transformScriptContent');

function getRender(code) {
    const { render } = compile(code);
    return render;
}

function getScriptContent(code) {
    const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/;
    const scriptContentMatch = code.match(scriptTagRegex);
    const scriptContent = scriptContentMatch && scriptContentMatch[1];
    return scriptContent;
}

function getOptions(code) {
    const scriptContent = getScriptContent(code);
    const transformedCode = transformScriptContent(scriptContent);
    const options = new Function(`return ${transformedCode}`)();
    const { props = {}, data: dataGenFunc = () => ({}), methods = {}, computed = {} } = options;
    const data = dataGenFunc();
    return {
        props,
        data,
        methods,
        computed
    }
}

module.exports = {
    getRender, getScriptContent, getOptions
}