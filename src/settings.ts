import { App, PluginSettingTab, Setting } from 'obsidian';
import TextlintPlugin from '../main';

export interface TextlintSettings {
	enabled: boolean;
	rules: Record<string, any>;
	autoFix: boolean;
}

export const DEFAULT_SETTINGS: TextlintSettings = {
	enabled: true,
	rules: {},
	autoFix: false
};

export class TextlintSettingTab extends PluginSettingTab {
	plugin: TextlintPlugin;

	constructor(app: App, plugin: TextlintPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Enable textlint')
			.setDesc('Enable or disable textlint integration')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enabled)
				.onChange(async (value) => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto-fix on save')
			.setDesc('Automatically fix issues when possible')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoFix)
				.onChange(async (value) => {
					this.plugin.settings.autoFix = value;
					await this.plugin.saveSettings();
				}));

		// Rules configuration will be added later
		containerEl.createEl('h3', { text: 'Rules Configuration' });
		containerEl.createEl('p', { 
			text: 'Rule management will be implemented in future versions.',
			cls: 'setting-item-description'
		});
	}
}