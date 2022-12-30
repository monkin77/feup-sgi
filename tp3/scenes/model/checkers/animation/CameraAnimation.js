import { CGFcamera } from "../../../../../lib/CGF.js";
import MyAnimation from "../../MyAnimation.js";

const CAMERA_ANIMATION_DURATION = 1500;

export default class CameraAnimation extends MyAnimation {
    constructor(scene, initialCamera, finalCamera, addEffect = false) {
        super();
        this._scene = scene;
        this._initialCamera = initialCamera;
        this._finalCamera = finalCamera;
        this._currentCamera = initialCamera;
        this._addEffect = addEffect;
        this._ended = false;
    }

    update(t) {
        if (!this.hasStarted()) return;
        if (!this.startTime) this.startTime = t;

        const animationTime = t - this.startTime;
        const percentage = animationTime / CAMERA_ANIMATION_DURATION;

        let position = vec3.lerp(vec3.create(), this._initialCamera.position, this._finalCamera.position, percentage);
        if (this._addEffect) {
            // Add an optional effect to avoid clipping in a straight line
            position[0] += 60 * percentage * (1 - percentage);
        }

        const target = vec3.lerp(vec3.create(), this._initialCamera.target, this._finalCamera.target, percentage);
        const near = this._initialCamera.near + (this._finalCamera.near - this._initialCamera.near) * percentage;
        const far = this._initialCamera.far + (this._finalCamera.far - this._initialCamera.far) * percentage;
        const fov = this._initialCamera.fov + (this._finalCamera.fov - this._initialCamera.fov) * percentage;

        this._currentCamera = new CGFcamera(fov, near, far, position, target);

        if (animationTime > CAMERA_ANIMATION_DURATION) {
            this._ended = true;
            this._currentCamera = this._finalCamera;
            this.apply();
        }
    }

    apply() {
        if (!this.hasStarted()) return;

        this._scene.camera = this._currentCamera;
        this._scene.interface.setActiveCamera(this._scene.camera);
    }

    /**
     * Starts the animation
     */
    start() {
        this.started = true;
    }

    get ended() {
        return this._ended;
    }
}
