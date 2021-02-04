// ==UserScript==
// @name         Literotica Downloader
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Literotica-Downloader/raw/master/Literotica-Downloader.user.js
// @version      3.1.0
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




	${include: LiteroticaDownloader.js}
	const app = new LiteroticaDownloader();
})();