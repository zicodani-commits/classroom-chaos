// Distinct cartoon tunic colors
export const TUNIC_COLORS = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', 
    '#33FFF0', '#FFAF33', '#AF33FF', '#33FFAF', '#FF3333'
];

// Funny phrases spoken by distracted students
export const TALKING_COMMENTS = [
    "I like turtles!", "Is it recess yet?", "Look at that bird!",
    "Can I eat my eraser?", "He touched my pencil!", "Blah blah blah!",
    "Why is the sky blue?", "Can I go to the bathroom?", "My dog ate my homework!",
    "Are we there yet?", "Who farted?!"
];

// Radial Menu Constants
export const RADIAL_RADIUS = 55;
export const RADIAL_BTN_SIZE = 19;
export const RADIAL_ACTIONS = [
    { id: 'QUIET', label: 'QUIET', angle: -Math.PI / 2, icon: '🗣️', color: '#3498db', hoverColor: '#2980b9' },
    { id: 'SIT', label: 'SIT DOWN', angle: 0, icon: '🪑', color: '#2ecc71', hoverColor: '#27ae60' },
    { id: 'CONFISCATE', label: 'CONFISCATE', angle: Math.PI / 2, icon: '🎒', color: '#e67e22', hoverColor: '#d35400' },
    { id: 'SEPARATE', label: 'SEPARATE', angle: Math.PI, icon: '↔️', color: '#9b59b6', hoverColor: '#8e44ad' }
];

// Global Game State Container
export const state = {
    gameState: 'MAIN_MENU', // MAIN_MENU, PLAYING, GAME_OVER, VICTORY
    difficulty: 'NORMAL', // EASY, NORMAL, MEDIUM, HARD
    classTimer: 60.0,
    chaosMeter: 0.0,
    selectedStudentId: -1,
    aiTimer: 0.0,
    screenShake: 0.0,
    students: [],
    projectiles: [],
    floatingTexts: [],
    mouseX: 0,
    mouseY: 0,
    hoveredRadialActionId: '',
    isMuted: false
};

// Reinitializes simulation parameters
export function resetGame() {
    state.classTimer = 60.0;
    state.chaosMeter = 0.0;
    state.selectedStudentId = -1;
    state.aiTimer = 0.0;
    state.projectiles = [];
    state.floatingTexts = [];
    state.students = [];

    // Define home desk positions for 2 rows, 5 columns grid
    const colSpacing = 135;
    const startX = 130;
    const row1Y = 240;
    const row2Y = 390;

    for (let i = 0; i < 10; i++) {
        const isRow2 = i >= 5;
        const colIndex = i % 5;
        const hX = startX + (colIndex * colSpacing);
        const hY = isRow2 ? row2Y : row1Y;

        state.students.push({
            id: i,
            bodyColor: TUNIC_COLORS[i],
            hairStyle: i + 1, // 1 through 10
            homeX: hX,
            homeY: hY - 15, // seated slightly behind desk centers
            currentX: hX,
            currentY: hY - 15,
            state: 'ATTENTIVE',
            stateTimer: 0.0,
            targetX: 0.0,
            targetY: 0.0,
            targetStudentId: -1,
            blinkTimer: Math.random() * 3 + 2,
            isBlinking: false,
            expressionState: 'BORED',
            talkingText: ''
        });
    }
}
