import State from "./State.js";

export default class PickedState extends State {
    constructor(player, tile) {
        super();
        this.player = player;
        this.tile = tile;
    }
}