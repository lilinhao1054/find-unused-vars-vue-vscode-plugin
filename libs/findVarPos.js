const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;

module.exports = function (code) {
    const lines = code.split(/\r?\n/);
    let index = 0;
    while (true) {
        if (/<\s*script\s*[a-zA-Z0-9]*>/.test(lines[index])) break;
        lines[index++] = '';
    }
    lines[index] = lines[index].replace(/.*<\s*script\s*[a-zA-Z0-9]*>/, (match) => {
        return ' '.repeat(match.length);
    });
    while (true) {
        if (/<\s*\/\s*script\s*[a-zA-Z0-9]*>/.test(lines[index])) break;
        index++;
    }
    lines[index] = lines[index].replace(/<\s*\/\s*script\s*[a-zA-Z0-9]*>.*/, (match) => {
        return ' '.repeat(match.length);
    });
    index++;
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
            let ObjectExp;
            if (path.node.declaration.type === 'Identifier') {
                traverse(ast, {
                    VariableDeclaration(variableDeclarationPath) {
                        variableDeclarationPath.node.declarations.forEach(declarator => {
                            if (declarator.id.name === path.node.declaration.name) {
                                ObjectExp = declarator.init;
                            }
                        });
                    }
                });
            }
            ObjectExp = ObjectExp || path.node.declaration;
            ObjectExp.properties.forEach(property => {
                if (property.key.name === 'props') {
                    if (property.value.type === 'ArrayExpression') {
                        property.value.elements.forEach(ele => {
                            propsLocArr.push({ ...ele.loc, identifierName: ele.value });
                        })
                    } else {
                        property.value.properties.forEach(p => {
                            propsLocArr.push(p.key.loc)
                        })
                    }
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