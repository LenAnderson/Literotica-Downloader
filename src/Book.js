${include-once: ProgressInfo.js}
class Book {
	constructor(root) {
		this.root = root;
		this._author = null;
		this._title = null;
		this._filename = null;
		this.content = null;

		this.progress = new ProgressInfo();
	}




	get author() {
		if (!this._author) {
			this._author = $('.contactheader').textContent.trim();
		}
		return this._author;
	}

	get title() {
		throw 'getter for Book.title is not implemented';
	}
	get ucTitle() {
		return this.title.split(' ').map(it=>`${it[0].toUpperCase()}${it.substring(1)}`).join(' ');
	}

	get filename() {
		throw 'getter for Book.filename is not implemented';
	}

	get filenameWithExtension() {
		throw 'getter for Book.filenameWithExtension is not implemented';
	}




	async create() {
		this.content = '${include-min-esc: html/Book.html}'
				.replace('{{style}}', '${include-min-esc: css/book.css}')
				.replace('{{author}}', this.author)
				.replace('{{title}}', this.ucTitle)
				.replace('{{filename}}', this.filename)
				.replace('{{content}}', await this.retrieveContent());
	}

	async retrieveContent() {
		throw 'Book.retrieveContent is not implemented';
	}


	download() {
		if (this.content) {
			const blob = new Blob([this.content], {type:'text/html'});
			const url = URL.createObjectURL(blob);
			log('downloading...', url);
			GM_download({
				url: url,
				name: this.filenameWithExtension,
				onerror: (err)=>log(err)
			});
		} else {
			throw 'Book has not been created';
		}
	}
}