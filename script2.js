function init() {
    init_image_select();
}

function init_image_select() {
    let image_selector = document.getElementById("image-input");
    let image_container = document.getElementById("photo");
    let canvas = document.getElementById("canvas");

    image_selector.addEventListener("change", (event) => {
        let photo = event.target.files[0];
        if (photo) {
            let reader = new FileReader();
            reader.onload = function(e) {
                image_container.src = e.target.result;
                image_container.onload = function() {
                    canvas.width = image_container.width;
                    canvas.height = image_container.height;
                    canvas.style.display = 'block';
                    console.log("Image loaded and canvas dimensions set.");
                };
            };
            reader.readAsDataURL(photo);
        }
    });
}

function detectAnomalies(color) {
    let image = document.getElementById('photo');
    let canvas = document.getElementById('canvas');

    if (!image.complete || canvas.width === 0 || canvas.height === 0) {
        console.log("Image not fully loaded or canvas not set up.");
        return;
    }

    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colorRanges = {
        yellow: { min: [20, 100, 100], max: [30, 255, 255] },
        red: { min: [0, 100, 100], max: [10, 255, 255] },
        green: { min: [40, 100, 100], max: [70, 255, 255] },
        blue: { min: [100, 100, 100], max: [130, 255, 255] }
    };

    const minColor = colorRanges[color].min;
    const maxColor = colorRanges[color].max;

    const detectedCoords = [];
    const coordinatesList = document.getElementById("coordinates-list");
    coordinatesList.innerHTML = ''; // Clear previous coordinates

    for (let i = 0; i < imageData.data.length; i += 4) {
        const [r, g, b] = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];
        const colorMatch = r >= minColor[0] && r <= maxColor[0] &&
                           g >= minColor[1] && g <= maxColor[1] &&
                           b >= minColor[2] && b <= maxColor[2];

        if (colorMatch) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor(i / 4 / canvas.width);
            detectedCoords.push({ x, y });

            let listItem = document.createElement("li");
            listItem.textContent = `(${x}, ${y})`;
            coordinatesList.appendChild(listItem);

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    console.log(`Detected ${color} anomalies at:`, detectedCoords);
}

document.addEventListener("DOMContentLoaded", init);
