const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
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


function changeContentColorToRed(editor, locArr) {
	const decorationType = vscode.window.createTextEditorDecorationType({
		color: 'red' // 文本颜色为红色
	});

	const rangeArr = locArr.map(p => new vscode.Range(
		editor.document.lineAt(p.start.line - 1).range.start.translate(0, p.start.column),
		editor.document.lineAt(p.end.line - 1).range.start.translate(0, p.end.column)
	));

	editor.setDecorations(decorationType, rangeArr);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
