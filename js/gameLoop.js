import { 
    state, 
    resetGame, 
    TUNIC_COLORS, 
    TALKING_COMMENTS, 
    RADIAL_RADIUS, 
    RADIAL_BTN_SIZE, 
    RADIAL_ACTIONS 
} from './state.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- PROCEDURAL DRAWING UTILITIES ---

function drawRoundedRect(x, y, w, h, radius, fill, stroke, strokeWidth) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth || 1;
        ctx.stroke();
    }
}

function spawnFloatingText(x, y, text, color) {
    state.floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color || '#FFF',
        life: 1.0 // decays to 0.0
    });
}

function drawWobblyCircle(x, y, radius, fill, stroke, strokeWidth) {
    ctx.beginPath();
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const wobble = (Math.sin(angle * 6) * 1.5);
        const rx = x + Math.cos(angle) * (radius + wobble);
        const ry = y + Math.sin(angle) * (radius + wobble);
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth || 2;
        ctx.stroke();
    }
}

function drawHairstyle(x, y, style) {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#000000';

    switch(style) {
        case 1: // Green Mohawk
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 18); ctx.lineTo(x, y - 36); ctx.lineTo(x + 6, y - 18);
            ctx.moveTo(x - 14, y - 15); ctx.lineTo(x - 6, y - 32); ctx.lineTo(x, y - 18);
            ctx.moveTo(x, y - 18); ctx.lineTo(x + 6, y - 32); ctx.lineTo(x + 14, y - 15);
            ctx.fill(); ctx.stroke();
            break;
        case 2: // Giant Bushy Beard Kid
            ctx.fillStyle = '#8e44ad';
            ctx.beginPath();
            ctx.arc(x - 14, y + 10, 10, 0, Math.PI * 2);
            ctx.arc(x + 14, y + 10, 10, 0, Math.PI * 2);
            ctx.arc(x, y + 18, 14, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 18); ctx.quadraticCurveTo(x, y - 24, x + 5, y - 18);
            ctx.stroke();
            break;
        case 3: // Huge Curly Afro
            ctx.fillStyle = '#e67e22';
            ctx.beginPath();
            ctx.arc(x - 16, y - 12, 12, 0, Math.PI * 2);
            ctx.arc(x + 16, y - 12, 12, 0, Math.PI * 2);
            ctx.arc(x - 10, y - 24, 15, 0, Math.PI * 2);
            ctx.arc(x + 10, y - 24, 15, 0, Math.PI * 2);
            ctx.arc(x, y - 28, 18, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            break;
        case 4: // Receding Hairline
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.arc(x - 17, y - 4, 8, 0, Math.PI * 2);
            ctx.arc(x + 17, y - 4, 8, 0, Math.PI * 2);
            ctx.arc(x - 16, y - 10, 6, 0, Math.PI * 2);
            ctx.arc(x + 16, y - 10, 6, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            break;
        case 5: // Two Large Pigtails
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath(); ctx.arc(x - 18, y - 8, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x - 18, y - 8); ctx.quadraticCurveTo(x - 30, y + 4, x - 26, y + 14); ctx.quadraticCurveTo(x - 18, y + 6, x - 18, y - 8); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(x + 18, y - 8, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + 18, y - 8); ctx.quadraticCurveTo(x + 30, y + 4, x + 26, y + 14); ctx.quadraticCurveTo(x + 18, y + 6, x + 18, y - 8); ctx.fill(); ctx.stroke();
            break;
        case 6: // Spiky Anime Red
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.moveTo(x - 18, y - 10); ctx.lineTo(x - 22, y - 26); ctx.lineTo(x - 12, y - 16);
            ctx.lineTo(x - 10, y - 34); ctx.lineTo(x - 2, y - 20); ctx.lineTo(x, y - 38);
            ctx.lineTo(x + 4, y - 20); ctx.lineTo(x + 10, y - 34); ctx.lineTo(x + 12, y - 16);
            ctx.lineTo(x + 22, y - 26); ctx.lineTo(x + 18, y - 10);
            ctx.fill(); ctx.stroke();
            break;
        case 7: // Double Horn Buns
            ctx.fillStyle = '#16a085';
            ctx.beginPath(); ctx.arc(x - 12, y - 18, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(x + 12, y - 18, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            break;
        case 8: // Slick Back Black
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath(); ctx.arc(x, y - 14, 16, Math.PI, 0); ctx.fill(); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x - 16, y - 14);
            ctx.quadraticCurveTo(x, y - 30, x + 16, y - 14);
            ctx.quadraticCurveTo(x + 22, y - 24, x + 4, y - 32);
            ctx.quadraticCurveTo(x - 16, y - 28, x - 16, y - 14);
            ctx.fill(); ctx.stroke();
            break;
        case 9: // Messy Bowl Cut
            ctx.fillStyle = '#d35400';
            ctx.beginPath();
            ctx.arc(x, y - 10, 18, Math.PI, 0); ctx.fill(); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x - 18, y - 10); ctx.lineTo(x + 18, y - 10);
            ctx.lineTo(x + 16, y - 2); ctx.lineTo(x + 8, y - 6);
            ctx.lineTo(x, y - 2); ctx.lineTo(x - 8, y - 6); ctx.lineTo(x - 16, y - 2);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            break;
        case 10: // Fluffy Blue Pompadour
            ctx.fillStyle = '#2980b9';
            ctx.beginPath();
            ctx.arc(x - 5, y - 16, 12, 0, Math.PI*2);
            ctx.arc(x + 8, y - 20, 14, 0, Math.PI*2);
            ctx.arc(x - 8, y - 24, 15, 0, Math.PI*2);
            ctx.fill(); ctx.stroke();
            break;
    }
}

function drawStudentFace(s) {
    const x = s.currentX;
    const y = s.currentY;
    const expr = s.expressionState;

    let faceSkinColor = '#ffe0bd';
    if (expr === 'AGGRESSIVE') {
        faceSkinColor = '#f5b7b1';
    }
    drawWobblyCircle(x, y - 5, 17, faceSkinColor, '#000000', 2.5);

    drawHairstyle(x, y, s.hairStyle);

    if (s.isBlinking) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - 11, y - 6); ctx.lineTo(x - 3, y - 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 3, y - 6); ctx.lineTo(x + 11, y - 6); ctx.stroke();
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x - 7, y - 6, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 7, y - 6, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#000000';
        let pxOffset = 0, pyOffset = 0;
        if (expr === 'SNEAKY') {
            pxOffset = 2.5;
        } else if (expr === 'ANGRY' || expr === 'AGGRESSIVE') {
            pyOffset = -1.5;
        }
        ctx.beginPath(); ctx.arc(x - 7 + pxOffset, y - 6 + pyOffset, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 7 + pxOffset, y - 6 + pyOffset, 2, 0, Math.PI * 2); ctx.fill();

        if (expr === 'BORED') {
            ctx.fillStyle = faceSkinColor;
            ctx.beginPath();
            ctx.arc(x - 7, y - 10, 5, 0, Math.PI, true);
            ctx.arc(x + 7, y - 10, 5, 0, Math.PI, true);
            ctx.fill(); ctx.stroke();
        } else if (expr === 'ANGRY' || expr === 'AGGRESSIVE') {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(x - 13, y - 12); ctx.lineTo(x - 3, y - 8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + 13, y - 12); ctx.lineTo(x + 3, y - 8); ctx.stroke();
        } else if (expr === 'EXCITED') {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x - 7, y - 11, 4, Math.PI, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(x + 7, y - 11, 4, Math.PI, 0); ctx.stroke();
        }
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    if (expr === 'BORED') {
        ctx.beginPath(); ctx.arc(x, y + 8, 4, Math.PI, 0, true); ctx.stroke();
    } else if (expr === 'EXCITED') {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath(); ctx.arc(x, y + 5, 6, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (expr === 'SNEAKY') {
        ctx.beginPath(); ctx.moveTo(x - 5, y + 4); ctx.quadraticCurveTo(x + 5, y + 7, x + 6, y + 2); ctx.stroke();
    } else if (expr === 'ANGRY') {
        ctx.beginPath(); ctx.moveTo(x - 6, y + 6); ctx.lineTo(x + 6, y + 5); ctx.stroke();
    } else if (expr === 'AGGRESSIVE') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 7, y + 3, 14, 6);
        ctx.strokeRect(x - 7, y + 3, 14, 6);
        ctx.beginPath(); ctx.moveTo(x - 7, y + 6); ctx.lineTo(x + 7, y + 6); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.arc(x, y + 4, 5, 0, Math.PI); ctx.stroke();
    }
}

