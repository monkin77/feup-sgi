export class Parser {
    /**
     * Constructor for the Parser object.
     */
    constructor() {
        this._reports = []; // Keeps track of parsing errors
    }

    addReport = (parserId = "Parser", text) => {
        this._reports.push(`[${parserId}] ${text}`);
    };

    /**
     *
     * @returns true if the parser has reports, false otherwise
     */
    hasReports = () => this._reports.length > 0;

    get reports() {
        return this._reports;
    }
}