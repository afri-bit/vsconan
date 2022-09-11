
export class ConanPackage {
    public id: string;
    public dirty: boolean;
    public options: object;
    public outdated: boolean;
    public requires: object;
    public settings: object;
    public path: string;

    constructor(id: string, dirty: boolean, options: object, outdated: boolean, requires: object, settings: object, path: string = "") {
        this.id = id;
        this.dirty = dirty;
        this.options = options;
        this.outdated = outdated;
        this.requires = requires;
        this.settings = settings;
        this.path = path;
    }
}
