const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;

module.exports = function (code) {
    const lines = code.split(/\r?\n/);
    let index = 0;
    while (true) {
        const thisLine = lines[index];
        lines[index++] = '';
        if (/<\s*script\s*[a-zA-Z0-9]*>/.test(thisLine)) break;
    }
    while (true) {
        if (/<\/\s*script\s*>/.test(lines[index])) break;
        index++;
    }
    while (index < lines.length) lines[index++] = '';
    const newCode = lines.join('\r\n');

    // 将源代码转换为AST
    const ast = babel.parse(newCode, {
        sourceType: "module" // 指定源代码类型为模块
    });

    const propsLocArr = [];
    const methodsLocArr = [];
    const dataLocArr = [];
    const computedLocArr = [];

    // 访问者对象
    const visitor = {
        // 访问ExportDefaultDeclaration节点
        ExportDefaultDeclaration(path) {
            // 检查是否导出了一个对象
            if (path.node.declaration.type === 'ObjectExpression') {
                // 遍历对象的属性
                path.node.declaration.properties.forEach(property => {
                    // 检查属性名是否为'data'
                    if (property.key.name === 'props') {
                        property.value.properties.forEach(p => {
                            propsLocArr.push(p.key.loc)
                        })
                    }
                    if (property.key.name === 'methods') {
                        property.value.properties.forEach(p => {
                            methodsLocArr.push(p.key.loc);
                        })
                    }
                    if (property.key.name === 'data') {
                        const argument = property.body.body.find(n => n.type === 'ReturnStatement').argument;
                        argument.type === 'ObjectExpression' && argument.properties.forEach(n => {
                            dataLocArr.push(n.key.loc);
                        })
                    }
                    if (property.key.name === 'computed') {
                        property.value.properties.forEach(p => {
                            computedLocArr.push(p.key.loc);
                        })
                    }
                });
            }
        }
    };

    // 使用traverse方法遍历AST
    traverse(ast, visitor);

    return {
        propsLocArr,
        methodsLocArr,
        dataLocArr,
        computedLocArr
    }
}