const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const t = require("@babel/types");
const { getScriptContent, getOptions } = require('./parseVue');

function analyseScript(code) {
  const scriptContent = getScriptContent(code);
  const { data, methods, props, computed } = getOptions(code);

  const transform2class = {
    ExportDefaultDeclaration(path) {
      const { node } = path;
      const declaration = path.node.declaration;

      // 检查是否导出的是对象字面量
      if (t.isObjectExpression(declaration)) {
        // 创建一个新的类声明
        const className = t.identifier('DefaultClass');
        const classBody = t.classBody([]);

        // 遍历对象属性，转换为类属性或方法
        node.declaration.properties.forEach(property => {
          if (t.isObjectProperty(property)) {
            // 转换属性
            classBody.body.push(
              t.classProperty(property.key, property.value)
            );
          } else if (t.isObjectMethod(property)) {
            // 转换方法
            classBody.body.push(property);
          }
        });

        // 创建新的类声明节点
        const classDeclaration = t.classDeclaration(className, null, classBody);

        // 替换原来的导出声明
        path.replaceWith(classDeclaration);
      }
    }
  }

  const addDec = {
    ClassDeclaration(path) {
      // 创建一个新的类属性声明
      const customProp = t.classProperty(t.identifier('customProperty'), t.stringLiteral('defaultValue'));
      const dataDec = Object.keys(data).map(key => t.classProperty(t.identifier(key)));
      const propsDec = Object.keys(props).map(key => t.classProperty(t.identifier(key)));
      const computedDec = Object.keys(computed).map(key => t.classProperty(t.identifier(key)));

      const methodsDec = Object.keys(methods).map(key => t.classMethod('method', t.identifier(key), [], t.blockStatement([])));

      // 获取类体
      const classBody = path.node.body;

      // 将自定义属性添加到类体的属性列表中
      classBody.body.unshift(...dataDec, ...propsDec, ...computedDec);
      classBody.body.push(...methodsDec);
    },
  }

  const allIds = new Set();
  const usedIds = new Set();
  const findUnusedVar = {
    ClassDeclaration(path) {
      // 记录类属性
      path.node.body.body.forEach((node) => {
        if (node.type === 'ClassProperty' || node.type === 'ClassMethod') {
          allIds.add(node.key.name);
        }
      });
    },
    CallExpression(path) {
      // 检查是否调用了类的方法，并且使用类属性
      if (allIds.has(path.node.callee.property)) {
        usedIds.add(path.node.callee.property);
      }
    },
    MemberExpression(path) {
      // 检查是否访问了类的属性
      if (allIds.has(path.node.property.name)) {
        usedIds.add(path.node.property.name);
      }
    }
  }

  const ast = babel.parse(scriptContent, {
    sourceType: 'module',
  });

  traverse(ast, transform2class);

  traverse(ast, addDec)

  traverse(ast, findUnusedVar);

  const unusedIds = [...allIds].filter(item => !usedIds.has(item));

  const unusedIdsInScript = unusedIds.filter(id => Object.keys(data).includes(id)
    || Object.keys(props).includes(id)
    || Object.keys(methods).includes(id)
    || Object.keys(computed).includes(id));

  return unusedIdsInScript;
}

module.exports = { analyseScript }