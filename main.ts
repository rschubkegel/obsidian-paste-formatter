import { App, Editor, Plugin, PluginSettingTab, Setting } from "obsidian";

interface FormattingRule {
	/**
	 * Regular expression for this rule.
	 */
	regex: string;
	/**
	 * Formatting string used when formatting pasted content.
	 */
	replacement: string;
	/**
	 * Allows individual rules to be enabled/disabled.
	 */
	isEnabled: boolean;
}

interface PasteFormatterSettings {
	formattingRules: FormattingRule[];
}

const DEFAULT_SETTINGS: PasteFormatterSettings = {
	formattingRules: [],
};

export default class PasteFormatterPlugin extends Plugin {
	settings: PasteFormatterSettings;

	async onload() {
		await this.loadSettings();

		// Add plugin settings tab
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// Add the main paste event handler
		this.registerEvent(
			this.app.workspace.on("editor-paste", this.handlePaste.bind(this))
		);

		// Add command to paste without formatting (one-time override)
		this.addCommand({
			id: "paste-without-formatting",
			name: "Paste without formatting",
			editorCallback: (editor: Editor) => {
				navigator.clipboard.readText().then((text) => {
					editor.replaceSelection(text);
				});
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async handlePaste(event: ClipboardEvent, editor: Editor) {
		// Get clipboard text
		const clipboardText = event.clipboardData?.getData("text/plain");

		// Nothing to format!
		if (!clipboardText) return;

		// Check each user-defined rule to see if the clipboard content matches any regex
		for (let i = 0; i < this.settings.formattingRules.length; i++) {
			const {
				regex: regexString,
				replacement: replacementString,
				isEnabled,
			} = this.settings.formattingRules[i];

			// Skip disabled rules
			if (!isEnabled) continue;

			// Compile regex
			const regex = new RegExp(regexString);

			// Check if regex matches
			const match = regex.exec(clipboardText);
			if (!match) continue;

			// Make sure that the groups match the placeholders in the replacement string
			const placeholderNames = replacementString.match(/\$\{([^}]+)\}/g);

			// Replace placeholders with matched groups and return formatted text
			let replacement = replacementString;
			if (placeholderNames) {
				for (let j = 0; j < placeholderNames.length; j++) {
					const placeholderName = placeholderNames[j].substring(
						2,
						placeholderNames[j].length - 1
					);
					const group = match.groups?.[placeholderName];
					if (group) {
						replacement = replacement.replace(
							placeholderNames[j],
							group
						);
					}
				}
			}

			// Replace selection
			event.preventDefault();
			editor.replaceSelection(clipboardText.replace(regex, replacement));
			break;
		}
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: PasteFormatterPlugin;

	constructor(app: App, plugin: PasteFormatterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Add new rule button
		new Setting(containerEl).setName("Add New Rule").addButton((button) =>
			button
				.setButtonText("+ Add Formatting Rule")
				.setCta()
				.onClick(async () => {
					this.plugin.settings.formattingRules.push({
						regex: "",
						replacement: "",
						isEnabled: true,
					});
					await this.plugin.saveSettings();
					this.display();
				})
		);

		// Separator
		containerEl.createEl("hr");

		// Add a section for each formatting rule
		this.plugin.settings.formattingRules.forEach((rule, index) => {
			const ruleSection = containerEl.createEl("div", {
				cls: "paste-formatter-rule-section",
			});

			// Regex input
			new Setting(ruleSection)
				.setName("Regex Pattern")
				.setDesc("Regular expression to match")
				.setClass("paste-formatter-regex")
				.addText((text) =>
					text
						.setPlaceholder("Enter regex pattern")
						.setValue(rule.regex)
						.onChange(async (value) => {
							this.plugin.settings.formattingRules[index].regex =
								value;
							await this.plugin.saveSettings();
						})
						.inputEl.addClass("paste-formatter-regex-input")
				);

			// Replacement input
			new Setting(ruleSection)
				.setName("Replacement Pattern")
				.setDesc(
					"Replacement format (use ${group_name} for capture groups)"
				)
				.setClass("paste-formatter-replacement")
				.addText((text) =>
					text
						.setPlaceholder("Enter replacement pattern")
						.setValue(rule.replacement)
						.onChange(async (value) => {
							this.plugin.settings.formattingRules[
								index
							].replacement = value;
							await this.plugin.saveSettings();
						})
						.inputEl.addClass("paste-formatter-replacement-input")
				);

			// Rule toggle
			new Setting(ruleSection)
				.setName("Enabled")
				.addToggle((toggle) =>
					toggle
						.setValue(rule.isEnabled)
						.setTooltip("Enabled")
						.onChange(async (value) => {
							this.plugin.settings.formattingRules[
								index
							].isEnabled = value;
							await this.plugin.saveSettings();
						})
				);

				// Delete button
				new Setting(ruleSection)
					.setName("Delete Rule")
					.addButton((button) =>
						button
							.setIcon("trash")
							.setTooltip("Delete Rule")
							.onClick(async () => {
								this.plugin.settings.formattingRules.splice(
									index,
									1
								);
								await this.plugin.saveSettings();
								this.display();
							})
					);

			// Separator
			if (index < this.plugin.settings.formattingRules.length - 1) {
				containerEl.createEl("hr");
			}
		});
	}
}
