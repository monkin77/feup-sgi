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

        for (const child of children) {
            console.log("nodeName:", child.nodeName);

            switch (child.nodeName) {
                case "position":
                    const boardCoords = parseCoordinates3D(
                        xmlReader,
                        child,
                        `${child.nodeName} child of <board>`
                    );
                    if (!Array.isArray(boardCoords)) {
                        this.addReport(parserId, boardCoords);
                        return;
                    };
            
                    /* if ((err = this.parseBoard(xmlReader, child)) != null) {
                        this.addReport(parserId, err);
                        return;
                    } */
                    break;
                case "sideLength":
                    /* if ((err = this.parseComponents(xmlReader, child)) != null) {
                        this.addReport(parserId, err);
                        return;
                    } */
                    break;
                default:
                    onXMLMinorError(
                        "unknown tag <" +
                        child.nodeName +
                        "> inside <board>"
                    );
                    break;
            }
        }

        return;
    }
}

const parserId = "Board Parser";