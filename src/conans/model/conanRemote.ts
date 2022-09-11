
export class ConanRemote {
    public name: string;
    public url: string;
    public verifySsl: boolean;
    public enabled: boolean;
    public listRef: Set<string> = new Set<string>();

    constructor(name: string, url: string, verifySsl: boolean, enabled: boolean) {
        this.name = name;
        this.url = url;
        this.verifySsl = verifySsl;
        this.enabled = enabled;
    }

    public rename(newName: string) {
        this.name = newName;
    }

    public updateUrl(newUrl: string) {
        this.url = newUrl;
    }

    public addRef(ref: string) {
        this.listRef.add(ref);
    }
}