const babelTraverse = require("@babel/traverse").default;
const babelParser = require("@babel/parser");
const babelTemplate = require("@babel/template").default;
const t = require("@babel/types");
const generate = require("@babel/generator").default;

module.exports = function (scriptContent) {
  // 使用Babel解析器将代码转换为AST
  const ast = babelParser.parse(scriptContent, {
    sourceType: "module"
  });

  // 用于存储新的import语句
  const newImports = [];

  let componentObject;

  let otherVarDec = [];

  // 使用Babel Traverse遍历AST
  babelTraverse(ast, {
    // 访问ImportDeclaration节点
    ImportDeclaration(path) {
      // 获取导入的默认或命名声明
      const { node } = path;
      const importNames = node.specifiers.map(specifier => {
        if (specifier.type === 'ImportDefaultSpecifier') {
          return {
            kind: 'const',
            name: specifier.local.name
          };
        } else if (specifier.type === 'ImportSpecifier') {
          return {
            kind: 'const',
            name: specifier.imported.name,
          };
        }
      }).filter(Boolean);

      // 将每个导入转换为变量声明
      importNames.forEach(specifier => {
        const varDecl = babelTemplate.statement(`var ${specifier.name} = {};`)();
        newImports.push(varDecl);
      });

      // 移除原始的import声明
      path.remove();
    },
    // 访问ExportDefaultDeclaration节点
    ExportDefaultDeclaration(path) {
      componentObject = path.node.declaration;
    },
    VariableDeclaration(path) {
      otherVarDec.push(path.node);
    }
  });

  // 创建自执行函数表达式
  const iife = t.callExpression(
    t.functionExpression(
      null, // 匿名函数
      [], // 无参数
      t.blockStatement([
        ...newImports,
        ...otherVarDec,
        t.returnStatement(componentObject) // 返回组件对象
      ])
    ),
    []
  );

  // 替换AST的根节点
  ast.program.body = [iife];

  // 使用@babel/generator生成最终代码
  const { code } = generate(ast, {
    concise: true
  }, scriptContent);

  return code;
}