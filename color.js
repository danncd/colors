const colors = document.querySelectorAll('.color');  // Color divs
const colorCode = document.querySelectorAll('.color-code');  // Color code buttons
const lockButtons = document.querySelectorAll('.lock-button');  // Lock buttons
const undoButtons = document.querySelectorAll('.undo');
const toast = document.getElementById('copy-toast');
const menuButton = document.getElementById('menu-button');
const generateButton = document.getElementById('generate')

let mode = true;

let unlocked = [true, true, true, true, true];  // Keep track of whether the colors are locked
let colorStacks = [];

let currentURL = window.location.pathname;
let path = currentURL.substring(1);

colorCode.forEach((colorButton, index) => {
    // Get the initial color value (from the textContent or style attribute)
    const initialColor = colorButton.textContent.trim() || colors[index].style.backgroundColor;
    colorStacks.push([initialColor]);  // Push the initial color to the stack for this div
});

window.addEventListener('DOMContentLoaded', () => {
    const currentPath = localStorage.getItem("currentPath");

    if (currentPath) {
        alert(currentPath);
    } else {
        console.log("No currentPath found in localStorage.");
    }
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    if (!mode) {
        const rgb = hexToRgb(color);

        // Convert the color to pastel by adding a factor of lightness to each RGB component
        const pastelColor = rgbToHex(
            Math.min(255, rgb.r + 120),
            Math.min(255, rgb.g + 120),
            Math.min(255, rgb.b + 120)
        );

        return pastelColor;
    } else {
        return color;
    }
}

// Function to convert hex to RGB
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

// Function to convert RGB to hex
function rgbToHex(r, g, b) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper function to convert RGB value to hex
function toHex(n) {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}


// Update the colors and the URL hash
function randomizeColors() {
    colors.forEach((colorDiv, index) => {
        if (unlocked[index]) {
            const newColor = getRandomColor();

            colorStacks[index].push(newColor);

            colorDiv.style.backgroundColor = newColor;
            colorCode[index].textContent = newColor;
        }
    });
    updateUrlWithColors();

}

// Get colors from colorCode buttons
function getColors() {
    const colorsList = [];
    colors.forEach((colorButton) => {
        const color = colorButton.querySelector('.color-code').textContent.trim();
        const colorWithoutHash = color.slice(1);  // Remove the '#' from the color code
        colorsList.push(colorWithoutHash);
    });
    return colorsList;
}


// Update the URL hash with the colors
function updateUrlWithColors() {
    const colorsList = getColors();
    const colorString = colorsList.join('-');  // Join color hex codes with a hyphen
    const newUrl = `${window.location.origin}/${colorString}`;
    history.pushState(null, '', newUrl);  // Update the URL without reloading the page
}

// Lock/unlock colors
lockButtons.forEach((button, index) => {
    button.addEventListener("click", function () {
        unlocked[index] = !unlocked[index];

        if (unlocked[index]) {
            button.classList.add('locked');
            button.innerHTML = '<img src="images/unlocked.png" alt="Unlock Icon" />';
        } else {
            button.classList.remove('locked');
            button.innerHTML = '<img src="images/locked.png" alt="Lock Icon" />';
        }
    });
});

undoButtons.forEach((button, index) => {
    button.addEventListener("click", function() {
        if (colorStacks[index].length > 1) {
            colorStacks[index].pop();
            const previousColor = colorStacks[index].slice(-1)[0];

            colors[index].style.backgroundColor = previousColor;
            colorCode[index].textContent = previousColor;
        }
    });
});

colorCode.forEach((button, index) => {
    button.addEventListener("click", function() {
        // Get the color code text content of the corresponding colorCode[index]
        const color = colorCode[index].textContent.trim();

        // Copy the color code to the clipboard
        navigator.clipboard.writeText(color)
            .then(() => {

                // Display the toast (if needed)
                toast.classList.add('show');

                // Hide the toast after a few seconds
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2000);
            })
            .catch(err => {
                console.error("Error copying text: ", err);
            });
    });
});

menuButton.addEventListener("click", function() {
    mode = !mode;
    if (!mode) {
        menuButton.classList.remove('setting-default-color');
        menuButton.classList.add('setting-pastel-color');
        menuButton.textContent = 'Pastel';

    } else {
        menuButton.classList.remove('setting-pastel-color');
        menuButton.classList.add('setting-default-color');
        menuButton.textContent = 'Default';
    }
});

generateButton.addEventListener("click", function() {
    event.preventDefault();
    randomizeColors();
});

// Set colors based on URL hash when the page loads
function setColorsFromUrl() {
    const hash = window.location.hash.substring(1);  // Remove the '#' from the hash
    if (hash) {
        const colorArray = hash.split('-');
        colorArray.forEach((color, index) => {
            if (colors[index] && colorCode[index]) {
                colors[index].style.backgroundColor = color;  // Set background color of the div
                colorCode[index].textContent = color;  // Update the color code text
            }
        });
    }
}




// Initialize colors from the URL if available
window.addEventListener('DOMContentLoaded', () => {
    setColorsFromUrl();
});

// Handle the spacebar for randomizing colors
document.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        randomizeColors();
    }
});