function drawStudent(s) {
    ctx.fillStyle = s.bodyColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    drawRoundedRect(s.currentX - 16, s.currentY + 12, 32, 28, 6, s.bodyColor, '#000000', 2.5);

    drawStudentFace(s);

    if (state.selectedStudentId === s.id) {
        const arrowY = s.currentY - 45 + Math.sin(Date.now() / 100) * 4;
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(s.currentX, arrowY);
        ctx.lineTo(s.currentX - 8, arrowY - 10);
        ctx.lineTo(s.currentX - 4, arrowY - 10);
        ctx.lineTo(s.currentX - 4, arrowY - 20);
        ctx.lineTo(s.currentX + 4, arrowY - 20);
        ctx.lineTo(s.currentX + 4, arrowY - 10);
        ctx.lineTo(s.currentX + 8, arrowY - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    if (s.state === 'THROWING') {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(s.currentX + 18, s.currentY - 24);
        ctx.bezierCurveTo(s.currentX + 14, s.currentY - 18, s.currentX + 22, s.currentY - 18, s.currentX + 18, s.currentY - 24);
        ctx.fill();
        ctx.stroke();
    }
}

function drawBackground() {
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, 800, 600);

    ctx.strokeStyle = '#e5dec9';
    ctx.lineWidth = 2;
    for (let i = 0; i < 600; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(800, i + 80); ctx.stroke();
    }

    drawRoundedRect(120, 15, 560, 100, 8, '#1e3f20', '#5c4033', 8);

    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '11px "Courier New"';
    ctx.strokeText("2 + 2 = 🐟", 140, 45);
    ctx.strokeText("DETENTION COUNT: 10", 140, 75);
    ctx.strokeText("CLASSROOM RULES:", 485, 35);
    ctx.strokeText("- No spitballs!", 485, 55);
    ctx.strokeText("- Shh!", 485, 75);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(360, 52, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(352, 42); ctx.quadraticCurveTo(348, 32, 345, 36);
    ctx.moveTo(368, 42); ctx.quadraticCurveTo(372, 32, 375, 36);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(360, 64); ctx.lineTo(360, 85);
    ctx.moveTo(350, 72); ctx.lineTo(370, 72);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(354, 48); ctx.lineTo(358, 52);
    ctx.moveTo(358, 48); ctx.lineTo(354, 52);
    ctx.moveTo(362, 48); ctx.lineTo(366, 52);
    ctx.moveTo(366, 48); ctx.lineTo(362, 52);
    ctx.moveTo(356, 58); ctx.quadraticCurveTo(360, 54, 364, 58);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = 'bold 9px "Courier New"';
    ctx.fillText("← TEACHER!", 382, 56);

    const teachX = 400;
    const teachY = 120;
    
    ctx.fillStyle = '#2980b9';
    drawRoundedRect(teachX - 25, teachY + 5, 50, 40, 8, '#2980b9', '#000', 3);

    let teachFaceFill = '#fcd5b5';
    if (state.chaosMeter > 75.0) teachFaceFill = '#e74c3c';
    else if (state.chaosMeter > 40.0) teachFaceFill = '#f5b7b1';
    drawWobblyCircle(teachX, teachY - 15, 24, teachFaceFill, '#000', 3);

    ctx.fillStyle = '#95a5a6';
    ctx.beginPath();
    ctx.arc(teachX - 22, teachY - 15, 8, 0, Math.PI*2);
    ctx.arc(teachX + 22, teachY - 15, 8, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath(); ctx.arc(teachX - 10, teachY - 16, 11, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(teachX + 11, teachY - 14, 11, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(teachX - 1, teachY - 15); ctx.lineTo(teachX + 2, teachY - 15); ctx.stroke();

    ctx.fillStyle = '#000';
    if (state.chaosMeter > 75.0) {
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(teachX - 10, teachY - 16, 4, 0, Math.PI*2);
        ctx.arc(teachX + 11, teachY - 14, 4, 0, Math.PI*2);
        ctx.stroke();
    } else {
        ctx.beginPath(); ctx.arc(teachX - 10, teachY - 16, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(teachX + 11, teachY - 14, 2, 0, Math.PI*2); ctx.fill();
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    if (state.chaosMeter > 75.0) {
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(teachX, teachY - 2, 7, 0, Math.PI*2); ctx.fill();
    } else if (state.chaosMeter > 40.0) {
        ctx.beginPath();
        ctx.moveTo(teachX - 8, teachY - 4);
        ctx.quadraticCurveTo(teachX - 4, teachY - 7, teachX, teachY - 4);
        ctx.quadraticCurveTo(teachX + 4, teachY - 1, teachX + 8, teachY - 4);
        ctx.stroke();
    } else {
        ctx.beginPath(); ctx.arc(teachX, teachY - 5, 5, 0, Math.PI); ctx.stroke();
    }

    drawRoundedRect(340, 130, 120, 50, 6, '#8e44ad', '#5c4033', 4);
}

function drawChairs() {
    const colSpacing = 135;
    const startX = 130;
    const row1Y = 240;
    const row2Y = 390;

    for (let i = 0; i < 10; i++) {
        const isRow2 = i >= 5;
        const colIndex = i % 5;
        const dx = startX + (colIndex * colSpacing);
        const dy = isRow2 ? row2Y : row1Y;

        ctx.fillStyle = '#5c4033';
        ctx.fillRect(dx - 18, dy - 24, 36, 12);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(dx - 18, dy - 24, 36, 12);

        ctx.beginPath();
        ctx.moveTo(dx - 12, dy - 12); ctx.lineTo(dx - 12, dy);
        ctx.moveTo(dx + 12, dy - 12); ctx.lineTo(dx + 12, dy);
        ctx.stroke();
    }
}

function drawDeskSlabs() {
    const colSpacing = 135;
    const startX = 130;
    const row1Y = 240;
    const row2Y = 390;

    for (let i = 0; i < 10; i++) {
        const isRow2 = i >= 5;
        const colIndex = i % 5;
        const dx = startX + (colIndex * colSpacing);
        const dy = isRow2 ? row2Y : row1Y;

        drawRoundedRect(dx - 30, dy, 60, 40, 4, '#a0522d', '#5c4033', 3);

        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(dx - 18, dy + 10); ctx.lineTo(dx - 6, dy + 14);
        ctx.stroke();
    }
}

function drawFightCloud(s1, s2) {
    const midX = (s1.currentX + s2.currentX) / 2;
    const midY = (s1.currentY + s2.currentY) / 2;

    const puffs = 8;
    ctx.fillStyle = '#e5e7eb';
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 3;

    for (let i = 0; i < puffs; i++) {
        const angle = (i / puffs) * Math.PI * 2 + (Date.now() / 300);
        const ox = midX + Math.cos(angle) * 16;
        const oy = midY + Math.sin(angle) * 14;
        const size = 28 + (Math.sin(Date.now() / 80 + i) * 6);
        ctx.beginPath();
        ctx.arc(ox, oy, size, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
    }

    ctx.fillStyle = '#f1c40f';
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - (Date.now() / 150);
        const sx = midX + Math.cos(angle) * 45;
        const sy = midY + Math.sin(angle) * 40;
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI*2);
        ctx.fill();
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(midX - 25, midY - 5); ctx.lineTo(midX - 45, midY - 15);
    ctx.moveTo(midX + 22, midY + 15); ctx.lineTo(midX + 42, midY + 25);
    ctx.stroke();

    ctx.fillStyle = '#e74c3c';
    ctx.font = '900 16px "Arial Black", sans-serif';
    const bounce = Math.sin(Date.now() / 80) * 4;
    ctx.fillText("POW!", midX - 35, midY - 25 + bounce);
    ctx.fillStyle = '#f39c12';
    ctx.fillText("BAM!", midX + 15, midY + 28 - bounce);
}

function drawSpeechBubble(s) {
    const x = s.currentX + 25;
    const y = s.currentY - 45;

    ctx.font = 'bold 12px "Courier New"';
    const textWidth = ctx.measureText(s.talkingText).width;
    const bubbleW = Math.max(textWidth + 16, 110);
    const bubbleH = 34;

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    drawRoundedRect(x + 2, y + 2, bubbleW, bubbleH, 8, 'rgba(0,0,0,0.15)', null);

    drawRoundedRect(x, y, bubbleW, bubbleH, 8, '#ffffff', '#000000', 2);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + bubbleH);
    ctx.lineTo(s.currentX + 8, s.currentY - 8);
    ctx.lineTo(x + 30, y + bubbleH);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 15, y + bubbleH - 1);
    ctx.lineTo(x + 30, y + bubbleH - 1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 15, y + bubbleH);
    ctx.lineTo(s.currentX + 8, s.currentY - 8);
    ctx.moveTo(x + 30, y + bubbleH);
    ctx.lineTo(s.currentX + 8, s.currentY - 8);
    ctx.stroke();

    ctx.fillStyle = '#c0392b';
    ctx.font = 'bold 11px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.talkingText, x + bubbleW / 2, y + 20);
    ctx.textAlign = 'left';
}

function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, 800, 50);

    const thermX = 260;
    const thermY = 16;
    const thermW = 280;
    const thermH = 18;

    ctx.fillStyle = '#7f8c8d';
    drawRoundedRect(thermX, thermY, thermW, thermH, 8, '#2c3e50', '#ffffff', 2);

    const fluidFillWidth = (state.chaosMeter / 100.0) * (thermW - 4);
    const grad = ctx.createLinearGradient(thermX, 0, thermX + thermW, 0);
    grad.addColorStop(0, '#2ecc71');
    grad.addColorStop(0.5, '#f1c40f');
    grad.addColorStop(1, '#e74c3c');

    if (fluidFillWidth > 0) {
        drawRoundedRect(thermX + 2, thermY + 2, fluidFillWidth, thermH - 4, 6, grad, null);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("CLASSROOM CHAOS!", thermX + 15, thermY + 13);
    ctx.fillText(Math.round(state.chaosMeter) + "%", thermX + thermW - 45, thermY + 13);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText("🔔 TIME REMAINING: " + Math.max(0, Math.ceil(state.classTimer)) + "s", 780, 32);

    ctx.textAlign = 'left';
}

function drawRadialMenu(s) {
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(s.currentX, s.currentY, RADIAL_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(s.currentX, s.currentY, RADIAL_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    RADIAL_ACTIONS.forEach(act => {
        const rx = s.currentX + Math.cos(act.angle) * RADIAL_RADIUS;
        const ry = s.currentY + Math.sin(act.angle) * RADIAL_RADIUS;
        
        const isHovered = state.hoveredRadialActionId === act.id;
        const size = isHovered ? RADIAL_BTN_SIZE + 4 : RADIAL_BTN_SIZE;

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(rx, ry + 2, size, 0, Math.PI * 2);
        ctx.fill();

        drawWobblyCircle(rx, ry, size, isHovered ? act.hoverColor : act.color, '#000000', 2);

        ctx.fillStyle = '#ffffff';
        ctx.font = isHovered ? 'bold 16px "Comic Sans MS", Arial' : '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(act.icon, rx, ry + (isHovered ? 6 : 5));
        ctx.textAlign = 'left';

        if (isHovered) {
            ctx.font = '900 11px "Comic Sans MS", Arial, sans-serif';
            const textW = ctx.measureText(act.label).width;
            const tipY = ry < s.currentY ? ry - size - 10 : ry + size + 16;
            
            drawRoundedRect(rx - (textW/2) - 8, tipY - 12, textW + 16, 18, 4, '#111111', '#ffffff', 1);
            ctx.fillStyle = '#f1c40f';
            ctx.textAlign = 'center';
            ctx.fillText(act.label, rx, tipY);
            ctx.textAlign = 'left';
        }
    });
}

function drawFooter() {
    const footY = 500;
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, footY, 800, 100);

    const clipX = 30;
    const clipY = footY + 10;
    const clipW = 740;
    const clipH = 80;
    drawRoundedRect(clipX, clipY, clipW, clipH, 6, '#dfc19c', '#000000', 2.5);

    drawRoundedRect(360, clipY - 5, 80, 15, 4, '#95a5a6', '#000000', 1.5);

    let countTalk = 0, countWand = 0, countThrow = 0, countFight = 0;
    state.students.forEach(s => {
        if (s.state === 'TALKING') countTalk++;
        else if (s.state === 'WANDERING') countWand++;
        else if (s.state === 'THROWING') countThrow++;
        else if (s.state === 'FIGHTING') countFight++;
    });

    ctx.fillStyle = '#2c3e50';
    ctx.font = '900 12px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("📝 DISRUPTION STATISTICS:", clipX + 25, clipY + 25);
    
    ctx.font = 'bold 11px "Comic Sans MS", Arial, sans-serif';
    ctx.fillStyle = countTalk > 0 ? '#e74c3c' : '#7f8c8d';
    ctx.fillText("🗣️  TALKING: " + countTalk, clipX + 35, clipY + 45);

    ctx.fillStyle = countWand > 0 ? '#e74c3c' : '#7f8c8d';
    ctx.fillText("🪑  WANDERING: " + countWand, clipX + 35, clipY + 63);

    ctx.fillStyle = countThrow > 0 ? '#e74c3c' : '#7f8c8d';
    ctx.fillText("🎒  THROWING: " + (countThrow / 2), clipX + 160, clipY + 45);

    ctx.fillStyle = countFight > 0 ? '#e74c3c' : '#7f8c8d';
    ctx.fillText("↔️  FIGHTING: " + countFight, clipX + 160, clipY + 63);

    ctx.fillStyle = '#2c3e50';
    ctx.font = '900 12px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("📓 TEACHER'S LOG DIARY:", clipX + 350, clipY + 25);

    let logText = "Drinking my coffee in peace... All quiet.";
    if (state.chaosMeter > 80.0) {
        logText = "THEY HAVE TAKEN OVER! SEND REINFORCEMENTS!";
    } else if (state.chaosMeter > 50.0) {
        logText = "My left eyelid is twitching. Total chaos is imminent.";
    } else if (state.chaosMeter > 20.0) {
        logText = "Spitballs are flying. Must restore order immediately.";
    }

    ctx.fillStyle = '#111111';
    ctx.font = 'italic 12px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText('"' + logText + '"', clipX + 360, clipY + 52);

    ctx.fillStyle = '#7f8c8d';
    ctx.font = 'bold 9px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("TIP: CLICK AN ACTIVE STUDENT TO DISCIPLINE THEM", clipX + 500, clipY + 74);
}

function drawMainMenu() {
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(0, 0, 800, 600);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 3;
    for(let i=0; i<800; i+=30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 600); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(800, i); ctx.stroke();
    }

    ctx.fillStyle = '#1a252f';
    ctx.font = '900 48px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("CLASSROOM CHAOS!", 403, 68);
    ctx.fillStyle = '#f1c40f';
    ctx.fillText("CLASSROOM CHAOS!", 400, 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("Can you maintain order until the final bell rings?", 400, 105);

    const boardX = 140;
    const boardY = 135;
    const boardW = 520;
    const boardH = 250;

    drawRoundedRect(boardX - 6, boardY - 6, boardW + 12, boardH + 12, 12, '#5c4033');
    drawRoundedRect(boardX, boardY, boardW, boardH, 8, '#1e3f20');

    ctx.fillStyle = '#f1c40f';
    ctx.font = '900 16px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("📋 CLASSROOM DISCIPLINE PROTOCOL", boardX + 30, boardY + 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("Click any misbehaving kid to open their Action Ring, then select:", boardX + 30, boardY + 60);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(boardX + 25, boardY + 75);
    ctx.lineTo(boardX + boardW - 25, boardY + 75);
    ctx.stroke();

    const tableY = boardY + 110;
    ctx.font = '13px "Courier New"';

    ctx.fillStyle = '#f5b041';
    ctx.fillText("🗣️ Chatting loudly", boardX + 30, tableY);
    ctx.fillText("🪑 Wandering around", boardX + 30, tableY + 30);
    ctx.fillText("🎒 Throwing spitballs", boardX + 30, tableY + 60);
    ctx.fillText("↔️ Starting fights", boardX + 30, tableY + 90);

    ctx.fillStyle = '#5dade2';
    ctx.fillText("➔ Choose 'QUIET' (🗣️)", boardX + 270, tableY);
    ctx.fillStyle = '#58d68d';
    ctx.fillText("➔ Choose 'SIT DOWN' (🪑)", boardX + 270, tableY + 30);
    ctx.fillStyle = '#f4d03f';
    ctx.fillText("➔ Choose 'CONFISCATE' (🎒)", boardX + 270, tableY + 60);
    ctx.fillStyle = '#af7ac5';
    ctx.fillText("➔ Choose 'SEPARATE' (↔️)", boardX + 270, tableY + 90);

    const bobOffset = Math.sin(Date.now() / 200) * 3;

    const leftX = 80;
    const leftY = 475;
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(leftX - 18, leftY + 15, 36, 10);
    ctx.fillStyle = '#a0522d';
    drawRoundedRect(leftX - 25, leftY + 25, 50, 30, 4, '#a0522d', '#5c4033', 2);
    
    const menuStudentLeft = {
        id: -99,
        bodyColor: '#3498db',
        hairStyle: 3,
        currentX: leftX,
        currentY: leftY + bobOffset,
        isBlinking: (Math.sin(Date.now() / 400) > 0.95),
        expressionState: 'EXCITED'
    };
    drawStudent(menuStudentLeft);

    const rightX = 720;
    const rightY = 475;
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(rightX - 18, rightY + 15, 36, 10);
    ctx.fillStyle = '#a0522d';
    drawRoundedRect(rightX - 25, rightY + 25, 50, 30, 4, '#a0522d', '#5c4033', 2);

    const menuStudentRight = {
        id: -100,
        bodyColor: '#e74c3c',
        hairStyle: 6,
        currentX: rightX,
        currentY: rightY - bobOffset,
        isBlinking: (Math.sin(Date.now() / 450) > 0.95),
        expressionState: 'SNEAKY'
    };
    drawStudent(menuStudentRight);

    ctx.font = 'bold 11px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    
    drawRoundedRect(leftX - 5, leftY - 72 + bobOffset, 95, 26, 6, '#ffffff', '#000000', 1.5);
    ctx.fillStyle = '#c0392b';
    ctx.fillText("Recess yet?", leftX + 42, leftY - 55 + bobOffset);
    
    drawRoundedRect(rightX - 90, rightY - 72 - bobOffset, 95, 26, 6, '#ffffff', '#000000', 1.5);
    ctx.fillStyle = '#c0392b';
    ctx.fillText("Hehe! Watch!", rightX - 42, rightY - 55 - bobOffset);

    const isHover = (state.mouseX >= 300 && state.mouseX <= 500 && state.mouseY >= 445 && state.mouseY <= 505);
    const offset = isHover ? 2 : 0;
    
    ctx.fillStyle = '#1a252f';
    drawRoundedRect(300, 445 + 5, 200, 60, 15, '#1a252f');
    drawRoundedRect(300, 445 + offset, 200, 60, 15, isHover ? '#27ae60' : '#2ecc71', '#ffffff', 3);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("START GAME", 400, 483 + offset);

    ctx.textAlign = 'left';
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = '#e74c3c';
    ctx.font = '900 46px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("CLASSROOM OUT OF CONTROL!", 400, 140);

    const teachX = 400;
    const teachY = 250;
    
    drawWobblyCircle(teachX, teachY, 35, '#fcd5b5', '#000000', 3);
    
    ctx.fillStyle = '#95a5a6';
    ctx.beginPath();
    ctx.arc(teachX - 32, teachY, 10, 0, Math.PI * 2);
    ctx.arc(teachX + 32, teachY, 10, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#e59866';
    ctx.beginPath(); ctx.arc(teachX, teachY - 2, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = '#000000'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(teachX - 22, teachY - 26); ctx.lineTo(teachX - 8, teachY - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(teachX + 22, teachY - 26); ctx.lineTo(teachX + 8, teachY - 20); ctx.stroke();

    ctx.beginPath(); ctx.arc(teachX - 14, teachY - 14, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(teachX + 14, teachY - 14, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(teachX - 1, teachY - 14); ctx.lineTo(teachX + 1, teachY - 14); ctx.stroke();

    ctx.strokeStyle = '#000000'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(teachX - 20, teachY - 18); ctx.lineTo(teachX - 8, teachY - 10);
    ctx.moveTo(teachX - 8, teachY - 18); ctx.lineTo(teachX - 20, teachY - 10);
    ctx.moveTo(teachX + 8, teachY - 18); ctx.lineTo(teachX + 20, teachY - 10);
    ctx.moveTo(teachX + 20, teachY - 18); ctx.lineTo(teachX + 8, teachY - 10);
    ctx.stroke();

    ctx.fillStyle = '#78281f';
    ctx.beginPath();
    ctx.moveTo(teachX - 18, teachY + 12);
    ctx.quadraticCurveTo(teachX, teachY + 5, teachX + 18, teachY + 12);
    ctx.quadraticCurveTo(teachX + 12, teachY + 25, teachX, teachY + 25);
    ctx.quadraticCurveTo(teachX - 12, teachY + 25, teachX - 18, teachY + 12);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(teachX - 14, teachY + 8, 5, 0, Math.PI * 2);
    ctx.arc(teachX + 14, teachY + 8, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3498db'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(teachX - 14, teachY + 8); ctx.quadraticCurveTo(teachX - 22, teachY + 22, teachX - 16, teachY + 36);
    ctx.moveTo(teachX + 14, teachY + 8); ctx.quadraticCurveTo(teachX + 22, teachY + 22, teachX + 16, teachY + 36);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("The principal dismissed you from your duties due to extreme volume levels.", 400, 360);

    const isHover = (state.mouseX >= 320 && state.mouseX <= 480 && state.mouseY >= 440 && state.mouseY <= 500);
    const offset = isHover ? 2 : 0;

    ctx.fillStyle = '#1a252f';
    drawRoundedRect(320, 440 + 5, 160, 60, 15, '#1a252f');
    drawRoundedRect(320, 440 + offset, 160, 60, 15, isHover ? '#e67e22' : '#f39c12', '#ffffff', 3);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("RETRY", 400, 478 + offset);

    ctx.textAlign = 'left';
}

function drawVictory() {
    ctx.fillStyle = 'rgba(46, 204, 113, 0.95)';
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = 'rgba(241, 196, 15, 0.4)';
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + (Date.now() / 800);
        const sx = 400 + Math.cos(angle) * 160;
        const sy = 280 + Math.sin(angle) * 160;
        ctx.beginPath(); ctx.arc(sx, sy, 25, 0, Math.PI*2); ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("CLASS DISMISSED SUCCESSFULLY!", 400, 130);

    const teachX = 400;
    const teachY = 240;
    
    drawWobblyCircle(teachX, teachY, 35, '#ffe0bd', '#000000', 3);
    
    ctx.fillStyle = '#95a5a6';
    ctx.beginPath();
    ctx.arc(teachX - 32, teachY, 10, 0, Math.PI * 2);
    ctx.arc(teachX + 32, teachY, 10, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#e59866';
    ctx.beginPath(); ctx.arc(teachX, teachY - 2, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = '#000000'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(teachX - 14, teachY - 22, 6, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(teachX + 14, teachY - 22, 6, Math.PI, 0); ctx.stroke();

    ctx.beginPath(); ctx.arc(teachX - 14, teachY - 14, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(teachX + 14, teachY - 14, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(teachX - 1, teachY - 14); ctx.lineTo(teachX + 1, teachY - 14); ctx.stroke();

    ctx.beginPath(); ctx.arc(teachX - 14, teachY - 12, 7, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(teachX + 14, teachY - 12, 7, Math.PI, 0); ctx.stroke();

    ctx.fillStyle = '#78281f';
    ctx.beginPath();
    ctx.arc(teachX, teachY + 8, 14, 0, Math.PI);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(teachX - 10, teachY + 8, 20, 4);
    ctx.strokeRect(teachX - 10, teachY + 8, 20, 4);

    const score = Math.round((100 - state.chaosMeter) * 100 + 1000);
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 24px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("FINAL SCORE: " + score + " PTS", 400, 360);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("Excellent work! You kept the kids focused and avoided total disaster.", 400, 410);

    const isHover = (state.mouseX >= 300 && state.mouseX <= 500 && state.mouseY >= 460 && state.mouseY <= 520);
    const offset = isHover ? 2 : 0;

    ctx.fillStyle = '#1a252f';
    drawRoundedRect(300, 460 + 5, 200, 60, 15, '#1a252f');
    drawRoundedRect(300, 460 + offset, 200, 60, 15, isHover ? '#9b59b6' : '#8e44ad', '#ffffff', 3);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("PLAY AGAIN", 400, 498 + offset);

    ctx.textAlign = 'left';
}

// --- GAME STATE UPDATE & MATH LOOP ---

function updateGame(dt) {
    if (state.gameState !== 'PLAYING') return;

    state.classTimer -= dt;
    if (state.classTimer <= 0) {
        state.classTimer = 0;
        if (state.chaosMeter < 100.0) {
            state.gameState = 'VICTORY';
        }
    }

    let frameChaosSum = 0.0;
    state.students.forEach(s => {
        if (s.state === 'TALKING') frameChaosSum += 1.5;
        else if (s.state === 'WANDERING') frameChaosSum += 2.0;
        else if (s.state === 'THROWING') frameChaosSum += 3.0;
        else if (s.state === 'FIGHTING') frameChaosSum += 5.0;
    });
    state.chaosMeter += frameChaosSum * dt;
    state.chaosMeter = Math.max(0.0, Math.min(100.0, state.chaosMeter));

    if (state.chaosMeter > 75.0) {
        state.screenShake = Math.max(state.screenShake, 2.5);
    }

    if (state.chaosMeter >= 100.0) {
        state.gameState = 'GAME_OVER';
    }

    state.students.forEach(s => {
        s.blinkTimer -= dt;
        if (s.blinkTimer <= 0) {
            if (!s.isBlinking) {
                s.isBlinking = true;
                s.blinkTimer = 0.15;
            } else {
                s.isBlinking = false;
                s.blinkTimer = Math.random() * 3 + 2;
            }
        }
    });

    state.aiTimer += dt;
    if (state.aiTimer >= 2.5) {
        state.aiTimer = 0.0;
        
        state.students.forEach(s => {
            if (s.state === 'ATTENTIVE') {
                if (Math.random() < 0.40) {
                    const roll = Math.random();
                    if (roll < 0.40) {
                        s.state = 'TALKING';
                        s.expressionState = 'EXCITED';
                        s.talkingText = TALKING_COMMENTS[Math.floor(Math.random() * TALKING_COMMENTS.length)];
                    } else if (roll < 0.70) {
                        s.state = 'WANDERING';
                        s.expressionState = 'SNEAKY';
                        s.targetX = 80 + Math.random() * 640;
                        s.targetY = 180 + Math.random() * 260;
                    } else if (roll < 0.90) {
                        s.state = 'THROWING';
                        s.expressionState = 'ANGRY';
                        
                        let targetId = (s.id + 1) % 10;
                        const targetStudent = state.students[targetId];

                        state.projectiles.push({
                            startX: s.currentX,
                            startY: s.currentY - 10,
                            currentX: s.currentX,
                            currentY: s.currentY - 10,
                            targetX: targetStudent.currentX,
                            targetY: targetStudent.currentY - 10,
                            speed: 250.0
                        });
                    } else {
                        let closest = null;
                        let minDist = Infinity;
                        state.students.forEach(other => {
                            if (other.id !== s.id && other.state !== 'FIGHTING') {
                                const dx = other.currentX - s.currentX;
                                const dy = other.currentY - s.currentY;
                                const dist = Math.sqrt(dx*dx + dy*dy);
                                if (dist < minDist) {
                                    minDist = dist;
                                    closest = other;
                                }
                            }
                        });

                        if (closest) {
                            s.state = 'FIGHTING';
                            s.expressionState = 'AGGRESSIVE';
                            s.targetStudentId = closest.id;

                            closest.state = 'FIGHTING';
                            closest.expressionState = 'AGGRESSIVE';
                            closest.targetStudentId = s.id;

                            const midX = (s.currentX + closest.currentX) / 2;
                            const midY = (s.currentY + closest.currentY) / 2;
                            s.targetX = midX;
                            s.targetY = midY;
                            closest.targetX = midX;
                            closest.targetY = midY;

                            state.screenShake = Math.max(state.screenShake, 5);
                        }
                    }
                }
            }
        });
    }

    state.students.forEach(s => {
        s.stateTimer += dt;

        if (s.state === 'WANDERING') {
            const dx = s.targetX - s.currentX;
            const dy = s.targetY - s.currentY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist > 5.0) {
                const speed = 110.0;
                s.currentX += (dx / dist) * speed * dt;
                s.currentY += (dy / dist) * speed * dt;
            } else {
                if (s.targetX === s.homeX && s.targetY === s.homeY) {
                    s.state = 'ATTENTIVE';
                    s.expressionState = 'BORED';
                    s.talkingText = '';
                } else {
                    s.targetX = 80 + Math.random() * 640;
                    s.targetY = 180 + Math.random() * 260;
                }
            }
        }

        if (s.state === 'FIGHTING') {
            const partner = state.students[s.targetStudentId];
            if (partner) {
                const midX = (s.homeX + partner.homeX) / 2;
                const midY = (s.homeY + partner.homeY) / 2;
                const dx = midX - s.currentX;
                const dy = midY - s.currentY;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist > 18.0) {
                    const speed = 140.0;
                    s.currentX += (dx / dist) * speed * dt;
                    s.currentY += (dy / dist) * speed * dt;
                } else {
                    s.currentX = midX + (Math.random() - 0.5) * 8;
                    s.currentY = midY + (Math.random() - 0.5) * 8;
                }
            }
        }
    });

    for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const p = state.projectiles[i];
        const dx = p.targetX - p.currentX;
        const dy = p.targetY - p.currentY;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > 6.0) {
            p.currentX += (dx / dist) * p.speed * dt;
            p.currentY += (dy / dist) * p.speed * dt;
        } else {
            state.chaosMeter = Math.min(100.0, state.chaosMeter + 1.5);
            state.screenShake = Math.max(state.screenShake, 1.5);
            state.projectiles.splice(i, 1);
        }
    }

    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y -= 25 * dt;
        ft.life -= dt * 1.5;
        if (ft.life <= 0) {
            state.floatingTexts.splice(i, 1);
        }
    }
}

function render() {
    ctx.clearRect(0, 0, 800, 600);

    ctx.save();
    if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake;
        const shakeY = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(shakeX, shakeY);
        state.screenShake *= 0.9;
        if (state.screenShake < 0.1) state.screenShake = 0.0;
    }

    if (state.gameState === 'MAIN_MENU') {
        drawMainMenu();
    } else if (state.gameState === 'PLAYING') {
        drawBackground();
        drawChairs();

        state.students.forEach(s => {
            if (s.state === 'ATTENTIVE' || s.state === 'TALKING' || s.state === 'THROWING') {
                drawStudent(s);
            }
        });

        drawDeskSlabs();

        state.students.forEach(s => {
            if (s.state === 'WANDERING') {
                drawStudent(s);
            }
        });

        const handledFighters = new Set();
        state.students.forEach(s => {
            if (s.state === 'FIGHTING' && !handledFighters.has(s.id)) {
                const partner = state.students[s.targetStudentId];
                if (partner) {
                    drawFightCloud(s, partner);
                    handledFighters.add(s.id);
                    handledFighters.add(partner.id);
                }
            }
        });

        state.students.forEach(s => {
            if (s.state === 'TALKING' && s.talkingText) {
                drawSpeechBubble(s);
            }
        });

        state.projectiles.forEach(p => {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#7f8c8d';
            ctx.lineWidth = 1.5;
            drawWobblyCircle(p.currentX, p.currentY, 6, '#ffffff', '#7f8c8d', 1.5);
            
            ctx.strokeStyle = 'rgba(127, 140, 141, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.currentX - 10, p.currentY);
            ctx.lineTo(p.currentX, p.currentY);
            ctx.stroke();
        });

        if (state.selectedStudentId !== -1) {
            const s = state.students[state.selectedStudentId];
            drawRadialMenu(s);
        }

        state.floatingTexts.forEach(ft => {
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 14px "Comic Sans MS", Arial, sans-serif';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.shadowBlur = 0;
        });

        drawHUD();
        drawFooter();

    } else if (state.gameState === 'GAME_OVER') {
        drawGameOver();
    } else if (state.gameState === 'VICTORY') {
        drawVictory();
    }

    ctx.restore();
}

// --- USER INTERACTION EVENTS ---

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (800 / rect.width);
    const my = (e.clientY - rect.top) * (600 / rect.height);

    if (state.gameState === 'MAIN_MENU') {
        if (mx >= 300 && mx <= 500 && my >= 445 && my <= 505) {
            resetGame();
            state.gameState = 'PLAYING';
        }
    } else if (state.gameState === 'GAME_OVER') {
        if (mx >= 320 && mx <= 480 && my >= 440 && my <= 500) {
            resetGame();
            state.gameState = 'PLAYING';
        }
    } else if (state.gameState === 'VICTORY') {
        if (mx >= 300 && mx <= 500 && my >= 460 && my <= 520) {
            resetGame();
            state.gameState = 'PLAYING';
        }
    } else if (state.gameState === 'PLAYING') {
        let clickedOnRadialButton = false;

        if (state.selectedStudentId !== -1) {
            const s = state.students[state.selectedStudentId];
            
            for (let i = 0; i < RADIAL_ACTIONS.length; i++) {
                const act = RADIAL_ACTIONS[i];
                const rx = s.currentX + Math.cos(act.angle) * RADIAL_RADIUS;
                const ry = s.currentY + Math.sin(act.angle) * RADIAL_RADIUS;
                const dx = mx - rx;
                const dy = my - ry;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist <= RADIAL_BTN_SIZE + 4) {
                    clickedOnRadialButton = true;
                    let resolved = false;

                    if (s.state === 'TALKING' && act.id === 'QUIET') {
                        s.state = 'ATTENTIVE';
                        s.expressionState = 'BORED';
                        s.talkingText = '';
                        state.chaosMeter = Math.max(0.0, state.chaosMeter - 5.0);
                        spawnFloatingText(s.currentX, s.currentY - 30, "SHH! -5% Chaos", '#2ecc71');
                        resolved = true;
                    } 
                    else if (s.state === 'WANDERING' && act.id === 'SIT') {
                        s.targetX = s.homeX;
                        s.targetY = s.homeY;
                        spawnFloatingText(s.currentX, s.currentY - 30, "GO BACK! -5% Chaos", '#2ecc71');
                        state.chaosMeter = Math.max(0.0, state.chaosMeter - 5.0);
                        resolved = true;
                    } 
                    else if (s.state === 'THROWING' && act.id === 'CONFISCATE') {
                        s.state = 'ATTENTIVE';
                        s.expressionState = 'BORED';
                        spawnFloatingText(s.currentX, s.currentY - 30, "CONFISCATED! -5% Chaos", '#2ecc71');
                        state.chaosMeter = Math.max(0.0, state.chaosMeter - 5.0);
                        resolved = true;
                    } 
                    else if (s.state === 'FIGHTING' && act.id === 'SEPARATE') {
                        const partner = state.students[s.targetStudentId];
                        s.state = 'WANDERING';
                        s.targetX = s.homeX;
                        s.targetY = s.homeY;
                        s.expressionState = 'SNEAKY';
                        s.targetStudentId = -1;

                        if (partner) {
                            partner.state = 'WANDERING';
                            partner.targetX = partner.homeX;
                            partner.targetY = partner.homeY;
                            partner.expressionState = 'SNEAKY';
                            partner.targetStudentId = -1;
                        }

                        spawnFloatingText(s.currentX, s.currentY - 30, "SEPARATED! -10% Chaos", '#2ecc71');
                        state.chaosMeter = Math.max(0.0, state.chaosMeter - 10.0);
                        resolved = true;
                    }

                    if (resolved) {
                        state.selectedStudentId = -1;
                        state.hoveredRadialActionId = '';
                        state.screenShake = Math.max(state.screenShake, 3);
                    } else {
                        spawnFloatingText(rx, ry - 15, "WRONG!", '#e74c3c');
                        state.screenShake = Math.max(state.screenShake, 4);
                    }
                    break;
                }
            }
        }

        if (!clickedOnRadialButton) {
            let studentClicked = false;
            
            for (let i = 0; i < state.students.length; i++) {
                const s = state.students[i];
                const dx = mx - s.currentX;
                const dy = my - s.currentY;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist <= 28) {
                    state.selectedStudentId = s.id;
                    studentClicked = true;
                    state.hoveredRadialActionId = '';
                    break;
                }
            }

            if (!studentClicked && my < 500) {
                state.selectedStudentId = -1;
            }
        }
    }
}

function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    state.mouseX = (e.clientX - rect.left) * (800 / rect.width);
    state.mouseY = (e.clientY - rect.top) * (600 / rect.height);

    let hoverActive = false;
    state.hoveredRadialActionId = '';

    if (state.gameState === 'PLAYING') {
        if (state.selectedStudentId !== -1) {
            const s = state.students[state.selectedStudentId];
            for (let i = 0; i < RADIAL_ACTIONS.length; i++) {
                const act = RADIAL_ACTIONS[i];
                const rx = s.currentX + Math.cos(act.angle) * RADIAL_RADIUS;
                const ry = s.currentY + Math.sin(act.angle) * RADIAL_RADIUS;
                const dx = state.mouseX - rx;
                const dy = state.mouseY - ry;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist <= RADIAL_BTN_SIZE + 4) {
                    state.hoveredRadialActionId = act.id;
                    hoverActive = true;
                    break;
                }
            }
        }

        if (state.hoveredRadialActionId === '') {
            state.students.forEach(s => {
                const dx = state.mouseX - s.currentX;
                const dy = state.mouseY - s.currentY;
                if (Math.sqrt(dx*dx + dy*dy) <= 25) {
                    hoverActive = true;
                }
            });
        }
    } else if (state.gameState === 'MAIN_MENU') {
        if (state.mouseX >= 300 && state.mouseX <= 500 && state.mouseY >= 445 && state.mouseY <= 505) hoverActive = true;
    } else if (state.gameState === 'GAME_OVER') {
        if (state.mouseX >= 320 && state.mouseX <= 480 && state.mouseY >= 440 && state.mouseY <= 500) hoverActive = true;
    } else if (state.gameState === 'VICTORY') {
        if (state.mouseX >= 300 && state.mouseX <= 500 && state.mouseY >= 460 && state.mouseY <= 520) hoverActive = true;
    }

    canvas.style.cursor = hoverActive ? 'pointer' : 'default';
}

canvas.addEventListener('mousedown', handleCanvasClick);
canvas.addEventListener('mousemove', handleCanvasMouseMove);

// --- MAIN TICK TIMESTEP INTERFACE ---
let lastTime = performance.now();

function gameLoop(currentTime) {
    let dt = (currentTime - lastTime) / 1000.0;
    
    if (dt > 0.1) dt = 0.1;
    
    lastTime = currentTime;

    updateGame(dt);
    render();

    requestAnimationFrame(gameLoop);
}

// Trigger Initial Render
resetGame();
requestAnimationFrame(gameLoop);