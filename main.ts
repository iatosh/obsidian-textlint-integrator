import { Plugin, MarkdownView } from 'obsidian';
import { TextlintEngine } from './src/textlint-engine';
import { TextlintSettings, TextlintSettingTab, DEFAULT_SETTINGS } from './src/settings';
import { textlintExtensions, applyLintResults } from './src/editor-extension';

export default class TextlintPlugin extends Plugin {
	settings: TextlintSettings;
	textlintEngine: TextlintEngine;

	async onload() {
		console.log('Loading textlint plugin');

		await this.loadSettings();
		this.textlintEngine = new TextlintEngine();

		// Initialize textlint engine
		try {
			await this.textlintEngine.initialize(this.settings);
		} catch (error) {
			console.error('Failed to initialize textlint engine:', error);
		}

		// Add settings tab
		this.addSettingTab(new TextlintSettingTab(this.app, this));

		// Add ribbon icon for manual linting
		this.addRibbonIcon('spell-check', 'Run textlint', () => {
			this.lintCurrentFile();
		});

		// Register CodeMirror extension for live linting
		this.registerEditorExtension(textlintExtensions);

		// Listen for lint requests from the editor
		this.registerDomEvent(document, 'textlint-request' as any, this.handleLintRequest.bind(this));
	}

	onunload() {
		console.log('Unloading textlint plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async lintCurrentFile() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView || !this.settings.enabled) {
			return;
		}

		const editor = activeView.editor;
		const content = editor.getValue();

		try {
			const messages = await this.textlintEngine.lintText(content, activeView.file?.path || 'temp.md');
			
			// Apply lint results to editor view
			const editorView = (activeView.editor as any).cm;
			if (editorView) {
				applyLintResults(editorView, messages);
			}
		} catch (error) {
			console.error('Linting failed:', error);
		}
	}

	private async handleLintRequest(event: CustomEvent) {
		if (!this.settings.enabled) {
			return;
		}

		const { content, view } = event.detail;

		try {
			const messages = await this.textlintEngine.lintText(content, 'temp.md');
			applyLintResults(view, messages);
		} catch (error) {
			console.error('Real-time linting failed:', error);
		}
	}
}