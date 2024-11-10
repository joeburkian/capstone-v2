// Wait for OpenCV to load
document.addEventListener('opencv_ready', () => {
    console.log("OpenCV.js is loaded and ready to use!");
    init();
});

// Initialization function to set up image loading
function init() {
    console.log("Initializing image selection...");
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
                image_container.style.display = 'block';

                image_container.onload = function() {
                    // Set canvas dimensions to match the image
                    canvas.width = image_container.width;
                    canvas.height = image_container.height;
                    console.log("Image loaded and canvas dimensions set.");

                    // Draw the image on the canvas
                    let ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(image_container, 0, 0, canvas.width, canvas.height);
                    console.log("Image drawn on canvas.");
                };
            };
            reader.readAsDataURL(photo);
        } else {
            console.error("No image file detected.");
        }
    });
}

// Placeholder function for detectYellowAnomalies
function detectYellowAnomalies() {
    console.log("Detect Yellow Anomalies button clicked.");
}
