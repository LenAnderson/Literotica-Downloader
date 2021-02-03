${include-once: StoryBook.js}
${include-once: SeriesBook.js}
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
			style.innerHTML = '${include-min-esc: css/style.css}';
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