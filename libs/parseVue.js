const { compile } = require('vue-template-compiler');
const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;

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
    const props = [], data = [], methods = [], computed = [];
    
    
    if (scriptContent) {
        const ast = babel.parse(scriptContent, {
            sourceType: "module"
        });
        
        const visitor = {
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
                                props.push(ele.value);
                            })
                        } else {
                            property.value.properties.forEach(p => {
                                p.key && props.push(p.key.name)
                            })
                        }
                    }
                    if (property.key.name === 'methods') {
                        property.value.properties.forEach(p => {
                            p.key && methods.push(p.key.name);
                        })
                    }
                    if (property.key.name === 'data') {
                        const argument = property.body.body.find(n => n.type === 'ReturnStatement').argument;
                        argument.type === 'ObjectExpression' && argument.properties.forEach(n => {
                            n.key && data.push(n.key.name);
                        })
                    }
                    if (property.key.name === 'computed') {
                        property.value.properties.forEach(p => {
                            p.key && computed.push(p.key.name);
                        })
                    }
                });
            }
        };

        traverse(ast, visitor);
    }

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