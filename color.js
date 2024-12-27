const colors = document.querySelectorAll('.color');
const colorCode = document.querySelectorAll('.color-code');
const lockButtons = document.querySelectorAll('.lock-button');
const undoButtons = document.querySelectorAll('.undo');
const toast = document.getElementById('copy-toast');
const menuButton = document.getElementById('menu-button');
const generateButton = document.getElementById('generate');

let mode = true;

let unlocked = [true, true, true, true, true];
let colorStacks = [];

colorCode.forEach((colorButton, index) => {
    const initialColor = colorButton.textContent.trim() || colors[index].style.backgroundColor;
    colorStacks.push([initialColor]);
});

window.addEventListener('DOMContentLoaded', () => {
    const currentPath = localStorage.getItem("currentPath");

    if (currentPath) {
        setColorsFromUrl(currentPath);
        updateUrlWithColors();
        localStorage.removeItem('currentPath');
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

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(n) {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

function isColorTooDark(hex) {
    const { r, g, b } = hexToRgb(hex);
    const colorLuminance = luminance(r, g, b);
    const threshold = 0.2;

    return colorLuminance < threshold;
}

function luminance(r, g, b) {
    const rgb = [r, g, b].map(function (x) {
        x /= 255;
        return (x <= 0.03928) ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function randomizeColors() {
    colors.forEach((colorDiv, index) => {
        if (unlocked[index]) {
            const newColor = getRandomColor();
            colorStacks[index].push(newColor);
            colorDiv.style.backgroundColor = newColor;
            colorCode[index].textContent = newColor;
            if (isColorTooDark(newColor)) {
                colorCode[index].style.color = 'white';
                undoButtons[index].classList.add('white');
                lockButtons[index].classList.add('white');

            } else {
                colorCode[index].style.color = 'black';
                undoButtons[index].classList.remove('white');
                lockButtons[index].classList.add('white');
            }
        }
    });
    updateUrlWithColors();
}

function getColors() {
    const colorsList = [];
    colors.forEach((colorButton) => {
        const color = colorButton.querySelector('.color-code').textContent.trim();
        const colorWithoutHash = color.slice(1);
        colorsList.push(colorWithoutHash);
    });
    return colorsList;
}

function updateUrlWithColors() {
    const colorsList = getColors();
    const colorString = colorsList.join('-');
    const newUrl = `${window.location.origin}/${colorString}`;
    history.pushState(null, '', newUrl);
}

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
        const color = colorCode[index].textContent.trim();

        navigator.clipboard.writeText(color)
            .then(() => {
                toast.classList.add('show');
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

function setColorsFromUrl(path) {
    const hash = path.startsWith('/') ? path.substring(1) : path;
    if (hash) {
        const colorArray = hash.split('-');
        colors.forEach((colorDiv, index) => {
            colorDiv.style.backgroundColor = '#' + colorArray[index];
            colorCode[index].textContent = '#' + colorArray[index];
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setColorsFromUrl();
});

document.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        randomizeColors();
    }
});