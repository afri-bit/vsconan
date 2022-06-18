import { ConanPackage } from "./conanPackage";

export class ConanRecipe {
    public name: string;
    public editable: boolean;
    public path: string;
    public binaryPackages: Map<string, ConanPackage>;

    constructor(name: string, editable: boolean, path: string = "", binaryPackages: Map<string, ConanPackage> = new Map<string, ConanPackage>()) {
        this.name = name;
        this.editable = editable;
        this.path = path;
        this.binaryPackages = binaryPackages;
    }
}