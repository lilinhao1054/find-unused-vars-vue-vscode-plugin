const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const changeCase = require('change-case-commonjs');
const { getOptions, getScriptContent } = require('./parseVue');

const compileProject = (projectPath) => new Promise((resolve, reject) => {
  const configPath = path.resolve(projectPath, './webpack.config.js');
  const config = {
    mode: 'development',
    entry: path.resolve(projectPath, './main.js'),
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: path.resolve(__dirname, './my-vue-loader.js'),
        }
      ]
    },
    ...fs.existsSync(configPath) ? require(configPath) : {}
  }
  webpack(config, (err, stats) => {
    if (err) return reject(err);

    // 获取编译统计信息
    const jsonStats = stats.toJson({
      all: false,
      builtAt: false,
      hash: false,
      timings: false,
      assets: false,
      chunks: false,
      modules: true,
      reasons: true,
      warnings: false,
      errors: false,
      version: false,
      children: false, // 避免递归获取子编译的统计信息
    });
    resolve(jsonStats);
  });
})

const findReferencingFiles = (jsonStats, targetFile) => {
  // 存储引用了 targetFile 的文件
  const referencingFiles = new Map();

  const getModuleId = (id) => {
    const match = id?.match(/my-vue-loader.js!(.*)/);
    return match ? match[1] : id;
  }

  jsonStats.modules.find(module => getModuleId(module.identifier) === targetFile)
    ?.reasons.forEach(reason => {
      reason.type === 'harmony import specifier' && referencingFiles.set(getModuleId(reason.moduleIdentifier), reason.loc);
    })

  return referencingFiles;;
}

const resolveParentFile = (file, loc) => {
  const code = fs.readFileSync(file).toString();
  const scriptContent = getScriptContent(code);

  let componentKey = '';

  const ast = babel.parse(scriptContent, {
    sourceType: "module" // 指定源代码类型为模块
  });

  traverse(ast, {
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
        if (property.key.name === 'components') {
          property.value.properties.forEach(p => {
            const { start, end } = p.value.loc;
            const _loc = `${start.line}:${start.column}-${end.column}`;
            if (loc === _loc) {
              p.key.type === 'StringLiteral' && (componentKey = p.key.value);
              p.key.type === 'Identifier' && (componentKey = p.key.name);
            }
          })
        }
      });
    }
  });

  if (!componentKey) return [];

  const regex = new RegExp(`<(${componentKey}|${changeCase.kebabCase(componentKey)})\\s+ref="([^"]+)"`, 'i');
  const match = code.match(regex);
  let ref = null;
  match && (ref = match[2]);

  if (!ref) return [];

  const transform2class = {
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
      // 检查是否导出的是对象字面量
      // 创建一个新的类声明
      const className = t.identifier('DefaultClass');
      const classBody = t.classBody([]);

      // 遍历对象属性，转换为类属性或方法
      ObjectExp.properties.forEach(property => {
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

  const usedIds = [];
  const findUsedVar = {
    MemberExpression(path) {
      if (path.node.object.property && path.node.object.property.name === ref) {
        usedIds.push(path.node.property.name);
      }
    }
  }

  traverse(ast, transform2class);
  traverse(ast, findUsedVar);

  return usedIds;
}

module.exports = async function (projectPath, filePath) {
  const jsonStats = await compileProject(projectPath);
  const referencingFiles = findReferencingFiles(jsonStats, filePath);
  let usedIds = [];
  referencingFiles.forEach((loc, file) => {
    usedIds = [...usedIds, ...resolveParentFile(file, loc)];
  })
  return usedIds;
}