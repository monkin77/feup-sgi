import { Component } from "../model/Component.js";
import { Highlighted } from "../model/Highlighted.js";
import { Texture } from "../model/Texture.js";
import { Parser } from "./Parser.js";
import {
    onXMLMinorError,
    calculateTransformationMatrix,
    buildComponentTransfID,
    invalidNumber,
    isValidColor,
    parseCoordinates3D,
} from "./utils.js";

export class BoardParser extends Parser {
    /**
     * Constructor for the BoardParser object.
     * @param {CGF xml Reader} xmlReader
     * @param {board block element} boardNode
     */
    constructor(
        xmlReader,
        boardNode,
    ) {
        super();

        this._sideLength = null;
        this._position = null;

        this.parse(xmlReader, boardNode);
    }

    /**
     * Parses the <board> block.
     * @param {CGF xml Reader} xmlReader
     * @param {board block element} boardNode
     */
    parse(xmlReader, boardNode) {
        const children = boardNode.children;

        let err;

        let position = boardNode.getElementsByTagName("position");
        let sideLengthComp = boardNode.getElementsByTagName("sideLength");

        if (position.length != 1) {
            this.addReport(parserId, "no 'position' child defined for <board>");
            return;
        }
        if (sideLengthComp.length != 1) {
            this.addReport(parserId, "no 'sideLength' child defined for <board>");
            return;
        };

        position = position[0];
        sideLengthComp = sideLengthComp[0];

        // Parse position
        const boardCoords = parseCoordinates3D(
            xmlReader,
            position,
            `${position.nodeName} child of <board>`
        );
        if (!Array.isArray(boardCoords)) {
            this.addReport(parserId, boardCoords);
            return;
        };

        // Parse sideLength
        const sideLength = xmlReader.getFloat(sideLengthComp, "value", false);
        if (invalidNumber(sideLength)) {
            this.addReport(parserId, "no 'value' attribute defined for <sideLength> child of <board>");
            return;
        };
        
        console.log("boardCoords: ", boardCoords, "sideLength: ", sideLength);

        this._position = boardCoords;
        this._sideLength = sideLength;
        return;
    }

    get sideLength() {
        return this._sideLength;
    }

    get position() {
        return this._position;
    }
}

const parserId = "Board Parser";