import Vue from 'vue';
import './scan.scss';
import {
    getUserMediaWrapper,
    getProjectedImageFromCanvas,
    imageDataToMatrix,
    matrixToImageData,
    findShapes,
    detector
} from './../../utils';

const OPTIONS = {
    width: 320,
    height: 240
};

const BLACK_LIMIT = 138;

export default Vue.component('scanView', {
    mounted() {
        const video = this.$refs.video;
        video.setAttribute('width', OPTIONS.width);
        video.setAttribute('height', OPTIONS.height);

        const canvas = this.$refs.canvas;
        canvas.width = OPTIONS.width;
        canvas.height = OPTIONS.height;

        const canvasFromImage = this.$refs.canvasFromImage;
        canvasFromImage.width = OPTIONS.width;
        canvasFromImage.height = OPTIONS.height;

        getUserMediaWrapper(video)
            .catch(error => {
                console.warn('navigator.getUserMedia error: ', error);
            });

    },
    methods: {
        drawToCanvas: function () {
            const video = this.$refs.video;

            const canvasContext = this.$refs.canvas.getContext('2d');

            getProjectedImageFromCanvas(canvasContext, video, OPTIONS);
        },
        drawFromImageToCanvas: function () {
            const canvas = this.$refs.canvasFromImage;
            const context = canvas.getContext('2d');
            const img = this.$refs.image;

            const myData = getProjectedImageFromCanvas(context, img, OPTIONS);

            const processedImage = matrixToImageData(imageDataToMatrix(myData, OPTIONS, BLACK_LIMIT), context, OPTIONS);
            context.putImageData(processedImage, 0, 0);
            console.log(findShapes(imageDataToMatrix(myData, OPTIONS, BLACK_LIMIT), []))
        },
        getFromVideo: function () {
            const video = this.$refs.video;

            const canvasContext = this.$refs.canvas.getContext('2d');

            const myDetector = detector(canvasContext, video, Object.assign({}, OPTIONS, {videoURL: "./media/cid.mov"}));

            myDetector.attachEvent("buttonDetected", function (button) {
                console.log("New button: ", button);
            });
            myDetector.attachEvent("touchStart", function (button) {
                console.log("Touch start: ", button.id);
            });
            myDetector.attachEvent("touchEnd", function (button) {
                console.log("Touch end: ", button.id);
            });
        }
    },
    template: `
        <div class="scan-view">
            <div>
                <video muted autoplay ref="video"></video>
                <canvas ref="canvas"></canvas>
                <br>
                <button @click="drawToCanvas">Draw image from camera</button>
                <button @click="getFromVideo">Draw video from video</button>
            </div>
            <div>
                <img ref="image" src="./../../media/trimmed.jpg">
                <canvas ref="canvasFromImage"></canvas>
                <br>
                <button @click="drawFromImageToCanvas">Draw image from image</button>
            </div>
        </div>
    `
});