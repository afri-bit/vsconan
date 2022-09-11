

export class ConanProfile {
    public name: string;
    public data: object; // TODO: Fix this if the object can be specified, this should be detail information about the profile itself, such as compiler etc.

    constructor(name: string, data: object) {
        this.name = name;
        this.data = data;
    }
}