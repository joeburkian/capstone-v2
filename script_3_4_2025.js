// This script waits for the HTML document to fully load before running.
document.addEventListener("DOMContentLoaded", function () {
    // Get references to the HTML elements needed for interaction
    const imageInput = document.getElementById("image-input"); // Image file input
    const canvas = document.getElementById("canvas"); // Canvas element to display the uploaded image
    const ctx = canvas.getContext("2d"); // 2D rendering context for drawing on the canvas
    const colorOneInput = document.getElementById("color-one"); // First color picker
    const colorTwoInput = document.getElementById("color-two"); // Second color picker
    const sensitivitySlider = document.getElementById("sensitivity-slider"); // Sensitivity adjustment slider
    const processButton = document.getElementById("process-button"); // Button to detect anomalies based on selected colors
    const yellowButton = document.getElementById("yellow-button"); // Button to detect yellow anomalies
    const coordinatesList = document.getElementById("coordinates-list"); // List to display detected anomaly coordinates
    const tooltip = document.getElementById("tooltip"); // Tooltip element to show cursor coordinates

    let originalImageData; // Stores the original image data to avoid modifying the uploaded image directly

    /**
     * Updates the color gradient preview between the two selected colors.
     * This function dynamically changes the background of `color-blender`
     * to create a smooth transition between the two chosen colors.
     */
    function updateGradient() {
        const colorOne = colorOneInput.value; // Get the first selected color
        const colorTwo = colorTwoInput.value; // Get the second selected color
        document.getElementById("color-blender").style.background = `linear-gradient(to right, ${colorOne}, ${colorTwo})`;
    }

    /**
     * Handles image file selection, reads the image, and draws it on the canvas.
     * It ensures that an image file is selected and converts it to a format
     * that can be displayed on the canvas using the `FileReader` API.
     */
    imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0]; // Get the selected file
        if (!file) return; // Stop execution if no file is selected

        const reader = new FileReader(); // Create a new FileReader instance
        reader.onload = function (e) {
            const img = new Image(); // Create an Image object
            img.onload = function () {
                // Set canvas dimensions to match the uploaded image
                canvas.width = img.width;
                canvas.height = img.height;
                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0, img.width, img.height);
                // Store the original image data for later processing
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            };
            img.src = e.target.result; // Set image source from the file reader output
        };
        reader.readAsDataURL(file); // Convert the uploaded image into a Data URL
    });

    /**
     * Converts a hexadecimal color code (e.g., "#FF5733") to an RGB array [R, G, B].
     * It removes the "#" character and extracts the red, green, and blue components.
     */
    function hexToRgb(hex) {
        hex = hex.replace("#", ""); // Remove the "#" symbol if present
        return [
            parseInt(hex.substring(0, 2), 16), // Convert red hex component to decimal
            parseInt(hex.substring(2, 4), 16), // Convert green hex component to decimal
            parseInt(hex.substring(4, 6), 16)  // Convert blue hex component to decimal
        ];
    }

    /**
     * Detects anomalies in the image based on the selected color range.
     * It scans each pixel in the image and checks if its color falls within the defined range.
     */
    function detectAnomalies(colorRange) {
        if (!originalImageData) return; // Ensure image data is available before processing

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Get current image data from the canvas
        const data = imageData.data; // Get pixel data (RGBA values stored in a single array)
        const sensitivity = parseInt(sensitivitySlider.value, 10); // Get the sensitivity level from the slider
        coordinatesList.innerHTML = ""; // Clear previously detected anomalies

        /**
         * Checks if a given pixel's RGB values are within the specified range.
         * The sensitivity value adjusts the tolerance when determining if a color is an anomaly.
         */
        function isInRange(r, g, b) {
            return (
                r >= colorRange[0][0] - sensitivity && r <= colorRange[1][0] + sensitivity &&
                g >= colorRange[0][1] - sensitivity && g <= colorRange[1][1] + sensitivity &&
                b >= colorRange[0][2] - sensitivity && b <= colorRange[1][2] + sensitivity
            );
        }

        let detectedAnomalies = []; // Array to store anomaly coordinates

        // Iterate through each pixel in the image
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4; // Calculate pixel position in data array
                const r = data[index];     // Red component
                const g = data[index + 1]; // Green component
                const b = data[index + 2]; // Blue component

                // If the pixel color falls within the anomaly range, store its coordinates
                if (isInRange(r, g, b)) {
                    detectedAnomalies.push({ x, y });
                }
            }
        }

        // Display detected anomaly coordinates in the UI
        detectedAnomalies.forEach(({ x, y }) => {
            const listItem = document.createElement("li");
            listItem.textContent = `(${x}, ${y})`; // Format coordinates as (X, Y)
            coordinatesList.appendChild(listItem);
        });
    }

    /**
     * Event listener for the "Detect Custom Anomalies" button.
     * Calls the `detectAnomalies` function using colors chosen by the user.
     */
    processButton.addEventListener("click", () => {
        detectAnomalies([hexToRgb(colorOneInput.value), hexToRgb(colorTwoInput.value)]);
    });

    /**
     * Event listener for the "Detect Yellow Anomalies" button.
     * Uses predefined RGB values for yellow to detect yellow anomalies.
     */
    yellowButton.addEventListener("click", () => {
        detectAnomalies([[180, 180, 0], [255, 255, 130]]); // Range for yellow hues
    });

    /**
     * Updates the gradient preview when the user selects new colors.
     */
    colorOneInput.addEventListener("input", updateGradient);
    colorTwoInput.addEventListener("input", updateGradient);
    updateGradient(); // Initialize the color gradient on page load

    /**
     * Tooltip Functionality: Displays the X, Y coordinates of the mouse on the canvas.
     */
    canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect(); // Get canvas position on the screen
        const x = Math.floor(event.clientX - rect.left); // Convert mouse position to canvas coordinates
        const y = Math.floor(event.clientY - rect.top);

        tooltip.style.left = `${event.clientX + 10}px`; // Position the tooltip near the cursor
        tooltip.style.top = `${event.clientY + 10}px`;
        tooltip.style.display = "block"; // Make tooltip visible
        tooltip.innerHTML = `X: ${x}, Y: ${y}`; // Display coordinates
    });

    /**
     * Hides the tooltip when the mouse leaves the canvas.
     */
    canvas.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });
});
