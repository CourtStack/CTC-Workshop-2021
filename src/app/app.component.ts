import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = "View GitHub release statistics.";

	cachedRepos:any[] = [];

	jsonData:any[] = [];

	nameLength: number = 34;

	latestAssets:any[] = [];
	totalLatestUsers: number = 0;

	releases:any[] = [];
	totalDownloads: number = 0;

	bannerHover: boolean = false;
	blink: boolean = true;
	blinker: string = "";

	showStats: boolean = false;
	showRepos: boolean = true;
	showError: boolean = false;
	errorMsg: string = "";

	constructor(private http: HttpClient) {
		// localStorage.clear();
		this.loadRepos();
	}

	ngOnInit() {
    this.search();
	}

	search(): void {
		this.showError = false;
		this.showStats = false;
		this.wipe();

		const url =
			window.location.protocol +
			"//" +
			window.location.host +
			window.location.pathname;

		this.bannerHover = true;
		this.showRepos = false;

		this.getStats();
	}

	async getStats(): Promise<void> {
    let id:string = "courtstack";
    let repo:string = "ctc-workshop-2021";

    let apiURL = `https://api.github.com/repos/${id}/${repo}/releases?page=1&per_page=100`;
    console.log(apiURL);

    await this.http.get(apiURL)
      .subscribe((data: any) => {
        this.jsonData = data;
        if (data.message === "Not Found") {
          this.errorReset("Invalid repository");
          return;
        } else if (data.length === 0) {
          this.errorReset("This repository does not have any releases");
          return;
        }
        this.getLatestUsers();
        this.getTotalDownloads();
        this.showStats = true;
    
        this.cacheRepo({ id: id, name: repo });
        this.loadRepos();
      });
	}

	getLatestUsers(): void {
		this.latestAssets = this.jsonData[0].assets;
		for (let i = 0; i < this.latestAssets.length; i++) {
			this.totalLatestUsers += this.latestAssets[i].download_count;
		}
	}

	getTotalDownloads(): void {
		for (let i = 0; i < this.jsonData.length; i++) {
			let assets = this.jsonData[i].assets;
			let name: string = this.jsonData[i].name || this.jsonData[i].tag_name;
			var downloads: number = 0;
			for (let x = 0; x < assets.length; x++) {
				downloads += assets[x].download_count;
			}
			this.totalDownloads += downloads;
			if (name.length > this.nameLength)
				name = name.slice(0, this.nameLength) + "...";
			this.releases.push({ name: name, downloads: downloads, tag: this.jsonData[i].tag_name });
		}
	}

	sleep(ms:number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	wipe() {
		this.jsonData = [];

		this.latestAssets = [];
		this.totalLatestUsers = 0;

		this.releases = [];
		this.totalDownloads = 0;
	}

	errorReset(error: string) {
		this.errorMsg = error;
		this.showError = true;
		this.showRepos = true;
		this.bannerHover = false;
	}

	cacheRepo(repoObj:any) {
		let next = localStorage.getItem("next");
		if (next === null) {
			next = "one";
			localStorage.setItem("next", next);
		}

		if (
			(localStorage.getItem("one") &&
				JSON.parse(localStorage.getItem("one") as string).id === repoObj.id) ||
			(localStorage.getItem("two") &&
				JSON.parse(localStorage.getItem("two") as string).id === repoObj.id) ||
			(localStorage.getItem("three") &&
				JSON.parse(localStorage.getItem("three") as string).id === repoObj.id)
		) {
			return;
		}

		switch (next) {
			case "one":
				localStorage.setItem(next, JSON.stringify(repoObj));
				localStorage.setItem("next", "two");
				break;
			case "two":
				localStorage.setItem(next, JSON.stringify(repoObj));
				localStorage.setItem("next", "three");
				break;
			case "three":
				localStorage.setItem(next, JSON.stringify(repoObj));
				localStorage.setItem("next", "one");
				break;
		}
	}

	loadRepos() {
		let one = localStorage.getItem("one");
		let two = localStorage.getItem("two");
		let three = localStorage.getItem("three");
		this.cachedRepos = [];
		if (one !== null) {
			this.cachedRepos.push(JSON.parse(one));
		}
		if (two !== null) {
			this.cachedRepos.push(JSON.parse(two));
		}
		if (three !== null) {
			this.cachedRepos.push(JSON.parse(three));
		}
	}

	loadClickedRepo() {
		this.search();
	}
}
