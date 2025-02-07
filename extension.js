const vscode = require('vscode');
const fs = require('fs');
const fuvv = require('./main');

const decorationType = vscode.window.createTextEditorDecorationType({
	color: '#808080',
});

class UnusedVarHoverProvider {
	constructor() {
		this.locArr = [];
	}
	provideHover(document, position, tokens) {
		const wordRange = document.getWordRangeAtPosition(position);
		if (wordRange) {
			if (this.locArr.some(p => wordRange.start.line + 1 === p.start.line && wordRange.end.line + 1 === p.end.line && wordRange.start.character === p.start.column && wordRange.end.character === p.end.column)) {
				const word = document.getText(wordRange);
				// 根据word来决定显示的悬停信息
				const type = this.locArr.find(loc => loc.identifierName === word)._t;
				const hoverMarkdown = new vscode.MarkdownString(`fuvv: 对SFC文件进行静态分析，**${type}: ${word}**未被使用`);
				hoverMarkdown.isTrusted = true; // 确保Markdown内容是安全的
				return new vscode.Hover(hoverMarkdown);
			}
		}
		return undefined;
	}

	setLocArr(locArr) {
		this.locArr = locArr;
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	let locArr;

	const hoverProvider = new UnusedVarHoverProvider();
	const selector = { language: 'vue' };
	const registration = vscode.languages.registerHoverProvider(selector, hoverProvider);

	async function resovleMark(code) {
		try {
			locArr = await fuvv(code);
			markUnusedVarInColor(locArr);
			hoverProvider.setLocArr(locArr);

		} catch (error) {
			vscode.window.showInformationMessage('fuvv: syntax error');
		}
	}

	let lis1;
	let lis2;

	context.subscriptions.push(vscode.commands.registerCommand('find-unused-vars-vue.fuvv', function () {
		vscode.window.showInformationMessage('fuvv is active!');

		// init
		resovleMark(vscode.window.activeTextEditor.document.getText());

		lis1 = vscode.workspace.onDidSaveTextDocument(document => {
			resovleMark(document.getText());
		});

		lis2 = vscode.window.onDidChangeActiveTextEditor(e => {
			resovleMark(e.document.getText());
		})

		context.subscriptions.push(lis1, lis2);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('find-unused-vars-vue.cfuvv', function () {
		lis1.dispose();
		lis2.dispose();
		vscode.window.activeTextEditor.setDecorations(decorationType, []);
		hoverProvider.setLocArr([]);
	}));
}

/**
 * 
 * @param {vscode.TextEditor} editor 
 * @param {[]} locArr 
 */
function markUnusedVarInColor(locArr) {
	const editor = vscode.window.activeTextEditor;
	const rangeArr = locArr.map(p => new vscode.Range(
		editor.document.lineAt(p.start.line - 1).range.start.translate(0, p.start.column),
		editor.document.lineAt(p.end.line - 1).range.start.translate(0, p.end.column)
	));
	editor.setDecorations(decorationType, []);
	editor.setDecorations(decorationType, rangeArr);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
