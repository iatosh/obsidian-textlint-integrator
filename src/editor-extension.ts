import { 
	EditorView, 
	Decoration, 
	DecorationSet, 
	ViewPlugin, 
	ViewUpdate,
	hoverTooltip
} from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { TextlintMessage } from './textlint-engine';

// State effect to add lint decorations
const addLintEffect = StateEffect.define<TextlintMessage[]>();

// State field to store lint decorations
const lintField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(decorations, tr) {
		decorations = decorations.map(tr.changes);

		for (const effect of tr.effects) {
			if (effect.is(addLintEffect)) {
				const messages = effect.value;
				const newDecorations = messages.map(message => {
					const pos = lineColumnToPos(tr.state.doc, message.line - 1, message.column - 1);
					const className = message.severity === 2 ? 'textlint-error' : 'textlint-warning';
					
					return Decoration.mark({
						class: className,
						attributes: {
							'data-textlint-message': message.message,
							'data-textlint-rule': message.ruleId || 'unknown'
						}
					}).range(pos, pos + 1);
				});

				decorations = decorations.update({
					add: newDecorations
				});
			}
		}

		return decorations;
	},
	provide: f => EditorView.decorations.from(f)
});

// Helper function to convert line/column to position
function lineColumnToPos(doc: any, line: number, column: number): number {
	if (line < 0 || line >= doc.lines) return 0;
	
	const lineObj = doc.line(line + 1);
	return Math.min(lineObj.from + column, lineObj.to);
}

// Hover tooltip for lint messages
const lintTooltip = hoverTooltip((view, pos, side) => {
	const decorations = view.state.field(lintField);
	let message = '';
	let ruleId = '';

	decorations.between(pos, pos, (from, to, decoration) => {
		const attrs = decoration.spec.attributes;
		if (attrs && attrs['data-textlint-message']) {
			message = attrs['data-textlint-message'];
			ruleId = attrs['data-textlint-rule'] || '';
		}
	});

	if (message) {
		return {
			pos,
			above: true,
			create: () => {
				const dom = document.createElement('div');
				dom.className = 'textlint-tooltip';
				dom.innerHTML = `
					<div class="textlint-message">${message}</div>
					${ruleId ? `<div class="textlint-rule">Rule: ${ruleId}</div>` : ''}
				`;
				return { dom };
			}
		};
	}

	return null;
});

// ViewPlugin for textlint integration
export const textlintViewPlugin = ViewPlugin.fromClass(class {
	private lintTimeout: NodeJS.Timeout | null = null;

	constructor(public view: EditorView) {}

	update(update: ViewUpdate) {
		if (update.docChanged) {
			this.scheduleLint();
		}
	}

	private scheduleLint() {
		if (this.lintTimeout) {
			clearTimeout(this.lintTimeout);
		}

		this.lintTimeout = setTimeout(() => {
			this.runLint();
		}, 500); // Debounce linting
	}

	private runLint() {
		const content = this.view.state.doc.toString();
		// This will be called by the plugin to perform linting
		// For now, we'll emit a custom event that the plugin can listen to
		this.view.dom.dispatchEvent(new CustomEvent('textlint-request', {
			detail: { content, view: this.view }
		}));
	}

	destroy() {
		if (this.lintTimeout) {
			clearTimeout(this.lintTimeout);
		}
	}
});

// Export function to apply lint results
export function applyLintResults(view: EditorView, messages: TextlintMessage[]) {
	view.dispatch({
		effects: addLintEffect.of(messages)
	});
}

// Export the extensions
export const textlintExtensions = [
	lintField,
	textlintViewPlugin,
	lintTooltip
];