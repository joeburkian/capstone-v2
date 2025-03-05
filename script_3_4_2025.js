document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("image-input");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const colorOneInput = document.getElementById("color-one");
    const colorTwoInput = document.getElementById("color-two");
    const sensitivitySlider = document.getElementById("sensitivity-slider");
    const processButton = document.getElementById("process-button");
    const yellowButton = document.getElementById("yellow-button");
    const coordinatesList = document.getElementById("coordinates-list");
    const tooltip = document.getElementById("tooltip");

    let originalImageData;

    function updateGradient() {
        const colorOne = colorOneInput.value;
        const colorTwo = colorTwoInput.value;
        document.getElementById("color-blender").style.background = `linear-gradient(to right, ${colorOne}, ${colorTwo})`;
    }

    imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    function hexToRgb(hex) {
        hex = hex.replace("#", "");
        return [
            parseInt(hex.substring(0, 2), 16),
            parseInt(hex.substring(2, 4), 16),
            parseInt(hex.substring(4, 6), 16)
        ];
    }

    function detectAnomalies(colorRange) {
        if (!originalImageData) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const sensitivity = parseInt(sensitivitySlider.value, 10);
        coordinatesList.innerHTML = "";

        function isInRange(r, g, b) {
            return (
                r >= colorRange[0][0] - sensitivity && r <= colorRange[1][0] + sensitivity &&
                g >= colorRange[0][1] - sensitivity && g <= colorRange[1][1] + sensitivity &&
                b >= colorRange[0][2] - sensitivity && b <= colorRange[1][2] + sensitivity
            );
        }

        let detectedAnomalies = [];
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                if (isInRange(r, g, b)) {
                    detectedAnomalies.push({ x, y });
                }
            }
        }

        detectedAnomalies.forEach(({ x, y }) => {
            const listItem = document.createElement("li");
            listItem.textContent = `(${x}, ${y})`;
            coordinatesList.appendChild(listItem);
        });
    }

    processButton.addEventListener("click", () => {
        detectAnomalies([hexToRgb(colorOneInput.value), hexToRgb(colorTwoInput.value)]);
    });

    yellowButton.addEventListener("click", () => {
        detectAnomalies([[180, 180, 0], [255, 255, 130]]);
    });

    colorOneInput.addEventListener("input", updateGradient);
    colorTwoInput.addEventListener("input", updateGradient);
    updateGradient();

    // 🟢 FIXED TOOLTIP FUNCTION TO SHOW PIXEL COORDINATES 🟢
    canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(event.clientX - rect.left);
        const y = Math.floor(event.clientY - rect.top);

        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
        tooltip.style.display = "block";
        tooltip.innerHTML = `X: ${x}, Y: ${y}`;
    });

    canvas.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });
});
