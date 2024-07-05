// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "find-unused-vars-vue" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('find-unused-vars-vue.fuvv', async function () {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const locArr = await require('./main')(document.getText())
			if (document.uri.scheme === 'file' && document.uri.path.endsWith('.vue')) {
				changeContentColorToRed(editor, locArr);
			}
		}
	});

	context.subscriptions.push(disposable);
}

// 改变内容颜色为红色的函数
function changeContentColorToRed(editor, locArr) {
	// 创建装饰器类型
	const decorationType = vscode.window.createTextEditorDecorationType({
		color: 'red' // 文本颜色为红色
	});

	const rangeArr = locArr.map(p => new vscode.Range(
		editor.document.lineAt(p.start.line - 1).range.start.translate(0, p.start.column),
		editor.document.lineAt(p.end.line - 1).range.start.translate(0, p.end.column)
	));

	// 应用装饰器
	editor.setDecorations(decorationType, rangeArr);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
