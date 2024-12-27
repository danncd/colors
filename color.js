const colors = document.querySelectorAll('.color');
const colorCode = document.querySelectorAll('.color-code');
const copyButtons = document.querySelectorAll('.copy-button');
const lockButtons = document.querySelectorAll('.lock-button');
const undoButtons = document.querySelectorAll('.undo');
const toast = document.getElementById('copy-toast');
const menuButton = document.getElementById('menu-button');
const generateButton = document.getElementById('generate');
const generateAroundCircle = document.getElementById('generate-color-around-circle');
const textBox = document.getElementById('textBox');
const resetButton = document.getElementById('reset-button');

let mode = true;

let unlocked = [true, true, true, true, true];
let colorStacks = [];

const image = document.querySelector('.generate-color-around-info img');
const popup = document.querySelector('.generate-color-around-info-popup');

resetButton.addEventListener("click", function() {
    if (resetButton.textContent === "Reset") {
        resetButton.textContent = "Sure?";
        resetButton.style.color = '#DD3549';
        resetButton.style.backgroundColor = '#FCEEEF';
        resetButton.style.border = '2px solid #DD3549';
    } else {
        window.location.href = "https://colxrs.haocdan.com";
        localStorage.removeItem('textBoxContent');
        localStorage.removeItem('colorContent');
        localStorage.removeItem('currentPath');
    }
});

document.addEventListener("click", function(event) {
    if (!resetButton.contains(event.target) && resetButton.textContent === "Sure?") {
        resetButton.textContent = "Reset";
        resetButton.style.color = '#32B3A8';
        resetButton.style.backgroundColor = '#EFFBFA';
        resetButton.style.border = '2px solid #32B3A8';
    }
});
image.addEventListener('mouseenter', () => {
    popup.classList.add('show');
});
image.addEventListener('mouseleave', () => {
    popup.classList.remove('show');
});

textBox.addEventListener('input', function() {
    let currentValue = textBox.value;

    if (currentValue.startsWith('#')) {
        currentValue = currentValue.slice(1);
    }

    currentValue = currentValue.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);

    textBox.value = currentValue;

    localStorage.setItem('textBoxContent', currentValue);

    const savedContent = localStorage.getItem('textBoxContent');

    if (isValidHexColor(savedContent)) {
        generateAroundCircle.style.backgroundColor = '#' + savedContent;
        generateAroundCircle.style.border = `2px solid #${savedContent}`;
    } else {
        generateAroundCircle.style.backgroundColor = '';
        generateAroundCircle.style.border = ``;
    }

});



textBox.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
    }
});

colorCode.forEach((button, index) => {
    button.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
        }
    });
});

colorCode.forEach((button, index) => {
    button.addEventListener('input', function () {
        let inputValue = colorCode[index].value;

        if (inputValue.startsWith('#')) {
            inputValue = inputValue.slice(1);
        }
        inputValue = inputValue.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);

        colorCode[index].value = inputValue;

        localStorage.setItem('colorContent', inputValue);
        const savedContent = localStorage.getItem('colorContent');

        // Ensure valid hex color before applying
        if (savedContent.length === 6 && isValidHexColor(savedContent)) {
            colorStacks[index].push('#' + savedContent);
            colors[index].style.backgroundColor = '#' + savedContent
            changeIfDark(savedContent, index);
            updateUrlWithColors();
        } else {
            colors[index].style.backgroundColor = '';
            changeIfDark(colors[index].style.backgroundColor, index);
        }
    });
});

function isValidHexColor(color) {
    const cleanColor = color.startsWith('#') ? color.slice(1) : color;

    const hexColorRegex = /^[0-9A-F]{6}$/i;
    return hexColorRegex.test(cleanColor);
}

