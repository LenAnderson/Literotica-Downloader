class ProgressInfo {
	constructor() {
		this._status = '';
		this._steps = 1;
		this._currentStep = 0;

		this._subProgress = null;

		this.dom = {
			root: null,
			status: null,
			progressBar: {
				root: null,
				progress: null
			},
			subProgress: null
		};
		this.buildGui();
		this.status = '...';
	}

	get status() { return this._status; }
	set status(value) {
		if (this._status != value) {
			this._status = value;
			this.dom.status.textContent = value;
		}
	}

	get steps() { return this._steps || 1; }
	set steps(value) {
		if (this._steps != value) {
			this._steps = value;
			this.updateProgressBar();
		}
	}

	get currentStep() { return this._currentStep; }
	set currentStep(value) {
		if (this._currentStep != value) {
			this._currentStep = value;
			this.updateProgressBar();
		}
	}

	get subProgress() { return this._subProgress; }
	set subProgress(value) {
		if (this._subProgress != value) {
			if (this._subProgress) {
				this._subProgress.dom.root.remove();
			}
			this._subProgress = value;
			if (value) {
				this.dom.subProgress.appendChild(value.dom.root);
			}
		}
	}




	buildGui() {
		const template = document.createElement('template');
		template.innerHTML = '${include-min-esc: html/ProgressInfo.html}';

		this.dom.root = template.content.querySelector('.lidow-progress');
		this.dom.status = this.dom.root.querySelector('.lidow-progress-status');
		this.dom.progressBar.root = this.dom.root.querySelector('.lidow-progress-barContainer');
		this.dom.progressBar.progress = this.dom.root.querySelector('.lidow-progress-barProgress');
		this.dom.subProgress = this.dom.root.querySelector('.lidow-progress-subContainer');
	}


	updateProgressBar() {
		this.dom.progressBar.progress.style.width = `${this.currentStep / this.steps * 100}%`;
		log(`${this.currentStep / this.steps * 100}%`);
	}
}