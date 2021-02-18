// ==UserScript==
// @name         Literotica Downloader
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Literotica-Downloader/raw/master/Literotica-Downloader.user.js
// @version      3.3.0
// @author       LenAnderson (complete rewrite, based on the script by Patrick Kolodziejczyk)
// @match        https://www.literotica.com/stories/memberpage.php*
// @grant        GM_download
// ==/UserScript==

(()=>{
	'use strict';

	const log = (...msgs)=>console.log.call(console.log, '[LD]', ...msgs);
	
	
	const $ = (query)=>document.querySelector(query);
	const $$ = (query)=>Array.from(document.querySelectorAll(query));


	const get = (url) => {
		return new Promise((resolve,reject)=>{
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.addEventListener('load', ()=>{
				resolve(xhr.responseText);
			});
			xhr.addEventListener('error', ()=>{
				reject(xhr);
			});
			xhr.send();
		});
	};
	const getHtml = (url) => {
		return get(url).then(txt=>{
			const html = document.createElement('div');
			html.innerHTML = txt;
			return html;
		});
	};


	const wait = async(millis)=>new Promise(resolve=>setTimeout(resolve, millis));




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
		template.innerHTML = '<div class=\"lidow-progress\"><div class=\"lidow-progress-status\"></div><div class=\"lidow-progress-barContainer\"><div class=\"lidow-progress-barProgress\"></div></div><div class=\"lidow-progress-subContainer\"></div></div>';

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
		this.content = '<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>{{title}}</title><meta name=\"author\" content=\"{{author}}\"><style>{{style}}</style></head><body><div class=\"filename\">{{filename}}</div>{{content}}<h2>END.</h2></body></html>'
				.replace('{{style}}', 'body {  background-color: #333333;  color: #EEEEEE;  font-family: Helvetica, Arial, sans-serif;  width: 50%;  margin: 0 auto;  line-height: 1.5em;  font-size: 2.2em;  padding: 50px 0 50px 0;}.chapterSeparator {  color: #969696;  margin: 3em auto;}.filename,.chapterNumber,.chapterEnd {  color: #969696;}.header {  line-height: 1.4em;}')
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
			this._filename = `${this.ucTitle} (${this.author})`;
		}
		return this._filename;
	}

	get filenameWithExtension() {
		return `${this.filename}.html`;
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
			this._filename = `${this.ucTitle} (${this.author}, ${this.chapters.length})`;
		}
		return this._filename;
	}

	get filenameWithExtension() {
		return `${this.filename}.html`;
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
			body.appendChild(document.createElement('br'));
			if (index > 0) {
				const chapterSeparator = document.createElement('div'); {
					chapterSeparator.classList.add('chapterSeparator');
					chapterSeparator.textContent = '='.repeat(50);
					body.appendChild(chapterSeparator);
				}
			}
			body.appendChild(document.createElement('br'));
			const chapterNumber = document.createElement('h2'); {
				chapterNumber.classList.add('chapterNumber');
				chapterNumber.textContent = `Chapter ${String(index+1).padStart(2, '0')}`;
				body.appendChild(chapterNumber);
			}
			body.appendChild(await chapter.retrieveContentDom());
		}
		return body.innerHTML;
	}
}
class LiteroticaDownloader {
	constructor() {
		this.blocker = null;

		this.addDownloadButtons();
		this.addStyle();
		this.addBlocker();
	}




	addDownloadButtons() {
		$$('.ser-ttl td:nth-child(1)').forEach(series=>{
			const btn = document.createElement('a'); {
				btn.classList.add('lidow-downloadButton');
				btn.title = 'Download series as book';
				btn.textContent = '📥';
				btn.href = 'javascript:;';
				btn.addEventListener('click', async()=>{
					log('download series', series);
					const book = new SeriesBook(series);
					this.blocker.classList.add('lidow-active');
					this.blocker.appendChild(book.progress.dom.root);
					await book.create();
					book.download();
					await wait(500);
					this.blocker.classList.remove('lidow-active');
					book.progress.dom.root.remove();
				});
				series.insertBefore(btn, series.firstChild);
			}
		});
		$$('.root-story td:nth-child(1), .sl td:nth-child(1)').forEach(story=>{
			const btn = document.createElement('a'); {
				btn.classList.add('lidow-downloadButton');
				btn.title = 'Download story as book';
				btn.textContent = '📥';
				btn.href = 'javascript:;';
				btn.addEventListener('click', async()=>{
					log('download story', story);
					const book = new StoryBook(story);
					this.blocker.classList.add('lidow-active');
					this.blocker.appendChild(book.progress.dom.root);
					await book.create();
					book.download();
					await wait(500);
					this.blocker.classList.remove('lidow-active');
					book.progress.dom.root.remove();
				});
				story.insertBefore(btn, story.firstChild);
			}
		});
	}


	addStyle() {
		const style = document.createElement('style'); {
			style.innerHTML = '.lidow-blocker {  align-items: center;  background-color: rgba(0, 0, 0, 0.5);  bottom: 0;  display: none;  justify-content: center;  left: 0;  position: fixed;  right: 0;  top: 0;  z-index: 999;}.lidow-blocker.lidow-active {  display: flex;}.lidow-progress {  background-color: white;  padding: 1em;}.lidow-progress > .lidow-progress-barContainer {  background-color: #c8c8c8;  height: 30px;  width: 500px;}.lidow-progress > .lidow-progress-barContainer > .lidow-progress-barProgress {  background-color: #5582ba;  height: 100%;  transition: 0.1s ease-in-out;  width: 0%;}.lidow-progress > .lidow-progress-subContainer .lidow-progress {  padding: 1em 0;}';
			document.body.appendChild(style);
		}
	}


	addBlocker() {
		const blocker = document.createElement('div'); {
			this.blocker = blocker;
			blocker.classList.add('lidow-blocker');
			document.body.appendChild(blocker);
		}
	}
}
	const app = new LiteroticaDownloader();
})();