colorCode.forEach((colorButton, index) => {
    let initialColor = '#' + colorButton.value;
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
    const savedContent = localStorage.getItem('textBoxContent');
    if (savedContent && isValidHexColor(savedContent)) {
        const falseIndex = randomFalseIndex();
        if (falseIndex !== -1) {
            let colorToUse;
            if (Math.random() < 0.5) {
                colorToUse = savedContent;
            } else {
                colorToUse = colorCode[falseIndex].value;
            }
            const color = generateRandomComplementaryColor(colorToUse);
            if (!mode) {
                return convertPastel(color);
            } else {
                return color;
            }
        } else {
            const color = generateRandomComplementaryColor(savedContent);
            if (!mode) {
                return convertPastel(color);
            } else {
                return color;
            }
        }
    } else {
        if (!mode) {
            if (unlocked.some(status => !status)) {
                let color = colorCode[randomFalseIndex()].value;

                return convertPastel(generateRandomComplementaryColor(color));
            } else {
                return convertPastel(color);
            }
        } else {
            if (unlocked.some(status => !status)) {
                let color = colorCode[randomFalseIndex()].value;
                return generateRandomComplementaryColor(color);
            } else {
                return color;
            }
        }
    }
}

function randomFalseIndex() {
    let falseIndices = unlocked
        .map((value, index) => value === false ? index : -1)
        .filter(index => index !== -1);
    let randomFalseIndex = falseIndices[Math.floor(Math.random() * falseIndices.length)];
    return randomFalseIndex;
}
function convertPastel(color) {
    const rgb = hexToRgb(color);
    const pastelColor = rgbToHex(
        Math.min(245, rgb.r + 55),
        Math.min(245, rgb.g + 55),
        Math.min(245, rgb.b + 55)
    );
    return pastelColor;
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

function shiftHue(r, g, b, shift) {
    const hsl = rgbToHsl(r, g, b);
    hsl.h = (hsl.h + shift) % 360;
    return hslToRgb(hsl.h, hsl.s, hsl.l);
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return { h: h * 360, s, l };
}

function hslToRgb(h, s, l) {
    let r, g, b;

    h /= 360;
    s = s || 0;
    l = l || 0;

    const temp1 = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const temp2 = 2 * l - temp1;

    function hueToRgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    r = hueToRgb(temp2, temp1, h + 1 / 3);
    g = hueToRgb(temp2, temp1, h);
    b = hueToRgb(temp2, temp1, h - 1 / 3);

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
function generateRandomComplementaryColor(baseColorHex) {
    const baseColorRgb = hexToRgb(baseColorHex);
    const baseColorHsl = rgbToHsl(baseColorRgb.r, baseColorRgb.g, baseColorRgb.b);

    let newColorHex;
    let newColorHsl;
    let newColorRgb;

    do {
        // Generate random variations for hue, saturation, and lightness
        const randomHueShift = Math.floor(Math.random() * 360) - 180; // Random hue shift between -180 to 180 degrees
        const randomSaturationShift = Math.random() * 0.5 - 0.25;  // Random saturation shift (-0.25 to 0.25)
        const randomLightnessShift = Math.random() * 0.5 - 0.25;   // Random lightness shift (-0.25 to 0.25)

        // Generate the new HSL color with random variations
        const newHue = (baseColorHsl.h + randomHueShift) % 360;
        const newSaturation = Math.min(1, Math.max(0, baseColorHsl.s + randomSaturationShift));
        const newLightness = Math.min(1, Math.max(0, baseColorHsl.l + randomLightnessShift));

        newColorHsl = { h: newHue, s: newSaturation, l: newLightness };

        // Convert HSL to RGB and then to HEX
        newColorRgb = hslToRgb(newColorHsl.h, newColorHsl.s, newColorHsl.l);
        newColorHex = rgbToHex(newColorRgb.r, newColorRgb.g, newColorRgb.b);

        // Ensure the new color is not too similar to the base color (Euclidean distance check)
    } while (isColorTooClose(baseColorRgb, newColorRgb));

    return newColorHex;  // Return the new random complementary color
}

function isColorTooClose(color1, color2) {
    const distance = Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
    return distance < 50;  // Threshold for "too close" (can adjust this value)
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
function changeIfDark(color, index) {
    if (isColorTooDark(color)) {
        colorCode[index].style.color = 'white';
        lockButtons[index].querySelector('img').classList.add('white');
        undoButtons[index].querySelector('img').classList.add('white');
        copyButtons[index].querySelector('img').classList.add('white');

    } else {
        colorCode[index].style.color = 'black';
        lockButtons[index].querySelector('img').classList.remove('white');
        undoButtons[index].querySelector('img').classList.remove('white');
        copyButtons[index].querySelector('img').classList.remove('white');

    }
}
function randomizeColors() {
    colors.forEach((colorDiv, index) => {
        if (unlocked[index]) {
            const newColor = getRandomColor();
            colorStacks[index].push(newColor);
            colorDiv.style.backgroundColor = newColor;
            colorCode[index].value = newColor.slice(1);

            changeIfDark(newColor, index);
        }
    });
    updateUrlWithColors();
}

function getColors() {
    const colorsList = [];
    colors.forEach((colorButton) => {
        const color = colorButton.querySelector('.color-code').value.trim();
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
        changeIfDark(colorCode[index].value, index);
    });
});

undoButtons.forEach((button, index) => {
    button.addEventListener("click", function() {
        if (colorStacks[index].length > 1) {
            colorStacks[index].pop();
            const previousColor = colorStacks[index].slice(-1)[0];

            colors[index].style.backgroundColor = previousColor;
            colorCode[index].value = previousColor.slice(1);

            changeIfDark(colorCode[index].value, index);
        }
    });
});

copyButtons.forEach((button, index) => {
    button.addEventListener("click", function() {
        const color = colorCode[index].value.trim();

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
            colorCode[index].value = colorArray[index];
        });
    }
}
textBox.addEventListener('input', () => {
    localStorage.setItem('textBoxContent', textBox.value);
});

window.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('textBoxContent');
    localStorage.removeItem('colorContent');
    localStorage.removeItem('currentPath');
    setColorsFromUrl();
});

document.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        randomizeColors();
    }
});