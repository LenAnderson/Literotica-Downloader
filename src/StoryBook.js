${include-once: Book.js}
class StoryBook extends Book {
	constructor(root) {
		super(root);

		this._link = null;
		this._url = null;
		this._description = null;
	}




	get link() {
		if (!this._link) {
			this._link = this.root.querySelector('a.bb');
		}
		return this._link;
	}

	get title() {
		if (!this._title) {
			this._title = this.link.textContent.trim();
		}
		return this._title;
	}

	get url() {
		if (!this._url) {
			this._url = this.link.href;
		}
		return this._url;
	}

	get filename() {
		if (!this._filename) {
			this._filename = `${this.title} (${this.author}).html`;
		}
		return this._filename;
	}


	get description() {
		if (!this._description) {
			this._description = this.root.parentElement.children[1].textContent.trim();
		}
		return this._description;
	}




	async retrieveContentDom(url) {
		const html = await getHtml(url || this.url);
		const numPages = Number(html.querySelector('.b-pager-caption-t').textContent.trim().replace(/^(\d+)[^\d]*$/, '$1'));
		const curPage = Number(html.querySelector('.b-pager-active').textContent.trim());
		if (!url) {
			this.progress.steps = numPages;
		}
		this.progress.currentStep++;
		this.progress.status = `Getting page ${curPage} of ${numPages}`;
		
		const body = html.querySelector('.b-story-body-x')
		if (!url) {
			const header = document.createElement('h2'); {
				header.classList.add('header');
				header.textContent = this.description;
				body.insertBefore(header, body.firstChild);
			}
		}

		const next = html.querySelector('.b-pager-next');
		if (next) {
			const nextBody = await this.retrieveContentDom(next.href);
			Array.from(nextBody.children).forEach(it=>body.appendChild(it));
		}
		return body;
	}

	async retrieveContent(url) {
		await wait(2);

		const body = await this.retrieveContentDom(url);
		return body.innerHTML;
	}
}