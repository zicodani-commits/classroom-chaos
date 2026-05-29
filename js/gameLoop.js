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

let audioCtx = null;

// Ensure game defaults to our newly added "NORMAL" tier
state.difficulty = 'NORMAL';

// --- PROCEDURAL AUDIO GENERATION (WEB AUDIO API) ---

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch(type) {
        case 'click':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
        case 'success':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.setValueAtTime(500, now + 0.08);
            osc.frequency.setValueAtTime(750, now + 0.16);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
            break;
        case 'fail':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.linearRampToValueAtTime(70, now + 0.35);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
            break;
        case 'throw':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
            break;
        case 'splat':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
            break;
        case 'bell':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
            osc.start(now);
            osc.stop(now + 1.2);

            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1250, now);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            gain2.gain.setValueAtTime(0.1, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
            osc2.start(now);
            osc2.stop(now + 0.9);
            break;
    }
}

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
        life: 1.2
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
            ctx.beginPath();
            ctx.arc(x, y - 14, 16, Math.PI, 0); ctx.fill(); ctx.stroke();
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
            ctx.arc(x, y - 18, 14, 0, Math.PI * 2);
            ctx.arc(x - 8, y - 24, 12, 0, Math.PI * 2);
            ctx.arc(x + 10, y - 20, 10, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            break;
    }
}

function drawDesk(x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x - 42, y + 15, 6, 35);
    ctx.fillRect(x + 36, y + 15, 6, 35);

    ctx.fillStyle = '#34495e';
    ctx.fillRect(x - 40, y + 10, 5, 40);
    ctx.fillRect(x + 35, y + 10, 5, 40);

    drawRoundedRect(x - 50, y + 2, 100, 22, 6, '#d35400', '#5c3a21', 3);

    drawRoundedRect(x - 22, y + 6, 20, 12, 2, '#ffffff', '#bdc3c7', 1.5);
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 18, y + 10); ctx.lineTo(x - 6, y + 10);
    ctx.moveTo(x - 18, y + 13); ctx.lineTo(x - 10, y + 13);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 24, y + 8, 5, 0, Math.PI*2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#c0392b';
    ctx.stroke();
}

// --- CARTOON TEACHER RENDERING (BIGGER HEAD UPDATE) ---

