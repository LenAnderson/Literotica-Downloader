${include-once: Book.js}
${include-once: StoryBook.js}
class SeriesBook extends Book {
	constructor(root) {
		super(root);

		this._chapters = null;
	}




	get title() {
		if (!this._title) {
			this._title = this.root.querySelector('strong').textContent.replace(/\: \d+ Part Series$/, '');
		}
		return this._title;
	}

	get filename() {
		if (!this._filename) {
			this._filename = `${this.title} (${this.author}, ${this.chapters.length}).html`;
		}
		return this._filename;
	}

	get chapters() {
		if (!this._chapters) {
			this._chapters = [];
			let row = this.root.parentElement.nextElementSibling;
			while (row && row.classList.contains('sl') && !row.classList.contains('ser-ttl')) {
				const cell = row.querySelector('td:nth-child(1)');
				if (cell) {
					this._chapters.push(new StoryBook(cell));
				}
				row = row.nextElementSibling;
			}
		}
		return this._chapters;
	}




	async retrieveContent(url) {
		const body = document.createElement('div');
		this.progress.steps = this.chapters.length;
		for (let index = 0; index < this.chapters.length; index++) {
			const chapter = this.chapters[index];
			await wait(2);
			this.progress.currentStep++;
			this.progress.status = `Getting chapter ${index+1} of ${this.chapters.length}`;
			this.progress.subProgress = chapter.progress;
			if (index > 0) {
				const chapterSeparator = document.createElement('hr'); {
					chapterSeparator.classList.add('chapterSeparator');
					body.appendChild(chapterSeparator);
				}
			}
			const chapterNumber = document.createElement('h2'); {
				chapterNumber.classList.add('chapterNumber');
				chapterNumber.textContent = `Chapter ${String(index+1).padStart(2, '0')}`;
				body.appendChild(chapterNumber);
			}
			body.appendChild(await chapter.retrieveContentDom());
			const chapterEnd = document.createElement('h2'); {
				chapterEnd.classList.add('chapterEnd');
				chapterEnd.textContent = `End Chapter ${index+1}`;
				body.appendChild(chapterEnd);
			}
		}
		return body.innerHTML;
	}
}