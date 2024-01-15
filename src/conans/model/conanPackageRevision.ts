
export class ConanPackageRevision {
    public id: string;
    public timestamp: number;
    public datetime: string;

    constructor(id: string, timestamp: number) {
        this.id = id;
        this.timestamp = timestamp;
        
        let date = new Date(this.timestamp * 1000);
        this.datetime = date.toLocaleString();
    }
}