function drawTeacher() {
    const tx = 400;
    const ty = 145; // Front of class coordinate

    // 1. Teacher's Desk
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(tx - 65, ty + 12, 130, 25);
    
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(tx - 55, ty + 5, 6, 30);
    ctx.fillRect(tx + 49, ty + 5, 6, 30);
    
    drawRoundedRect(tx - 60, ty + 2, 120, 18, 4, '#8a4c2d', '#5c3a21', 3);

    drawRoundedRect(tx - 30, ty + 5, 18, 10, 1, '#7f8c8d', '#34495e', 1);
    ctx.fillStyle = '#fff';
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(tx + 25, ty + 4, 8, 8);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(tx + 31, ty + 6, 3, 4);

    const steamDrift = Math.sin(Date.now() * 0.008) * 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx + 29, ty + 2);
    ctx.bezierCurveTo(tx + 29 + steamDrift, ty - 3, tx + 27 - steamDrift, ty - 6, tx + 28, ty - 10);
    ctx.stroke();

    // 2. Animated Teacher Body
    ctx.save();
    let bodyY = ty - 14;
    let bob = Math.sin(Date.now() * 0.004) * 1.5;
    
    let stateStyle = 'CALM';
    if (state.chaosMeter >= 0.7) {
        stateStyle = 'PANICKED';
    } else if (state.chaosMeter >= 0.4) {
        stateStyle = 'STRESSED';
    }

    if (stateStyle === 'PANICKED') {
        bob = Math.sin(Date.now() * 0.02) * 4;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        // Wave Left Arm
        ctx.beginPath();
        ctx.moveTo(tx - 12, bodyY + 10);
        ctx.lineTo(tx - 28, bodyY - 14 + Math.sin(Date.now() * 0.035) * 8);
        ctx.stroke();
        // Wave Right Arm
        ctx.beginPath();
        ctx.moveTo(tx + 12, bodyY + 10);
        ctx.lineTo(tx + 28, bodyY - 14 + Math.cos(Date.now() * 0.035) * 8);
        ctx.stroke();
    } else if (stateStyle === 'STRESSED') {
        bob = Math.sin(Date.now() * 0.01) * 2;
    }

    ctx.fillStyle = '#9b59b6';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(tx - 14, bodyY + 22);
    ctx.quadraticCurveTo(tx, bodyY, tx + 14, bodyY + 22);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Teacher Head (Enlarged from 13 to 21 Radius for better cartoon aesthetics)
    const headY = bodyY - 10 + bob; 
    drawWobblyCircle(tx, headY, 21, '#ffdbac', '#000000', 3);

    // Hair bun (Scaled to Head)
    ctx.fillStyle = '#7e5109';
    ctx.beginPath();
    ctx.arc(tx, headY - 21, 11, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Eyes (Scaled spacing/radius)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tx - 6, headY - 3, 4.5, 0, Math.PI * 2);
    ctx.arc(tx + 6, headY - 3, 4.5, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(tx - 6, headY - 3, 1.8, 0, Math.PI * 2);
    ctx.arc(tx + 6, headY - 3, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Glasses (Scaled to head)
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(tx - 6, headY - 3, 6.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tx + 6, headY - 3, 6.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx - 1, headY - 3); ctx.lineTo(tx + 1, headY - 3);
    ctx.stroke();

    // Mouth Reaction
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    if (stateStyle === 'PANICKED') {
        ctx.fillStyle = '#800c0c';
        ctx.beginPath();
        ctx.arc(tx, headY + 8, 5.5 + Math.sin(Date.now() * 0.04) * 2, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        
        ctx.font = 'bold 9px "Comic Sans MS", Arial, sans-serif';
        drawRoundedRect(tx + 28, headY - 35, 62, 16, 4, '#fff', '#e74c3c', 1.5);
        ctx.fillStyle = '#e74c3c';
        ctx.fillText("QUIET!!!", tx + 59, headY - 27);
    } else if (stateStyle === 'STRESSED') {
        ctx.beginPath();
        ctx.moveTo(tx - 6, headY + 8);
        ctx.lineTo(tx + 6, headY + 8);
        ctx.stroke();

        const sweatY = headY - 4 + (Date.now() * 0.04) % 15;
        if (sweatY < headY + 14) {
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.moveTo(tx - 18, sweatY);
            ctx.lineTo(tx - 20, sweatY + 3);
            ctx.lineTo(tx - 16, sweatY + 3);
            ctx.closePath();
            ctx.fill();
        }
    } else {
        ctx.beginPath();
        ctx.arc(tx, headY + 6, 5, 0, Math.PI);
        ctx.stroke();
    }

    ctx.restore();
}

// --- CARTOON DUST-CLOUD FIGHT GAMEPLAY ---

function drawFightCloud(studentA, studentB) {
    const midX = (studentA.currentX + studentB.currentX) / 2;
    const midY = (studentA.currentY + studentB.currentY) / 2;

    ctx.save();
    
    const t = Date.now() * 0.012;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
        const ang = t + (i / 6) * Math.PI * 2;
        const len = 34 + Math.sin(t * 3.5 + i) * 6;
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX + Math.cos(ang) * len, midY + Math.sin(ang) * len);
        ctx.stroke();
    }

    ctx.fillStyle = '#ecf0f1';
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const dist = 16 + Math.sin(t * 2.2 + i) * 5;
        const cx = midX + Math.cos(ang) * dist;
        const cy = midY + Math.sin(ang) * dist;
        ctx.beginPath();
        ctx.arc(cx, cy, 21, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
    }

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("💥", midX + Math.sin(t) * 18, midY + Math.cos(t) * 18);
    ctx.fillText("💨", midX + Math.cos(t * 1.4) * 22, midY + Math.sin(t * 1.4) * 22);
    ctx.fillText("⭐", midX + Math.sin(t * 1.8) * 24, midY - Math.cos(t * 1.8) * 24);
    ctx.fillText("⚔️", midX - Math.cos(t * 2) * 20, midY + Math.sin(t * 2) * 20);

    ctx.fillStyle = studentA.bodyColor;
    ctx.beginPath();
    ctx.arc(midX - 22 + Math.sin(t * 3.8) * 4, midY + 8 + Math.cos(t * 3.8) * 4, 5.5, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = studentB.bodyColor;
    ctx.beginPath();
    ctx.arc(midX + 22 + Math.cos(t * 4.2) * 4, midY - 10 + Math.sin(t * 4.2) * 4, 5.5, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    const boxY = midY - 44 + Math.sin(Date.now() * 0.008) * 2.5;
    drawRoundedRect(midX - 16, boxY - 13, 32, 21, 5, '#e74c3c', '#ffffff', 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText("FIGHT", midX, boxY + 1.5);

    ctx.restore();
}

function drawStudent(student) {
    const x = student.currentX;
    const y = student.currentY;

    if (student.state === 'FIGHTING') {
        if (student.id < student.targetStudentId) {
            const partner = state.students.find(s => s.id === student.targetStudentId);
            if (partner) {
                drawFightCloud(student, partner);
            }
        }
        return; 
    }

    if (student.state !== 'STANDING') {
        drawRoundedRect(x - 22, y + 10, 44, 25, 6, '#7e5109', '#513405', 2.5);
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 15, y + 30); ctx.lineTo(x - 15, y + 42);
        ctx.moveTo(x + 15, y + 30); ctx.lineTo(x + 15, y + 42);
        ctx.stroke();
    }

    ctx.fillStyle = student.bodyColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 18, y + 40);
    ctx.quadraticCurveTo(x, y + 12, x + 18, y + 40);
    ctx.lineTo(x + 12, y + 48);
    ctx.lineTo(x - 12, y + 48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffdbac';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    if (student.state === 'DISTRACTED' && student.expressionState === 'PHONE') {
        ctx.beginPath();
        ctx.arc(x - 6, y + 32, 4.5, 0, Math.PI * 2);
        ctx.arc(x + 6, y + 32, 4.5, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        drawRoundedRect(x - 8, y + 23, 16, 9, 1.5, '#34495e', '#2c3e50', 1);

        const glow = ctx.createRadialGradient(x, y + 25, 2, x, y + 25, 14);
        glow.addColorStop(0, 'rgba(52, 152, 219, 0.7)');
        glow.addColorStop(1, 'rgba(52, 152, 219, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y + 25, 14, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(x - 11, y + 39, 4, 0, Math.PI * 2);
        ctx.arc(x + 11, y + 39, 4, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
    }

    let bobbing = 0;
    if (student.state === 'STANDING') {
        bobbing = Math.sin(Date.now() * 0.01) * 2.5;
    } else if (student.state === 'TALKING') {
        bobbing = Math.sin(Date.now() * 0.02) * 1.5;
    }
    const headX = x;
    const headY = y + 5 + bobbing;
    drawWobblyCircle(headX, headY, 17, '#ffdbac', '#000000', 3);

    drawHairstyle(headX, headY, student.hairStyle);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    const spacing = 5.5;
    const eyeHeight = headY - 2;

    if (student.isBlinking) {
        ctx.beginPath();
        ctx.moveTo(headX - spacing - 4, eyeHeight); ctx.lineTo(headX - spacing + 4, eyeHeight);
        ctx.moveTo(headX + spacing - 4, eyeHeight); ctx.lineTo(headX + spacing + 4, eyeHeight);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(headX - spacing, eyeHeight, 3.8, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.arc(headX + spacing, eyeHeight, 3.8, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#000000';
        let lookX = 0;
        let lookY = 1.2;
        if (student.state === 'TALKING') {
            lookX = (student.id % 2 === 0) ? 1.5 : -1.5;
            lookY = 0;
        } else if (student.expressionState === 'PHONE') {
            lookX = 0; lookY = 2.0;
        }
        ctx.beginPath();
        ctx.arc(headX - spacing + lookX, eyeHeight + lookY, 1.5, 0, Math.PI * 2);
        ctx.arc(headX + spacing + lookX, eyeHeight + lookY, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.lineWidth = 2;
    if (student.expressionState === 'ANGRY' || student.state === 'THROWING') {
        ctx.beginPath();
        ctx.moveTo(headX - spacing - 4, eyeHeight - 5); ctx.lineTo(headX - spacing + 3, eyeHeight - 3);
        ctx.moveTo(headX + spacing + 4, eyeHeight - 5); ctx.lineTo(headX + spacing - 3, eyeHeight - 3);
        ctx.stroke();
    } else if (student.expressionState === 'HAPPY' || student.state === 'QUIETED') {
        ctx.beginPath();
        ctx.arc(headX - spacing, eyeHeight - 3, 2.5, Math.PI, 0);
        ctx.arc(headX + spacing, eyeHeight - 3, 2.5, Math.PI, 0);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(headX - spacing - 4, eyeHeight - 4); ctx.lineTo(headX - spacing + 3, eyeHeight - 4);
        ctx.moveTo(headX + spacing - 3, eyeHeight - 4); ctx.lineTo(headX + spacing + 4, eyeHeight - 4);
        ctx.stroke();
    }

    const mouthHeight = headY + 7;
    ctx.lineWidth = 2.5;
    if (student.state === 'TALKING') {
        const oScale = 3.5 + Math.sin(Date.now() * 0.04) * 1.5;
        ctx.fillStyle = '#800c0c';
        ctx.beginPath();
        ctx.arc(headX, mouthHeight, oScale, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
    } else if (student.expressionState === 'HAPPY' || student.state === 'QUIETED') {
        ctx.beginPath();
        ctx.arc(headX, mouthHeight - 2, 4.5, 0, Math.PI);
        ctx.stroke();
    } else if (student.expressionState === 'PHONE' || student.expressionState === 'ANGRY') {
        ctx.beginPath();
        ctx.moveTo(headX - 4, mouthHeight); ctx.quadraticCurveTo(headX, mouthHeight - 3, headX + 4, mouthHeight);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(headX - 5, mouthHeight); ctx.lineTo(headX + 5, mouthHeight);
        ctx.stroke();
    }

    if (student.state !== 'ATTENTIVE' && student.state !== 'QUIETED') {
        let badge = '';
        if (student.state === 'TALKING') badge = '🗣️';
        else if (student.state === 'STANDING') badge = '🏃';
        else if (student.state === 'DISTRACTED') badge = '📱';
        else if (student.state === 'THROWING') badge = '🎒';

        if (badge) {
            const bY = headY - 36 + Math.sin(Date.now() * 0.008) * 2.5;
            drawRoundedRect(headX - 16, bY - 14, 32, 23, 5, '#fff', '#e74c3c', 2);
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(badge, headX, bY + 3);
        }
    } else if (student.state === 'QUIETED') {
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(headX, headY - 24 + Math.sin(Date.now() * 0.01) * 1.5, 9, 3, 0, 0, Math.PI*2);
        ctx.stroke();
    }

    if (student.state === 'TALKING' && student.talkingText) {
        ctx.font = 'bold 12px "Comic Sans MS", Arial, sans-serif';
        const str = student.talkingText;
        const metrics = ctx.measureText(str);
        const padX = 12;
        const padY = 7;
        const bW = metrics.width + padX * 2;
        const bH = 18 + padY * 2;
        const bx = headX - bW / 2;
        const by = headY - 72 + Math.sin(Date.now() * 0.005) * 2;

        drawRoundedRect(bx, by, bW, bH, 10, '#ffffff', '#2c3e50', 2.5);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(headX - 7, by + bH - 1.5);
        ctx.lineTo(headX, by + bH + 8);
        ctx.lineTo(headX + 7, by + bH - 1.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX - 6, by + bH - 3, 12, 4);

        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(str, headX, by + bH / 2);
    }
}

// --- RADIAL ACTION MENU ---

function drawRadialMenu(student) {
    const rx = student.currentX;
    const ry = student.currentY - 15;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.arc(rx, ry, RADIAL_RADIUS + 25, 0, Math.PI * 2);
    ctx.fill();

    state.hoveredRadialActionId = '';

    RADIAL_ACTIONS.forEach(action => {
        const btnX = rx + Math.cos(action.angle) * RADIAL_RADIUS;
        const btnY = ry + Math.sin(action.angle) * RADIAL_RADIUS;

        const dx = state.mouseX - btnX;
        const dy = state.mouseY - btnY;
        const hovered = Math.sqrt(dx * dx + dy * dy) < RADIAL_BTN_SIZE;

        if (hovered) {
            state.hoveredRadialActionId = action.id;
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(btnX, btnY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(btnX, btnY, RADIAL_BTN_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = hovered ? action.hoverColor : action.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(action.icon, btnX, btnY + 1);

        if (hovered) {
            ctx.font = 'bold 12px "Comic Sans MS", Arial, sans-serif';
            const labelW = ctx.measureText(action.label).width + 12;
            const tY = btnY < ry ? btnY - 24 : btnY + 24;
            drawRoundedRect(btnX - labelW/2, tY - 10, labelW, 20, 5, '#2c3e50', '#ffffff', 1.5);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(action.label, btnX, tY);
        }
    });

    ctx.font = '11px "Comic Sans MS", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText("Click classroom to close", rx, ry + RADIAL_RADIUS + 30);
}

// --- HUD AND USER INTERFACE OVERLAYS ---

function drawHUD() {
    const x = 150, y = 556, w = 500, h = 24;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    drawRoundedRect(120, 542, 560, 48, 10, 'rgba(0,0,0,0.65)');

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText("CHAOS METER:", x - 10, y + h / 2);

    drawRoundedRect(x, y, w, h, 6, '#2c3e50', '#ffffff', 2);

    if (state.chaosMeter > 0) {
        const fillW = state.chaosMeter * w;
        const grad = ctx.createLinearGradient(x, y, x + fillW, y);
        grad.addColorStop(0, '#f1c40f');
        grad.addColorStop(0.5, '#e67e22');
        grad.addColorStop(1, '#e74c3c');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + 6, y);
        ctx.lineTo(x + fillW, y);
        ctx.lineTo(x + fillW, y + h);
        ctx.lineTo(x + 6, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - 6);
        ctx.lineTo(x, y + 6);
        ctx.quadraticCurveTo(x, y, x + 6, y);
        ctx.clip();

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, fillW, h);

        if (state.chaosMeter > 0.5) {
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            const drift = (Date.now() * 0.04) % 30;
            for (let s = x - 30 + drift; s < x + fillW; s += 30) {
                ctx.beginPath();
                ctx.moveTo(s, y);
                ctx.lineTo(s + 12, y);
                ctx.lineTo(s - 3, y + h);
                ctx.lineTo(s - 15, y + h);
                ctx.closePath();
                ctx.fill();
            }
        }
        ctx.restore();
    }

    // --- LEGIBILITY FIX: High Contrast outline on HUD Text ---
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 12px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(Math.round(state.chaosMeter * 100) + "%", x + w/2, y + h/2);
    ctx.fillText(Math.round(state.chaosMeter * 100) + "%", x + w/2, y + h/2);
    ctx.restore();

    const cx = 745, cy = 55, r = 24;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * (r - 4), cy + Math.sin(ang) * (r - 4));
        ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
        ctx.stroke();
    }

    const maxTime = 60.0;
    const ratio = state.classTimer / maxTime;
    const clockAng = -Math.PI / 2 + (ratio * Math.PI * 2);

    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 11);
    ctx.stroke();

    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(clockAng) * 16, cy + Math.sin(clockAng) * 16);
    ctx.stroke();

    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI*2);
    ctx.fill();
}

function drawMainMenuScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.84)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tilt = Math.sin(Date.now() * 0.003) * 10;
    ctx.save();
    ctx.translate(canvas.width / 2, 160 + tilt);
    ctx.rotate(Math.sin(Date.now() * 0.001) * 0.03);

    ctx.font = 'bold 50px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#000000';
    ctx.fillText("CARTOON CLASSROOM", 0, 4);
    ctx.fillText("CHAOS!", 0, 64);
    ctx.fillText("CARTOON CLASSROOM", 4, 0);
    ctx.fillText("CHAOS!", 4, 60);

    ctx.fillStyle = '#f1c40f';
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 4;
    ctx.fillText("CARTOON CLASSROOM", 0, 0);
    ctx.strokeText("CARTOON CLASSROOM", 0, 0);

    ctx.fillStyle = '#e74c3c';
    ctx.strokeStyle = '#c0392b';
    ctx.fillText("CHAOS!", 0, 60);
    ctx.strokeText("CHAOS!", 0, 60);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '15px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Correct student behavior before chaos hits 100%. Watch out for erupting fights!", canvas.width / 2, 280);

    ctx.font = '12px "Comic Sans MS", Arial, sans-serif';
    ctx.fillStyle = '#1abc9c';
    ctx.fillText("🗣️ QUIET (Talking) • 🪑 SIT DOWN (Standing) • 🎒 CONFISCATE (Phone/Throwing) • ↔️ SEPARATE (Fights/Wandering)", canvas.width / 2, 305);

    // Difficulty Box
    ctx.fillStyle = '#2c3e50';
    drawRoundedRect(160, 335, 480, 70, 10, '#2c3e50', '#7f8c8d', 2);

    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 12px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("CHOOSE DIFFICULTY TIER:", canvas.width / 2, 348);

    // --- REBALANCED 4-LEVEL LAYOUT SELECTION ---
    const options = [
        { id: 'EASY', label: 'EASY 🍼', x: 176, color: '#2ecc71', hoverColor: '#27ae60' },
        { id: 'NORMAL', label: 'NORMAL 👦', x: 292, color: '#3498db', hoverColor: '#2980b9' },
        { id: 'MEDIUM', label: 'MEDIUM 🔥', x: 408, color: '#f1c40f', hoverColor: '#f39c12' },
        { id: 'HARD', label: 'HARD 💀', x: 524, color: '#e74c3c', hoverColor: '#c0392b' }
    ];

    options.forEach(o => {
        const isSelected = state.difficulty === o.id;
        const hovered = state.mouseX >= o.x && state.mouseX <= o.x + 100 && state.mouseY >= 360 && state.mouseY <= 395;

        ctx.save();
        if (isSelected) {
            ctx.shadowColor = o.color;
            ctx.shadowBlur = 12;
            drawRoundedRect(o.x - 2, 358, 104, 39, 6, '#ffffff');
        }
        drawRoundedRect(o.x, 360, 100, 35, 5, hovered ? o.hoverColor : o.color, '#ffffff', 2);
        ctx.restore();

        ctx.fillStyle = isSelected ? '#2c3e50' : '#ffffff';
        ctx.font = 'bold 12px "Comic Sans MS", Arial, sans-serif';
        ctx.fillText(o.label, o.x + 50, 378);
    });

    const triggerHovered = state.mouseX >= 300 && state.mouseX <= 500 && state.mouseY >= 440 && state.mouseY <= 500;
    drawRoundedRect(300, 440, 200, 60, 12, triggerHovered ? '#16a085' : '#1abc9c', '#ffffff', 3.5);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("START CLASS", 400, 474);
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(192, 57, 43, 0.88)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const wobble = Math.sin(Date.now() * 0.005) * 8;
    ctx.font = 'bold 46px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#000000';
    ctx.fillText("CLASSROOM CHAOS! 🤯", canvas.width / 2 + 3, 200 + wobble + 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillText("CLASSROOM CHAOS! 🤯", canvas.width / 2, 200 + wobble);

    ctx.font = '16px "Comic Sans MS", Arial, sans-serif';
    ctx.fillStyle = '#f8f9f9';
    ctx.fillText("The noise got out of hand. The Principal suspended you!", canvas.width / 2, 270);

    ctx.font = '14px "Comic Sans MS", Arial, sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`Difficulty: ${state.difficulty}`, canvas.width / 2, 310);

    const retryHover = state.mouseX >= 300 && state.mouseX <= 500 && state.mouseY >= 450 && state.mouseY <= 500;
    drawRoundedRect(300, 450, 200, 50, 10, retryHover ? '#7f8c8d' : '#95a5a6', '#ffffff', 3.5);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("MAIN MENU", 400, 480);
}

function drawVictoryScreen() {
    ctx.fillStyle = 'rgba(39, 174, 96, 0.90)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < 8; i++) {
        const sx = canvas.width / 2 + Math.cos(Date.now() * 0.001 + i) * 190;
        const sy = 240 + Math.sin(Date.now() * 0.0012 + i * 1.5) * 75;
        ctx.beginPath();
        ctx.arc(sx, sy, 6 + i, 0, Math.PI * 2);
        ctx.fill();
    }

    const slide = Math.sin(Date.now() * 0.004) * 6;
    ctx.font = 'bold 44px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#114a22';
    ctx.fillText("CLASS DISMISSED! 🔔🎉", canvas.width / 2 + 3, 180 + slide + 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillText("CLASS DISMISSED! 🔔🎉", canvas.width / 2, 180 + slide);

    ctx.font = '16px "Comic Sans MS", Arial, sans-serif';
    ctx.fillStyle = '#f4f6f7';
    ctx.fillText("Awesome job! You kept the students under control until the recess bell!", canvas.width / 2, 235);

    const baseVal = 2500;
    const silentBonus = Math.floor((1.0 - state.chaosMeter) * 2500);
    const bonusMulti = state.difficulty === 'HARD' ? 2.0 : state.difficulty === 'MEDIUM' ? 1.0 : state.difficulty === 'NORMAL' ? 0.75 : 0.5;
    const finalVal = Math.floor((baseVal + silentBonus) * bonusMulti);

    drawRoundedRect(250, 270, 300, 145, 10, 'rgba(0,0,0,0.25)', '#ffffff', 2);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 13px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("TEACHING PERFORMANCE CARD", 400, 295);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText(`Surviving Base Value: +${baseVal}`, 400, 320);
    ctx.fillText(`Quietness Bonus (${Math.round((1.0 - state.chaosMeter)*100)}%): +${silentBonus}`, 400, 340);
    ctx.fillText(`Difficulty Multiplier: x${bonusMulti}`, 400, 360);

    ctx.font = 'bold 18px "Comic Sans MS", Arial, sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`TOTAL SCORE: ${finalVal} PTS`, 400, 393);

    const restartHover = state.mouseX >= 300 && state.mouseX <= 500 && state.mouseY >= 450 && state.mouseY <= 500;
    drawRoundedRect(300, 450, 200, 50, 10, restartHover ? '#16a085' : '#1abc9c', '#ffffff', 3.5);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("PLAY AGAIN", 400, 480);
}

// --- CURSOR / POSITION GETTERS ---

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

// --- CLICK INTERACT HANDLERS ---

function handleCanvasClick(e) {
    initAudio();

    const pos = getMousePos(e);
    const mx = pos.x;
    const my = pos.y;

    if (state.gameState === 'MAIN_MENU') {
        playSound('click');

        // Click coordinates for 4-tier difficulty selection
        if (my >= 360 && my <= 395) {
            if (mx >= 176 && mx <= 276) {
                state.difficulty = 'EASY';
            } else if (mx >= 292 && mx <= 392) {
                state.difficulty = 'NORMAL';
            } else if (mx >= 408 && mx <= 508) {
                state.difficulty = 'MEDIUM';
            } else if (mx >= 524 && mx <= 624) {
                state.difficulty = 'HARD';
            }
        }

        if (mx >= 300 && mx <= 500 && my >= 440 && my <= 500) {
            resetGame();
            state.gameState = 'PLAYING';
            playSound('bell');
        }
    } 
    else if (state.gameState === 'GAME_OVER' || state.gameState === 'VICTORY') {
        playSound('click');
        if (mx >= 300 && mx <= 500 && my >= 450 && my <= 500) {
            state.gameState = 'MAIN_MENU';
        }
    } 
    else if (state.gameState === 'PLAYING') {
        if (state.selectedStudentId !== -1) {
            const student = state.students.find(s => s.id === state.selectedStudentId);
            if (student) {
                const rx = student.currentX;
                const ry = student.currentY - 15;

                let actionClicked = null;
                for (let action of RADIAL_ACTIONS) {
                    const btnX = rx + Math.cos(action.angle) * RADIAL_RADIUS;
                    const btnY = ry + Math.sin(action.angle) * RADIAL_RADIUS;
                    const dx = mx - btnX;
                    const dy = my - btnY;
                    if (Math.sqrt(dx * dx + dy * dy) < RADIAL_BTN_SIZE) {
                        actionClicked = action;
                        break;
                    }
                }

                if (actionClicked) {
                    handleRadialAction(student, actionClicked);
                    state.selectedStudentId = -1;
                    return;
                }
            }
            state.selectedStudentId = -1;
            playSound('click');
        } else {
            let hitStudent = null;
            for (let student of state.students) {
                const dx = mx - student.currentX;
                const dy = my - student.currentY;
                if (Math.sqrt(dx * dx + dy * dy) < 28) {
                    hitStudent = student;
                    break;
                }
            }

            if (hitStudent) {
                state.selectedStudentId = hitStudent.id;
                playSound('click');
            }
        }
    }
}

function handleCanvasMouseMove(e) {
    const pos = getMousePos(e);
    state.mouseX = pos.x;
    state.mouseY = pos.y;
}

// --- INTERVENTION LOGIC ---

function handleRadialAction(student, action) {
    let success = false;
    let text = '';
    let redChance = 0.12;

    if (student.state === 'FIGHTING') {
        if (action.id === 'SEPARATE') {
            success = true;
            text = 'Separate! ↔️';
            redChance = 0.20;

            const partner = state.students.find(s => s.id === student.targetStudentId);
            
            student.state = 'QUIETED';
            student.stateTimer = 8.0;
            student.expressionState = 'HAPPY';
            student.currentX = student.homeX;
            student.currentY = student.homeY;

            if (partner) {
                partner.state = 'QUIETED';
                partner.stateTimer = 8.0;
                partner.expressionState = 'HAPPY';
                partner.currentX = partner.homeX;
                partner.currentY = partner.homeY;
            }
        } else {
            text = 'Break it up! 💥';
        }
    } 
    else {
        if (action.id === 'QUIET') {
            if (student.state === 'TALKING') {
                success = true;
                text = 'Quiet! 🤫';
                redChance = 0.12;
                student.state = 'QUIETED';
                student.stateTimer = 9.0;
                student.expressionState = 'HAPPY';
                student.talkingText = '';
            } else {
                text = 'Not talking! 🤷';
            }
        } 
        else if (action.id === 'SIT') {
            if (student.state === 'STANDING') {
                success = true;
                text = 'Seated! 🪑';
                redChance = 0.16;
                student.state = 'QUIETED';
                student.stateTimer = 7.0;
                student.expressionState = 'HAPPY';
                student.targetX = student.homeX;
                student.targetY = student.homeY;
            } else {
                text = 'Already sitting! 🤨';
            }
        } 
        // --- UPDATED GAMEPLAY MECHANIC: Confiscate works on throwing students too ---
        else if (action.id === 'CONFISCATE') {
            if (student.state === 'DISTRACTED' || student.state === 'THROWING') {
                success = true;
                text = 'Confiscated! 🎒';
                redChance = 0.18;
                student.state = 'QUIETED';
                student.stateTimer = 6.0;
                student.expressionState = 'BORED';
            } else {
                text = 'Nothing to take! 🙅';
            }
        } 
        else if (action.id === 'SEPARATE') {
            if (student.state === 'STANDING' || student.state === 'TALKING') {
                success = true;
                text = 'Separated! ↔️';
                redChance = 0.10;
                student.state = 'QUIETED';
                student.stateTimer = 11.0;
                student.expressionState = 'BORED';
                student.currentX = student.homeX;
                student.currentY = student.homeY;
                student.talkingText = '';
            } else {
                text = 'No need! 😒';
            }
        }
    }

    if (success) {
        playSound('success');
        state.chaosMeter = Math.max(0.0, state.chaosMeter - redChance);
        spawnFloatingText(student.currentX, student.currentY - 32, text, '#2ecc71');
        spawnFloatingText(student.currentX, student.currentY - 16, `-${Math.round(redChance * 100)}% Chaos`, '#2ecc71');
    } else {
        playSound('fail');
        state.chaosMeter = Math.min(1.0, state.chaosMeter + 0.05);
        spawnFloatingText(student.currentX, student.currentY - 32, text, '#e74c3c');
        state.screenShake = 3.5;
    }
}

// --- STATE LOOPS ---

function update(dt) {
    if (state.gameState !== 'PLAYING') return;

    if (state.screenShake > 0) {
        state.screenShake -= dt * 9;
        if (state.screenShake < 0) state.screenShake = 0;
    }

    state.classTimer -= dt;
    if (state.classTimer <= 0) {
        state.classTimer = 0;
        state.gameState = 'VICTORY';
        playSound('bell');
        return;
    }

    state.aiTimer += dt;
    
    // --- BALANCED 4-TIER DIFFICULTY SPEED AND TIMING CONFIGS ---
    let threshold = 1.8;
    let speedMulti = 0.9;
    let allowFights = false;
    let fightRate = 0.0;

    if (state.difficulty === 'EASY') {
        threshold = 3.2;         // Relaxed spacing
        speedMulti = 0.45;       // Minor chaos multiplier
        allowFights = false;     // Fights turned off for Easy
    } else if (state.difficulty === 'NORMAL') {
        threshold = 2.3;         // Friendly starter pace
        speedMulti = 0.75;       // Low pressure
        allowFights = true;
        fightRate = 0.08;        // Rare fights (8% chance)
    } else if (state.difficulty === 'MEDIUM') {
        threshold = 1.7;         // Standard simulation speed
        speedMulti = 1.0;        // Moderate chaos rate
        allowFights = true;
        fightRate = 0.16;        // Standard fights (16% chance)
    } else if (state.difficulty === 'HARD') {
        threshold = 1.25;        // Demanding pace
        speedMulti = 1.35;       // Veteran intensity
        allowFights = true;
        fightRate = 0.26;        // Normal fight rate (26% chance)
    }

    if (state.aiTimer >= threshold) {
        state.aiTimer = 0.0;
        const candidates = state.students.filter(s => s.state === 'ATTENTIVE');
        if (candidates.length > 0) {
            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            const act = Math.random();

            const isFightingCurrently = state.students.some(s => s.state === 'FIGHTING');
            if (allowFights && act < fightRate && !isFightingCurrently) {
                const neighbors = candidates.filter(s => s.id !== chosen.id && Math.abs(s.id - chosen.id) === 1);
                if (neighbors.length > 0) {
                    const partner = neighbors[Math.floor(Math.random() * neighbors.length)];
                    
                    chosen.state = 'FIGHTING';
                    chosen.stateTimer = 15.0;
                    chosen.targetStudentId = partner.id;

                    partner.state = 'FIGHTING';
                    partner.stateTimer = 15.0;
                    partner.targetStudentId = chosen.id;
                    
                    spawnFloatingText((chosen.homeX + partner.homeX)/2, (chosen.homeY + partner.homeY)/2 - 10, "FIGHT OUTBREAK!", "#e74c3c");
                    state.screenShake = 5.0;
                    playSound('splat');
                }
            } 
            else if (act < 0.35) {
                chosen.state = 'TALKING';
                chosen.stateTimer = Math.random() * 4.5 + 4;
                chosen.talkingText = TALKING_COMMENTS[Math.floor(Math.random() * TALKING_COMMENTS.length)];
                chosen.expressionState = 'ANGRY';
            } else if (act < 0.65) {
                chosen.state = 'STANDING';
                chosen.stateTimer = Math.random() * 5 + 5;
                chosen.targetX = chosen.homeX + (Math.random() * 120 - 60);
                chosen.targetY = chosen.homeY + (Math.random() * 80 - 40);
                chosen.targetX = Math.max(90, Math.min(710, chosen.targetX));
                chosen.targetY = Math.max(180, Math.min(490, chosen.targetY));
                chosen.expressionState = 'HAPPY';
            } else if (act < 0.85) {
                chosen.state = 'DISTRACTED';
                chosen.stateTimer = Math.random() * 6 + 4;
                chosen.expressionState = 'PHONE';
            } else {
                const victims = state.students.filter(s => s.id !== chosen.id && s.state !== 'FIGHTING');
                if (victims.length > 0) {
                    chosen.state = 'THROWING';
                    chosen.stateTimer = 2.0; // Slightly elongated wind-up window
                    chosen.targetStudentId = victims[Math.floor(Math.random() * victims.length)].id;
                    chosen.expressionState = 'ANGRY';
                }
            }
        }
    }

    state.students.forEach(student => {
        student.blinkTimer -= dt;
        if (student.blinkTimer <= 0) {
            if (student.isBlinking) {
                student.isBlinking = false;
                student.blinkTimer = Math.random() * 3.5 + 1.5;
            } else {
                student.isBlinking = true;
                student.blinkTimer = 0.15;
            }
        }

        if (student.stateTimer > 0) {
            student.stateTimer -= dt;
            if (student.stateTimer <= 0) {
                if (student.state === 'THROWING') {
                    const victim = state.students.find(s => s.id === student.targetStudentId);
                    if (victim && victim.state !== 'FIGHTING') {
                        playSound('throw');
                        const dx = victim.currentX - student.currentX;
                        const dy = victim.currentY - student.currentY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const vScale = 6.2;
                        state.projectiles.push({
                            x: student.currentX,
                            y: student.currentY - 15,
                            vx: (dx / dist) * vScale,
                            vy: (dy / dist) * vScale,
                            targetX: victim.currentX,
                            targetY: victim.currentY - 15,
                            targetId: victim.id,
                            type: Math.random() > 0.5 ? 'PAPER_AIRPLANE' : 'SPITBALL',
                            angle: Math.atan2(dy, dx)
                        });
                    }
                    student.state = 'ATTENTIVE';
                    student.expressionState = 'BORED';
                } else if (student.state === 'FIGHTING') {
                    student.state = 'ATTENTIVE';
                    student.expressionState = 'BORED';
                    student.currentX = student.homeX;
                    student.currentY = student.homeY;
                } else {
                    student.state = 'ATTENTIVE';
                    student.expressionState = 'BORED';
                }
            }
        }

        if (student.state === 'FIGHTING') {
            const partner = state.students.find(s => s.id === student.targetStudentId);
            if (partner) {
                const midX = (student.homeX + partner.homeX) / 2;
                const midY = (student.homeY + partner.homeY) / 2;
                const dx = midX - student.currentX;
                const dy = midY - student.currentY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 5) {
                    student.currentX += (dx / dist) * 3.5;
                    student.currentY += (dy / dist) * 3.5;
                } else {
                    student.currentX = midX;
                    student.currentY = midY;
                }
            }
        } else if (student.state === 'STANDING') {
            const dx = student.targetX - student.currentX;
            const dy = student.targetY - student.currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 3) {
                student.currentX += (dx / dist) * 1.6;
                student.currentY += (dy / dist) * 1.6;
            }
        } else if (student.state === 'ATTENTIVE' || student.state === 'QUIETED') {
            const dx = student.homeX - student.currentX;
            const dy = student.homeY - student.currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 3) {
                student.currentX += (dx / dist) * 2.6;
                student.currentY += (dy / dist) * 2.6;
            } else {
                student.currentX = student.homeX;
                student.currentY = student.homeY;
            }
        }

        if (student.state === 'TALKING') {
            state.chaosMeter += 0.00045 * speedMulti;
        } else if (student.state === 'STANDING') {
            state.chaosMeter += 0.0006 * speedMulti;
        } else if (student.state === 'DISTRACTED') {
            state.chaosMeter += 0.0005 * speedMulti;
        } else if (student.state === 'THROWING') {
            state.chaosMeter += 0.0003 * speedMulti;
        } else if (student.state === 'FIGHTING') {
            state.chaosMeter += 0.0011 * speedMulti; 
        }
    });

    if (state.chaosMeter > 1.0) {
        state.chaosMeter = 1.0;
        state.gameState = 'GAME_OVER';
        playSound('fail');
        return;
    }

    // Update Projectiles
    for (let i = 0; i < state.projectiles.length; i++) {
        const p = state.projectiles[i];
        p.x += p.vx;
        p.y += p.vy;

        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < 8) {
            playSound('splat');
            spawnFloatingText(p.targetX, p.targetY - 14, "SPLAT!", "#e74c3c");
            state.screenShake = 4.0;

            const victim = state.students.find(s => s.id === p.targetId);
            if (victim && victim.state !== 'FIGHTING' && (victim.state === 'ATTENTIVE' || victim.state === 'QUIETED')) {
                victim.state = 'DISTRACTED';
                victim.stateTimer = 4.0;
                victim.expressionState = 'ANGRY';
            }

            state.chaosMeter = Math.min(1.0, state.chaosMeter + 0.035 * speedMulti);
            state.projectiles.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < state.floatingTexts.length; i++) {
        const textObj = state.floatingTexts[i];
        textObj.y -= 0.7;
        textObj.life -= dt;
        if (textObj.life <= 0) {
            state.floatingTexts.splice(i, 1);
            i--;
        }
    }
}

function render() {
    ctx.save();

    if (state.screenShake > 0) {
        const dx = (Math.random() - 0.5) * state.screenShake * 2;
        const dy = (Math.random() - 0.5) * state.screenShake * 2;
        ctx.translate(dx, dy);
    }

    // Classroom Flooring
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#e2dfc6';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 120); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 120; y < canvas.height; y += 45) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Blackboard slate wall
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, 120);
    ctx.fillStyle = '#1a252f';
    ctx.fillRect(0, 114, canvas.width, 6);

    drawRoundedRect(90, 15, 620, 85, 4, '#1b4f72', '#8a4c2d', 6);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'bold 15px "Comic Sans MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("MATH CLASS: MULTIPLY CHAOS!", 400, 42);
    ctx.font = '12px "Comic Sans MS", Arial, sans-serif';
    ctx.fillText("2 + 2 = 🐟", 200, 75);
    ctx.fillText("No flying airplanes! 🚫✈️", 400, 75);
    ctx.fillText("Recess Bell: " + Math.max(0, Math.ceil(state.classTimer)) + "s", 600, 75);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 🍎🎒✏️", 15, 12);

    drawRoundedRect(15, 25, 60, 75, 4, '#87ceeb', '#2c3e50', 3);
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.arc(30, 85, 14, 0, Math.PI * 2);
    ctx.arc(45, 80, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 62); ctx.lineTo(75, 62);
    ctx.moveTo(45, 25); ctx.lineTo(45, 100);
    ctx.stroke();

    drawRoundedRect(728, 12, 54, 105, 4, '#8a4c2d', '#2c3e50', 3.5);
    ctx.beginPath();
    ctx.arc(738, 65, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f1c40f';
    ctx.fill(); ctx.stroke();

    drawTeacher();

    // Render Desks
    const colSpacing = 135;
    const startX = 130;
    const row1Y = 240;
    const row2Y = 390;

    for (let i = 0; i < 10; i++) {
        const isRow2 = i >= 5;
        const colIndex = i % 5;
        const hX = startX + (colIndex * colSpacing);
        const hY = isRow2 ? row2Y : row1Y;
        drawDesk(hX, hY);
    }

    // Render Students sorted by currentY
    const sorted = [...state.students].sort((a, b) => a.currentY - b.currentY);
    sorted.forEach(student => {
        drawStudent(student);
    });

    // Projectiles
    state.projectiles.forEach(p => {
        if (p.type === 'PAPER_AIRPLANE') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(11, 0);
            ctx.lineTo(-7, -5);
            ctx.lineTo(-3, 0);
            ctx.lineTo(-7, 5);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(11, 0);
            ctx.lineTo(-3, 0);
            ctx.stroke();
            ctx.restore();
        } else {
            drawWobblyCircle(p.x, p.y, 4, '#bdc3c7', '#7f8c8d', 1.2);
        }
    });

    // Floating text feedback
    state.floatingTexts.forEach(txt => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, txt.life));
        ctx.fillStyle = txt.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        ctx.font = 'bold 15px "Comic Sans MS", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(txt.text, txt.x, txt.y);
        ctx.fillText(txt.text, txt.x, txt.y);
        ctx.restore();
    });

    if (state.selectedStudentId !== -1) {
        const sel = state.students.find(s => s.id === state.selectedStudentId);
        if (sel) {
            drawRadialMenu(sel);
        }
    }

    drawHUD();

    ctx.restore();

    if (state.gameState === 'MAIN_MENU') {
        drawMainMenuScreen();
    } else if (state.gameState === 'GAME_OVER') {
        drawGameOverScreen();
    } else if (state.gameState === 'VICTORY') {
        drawVictoryScreen();
    }
}

// --- ENGINE RECURSION ---

let lastTime = 0;

function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000.0;
    if (dt > 0.1) dt = 0.1;

    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(loop);
}

canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('mousemove', handleCanvasMouseMove);

resetGame();
requestAnimationFrame(loop);
