# Project Brief: 3D Tic-Tac-Toe Game "Denkmann"

## Overview

"Denkmann" is a 3D variation of Tic-Tac-Toe played on the external faces of a 4x4x4 cube (like a Rubik's Cube). Players take turns placing markers on the outer cubes and aim to align four markers in a row, either horizontally, vertically, or diagonally across any of the faces of the cube. The game ends when a player forms a sequence of four connected markers, called a Gedanke, which declares the winner.

The cube can be rotated and viewed from different angles using mouse or keyboard controls, allowing players to strategize their moves. The game will be browser-based, with plans for potential mobile deployment as a WebApp.

## Game Mechanics

### Game Board

- A 4x4x4 cube where only the external faces are playable. This results in 96 playable mini-cubes out of the total 64 cubes.
- The mini-cubes are numbered from 1 to 16 per face, with A, B, C, D representing layers from top to bottom.
- Example:
  - The top layer (A) has cubes numbered 1A to 16A.
  - The second layer (B) has cubes numbered 1B to 16B, but inner cubes like 6B, 7B, 10B, 11B are non-playable.
- Players can win by connecting four markers in a row on the external faces of the cube. Winning sequences can occur on:
  - Any horizontal or vertical row within a face.
  - Diagonals across a face.
- No moves are allowed within the inner cubes of the cube (e.g., 6B, 7B, 10B, 11B).

### Player Actions

- Players take turns placing a marker (e.g., X or O) on one of the external cubes.
- The game ends when a player achieves a Gedanke (four markers in a line).
- After the game ends, the cube should display the winning line and the game resets.

### Controls

- The cube should be fully rotatable using either:
  - Mouse (click and pan) to rotate the cube in any direction.
  - Keyboard (arrow keys) for simple rotation.
- Players should be able to click on the external cubes to place their marker.

### Interface and UI

- Game name ("Denkmann") displayed at the top of the interface.
- A toggle button to reveal a move history (displayed like chess notation, e.g., 1. 1A, 16A; 2. 2A, 16D).
- A New Game button that resets the board and clears the history after confirmation.
- A simple black background for the game.
- The cube's external faces should be shaded for better visual clarity, and the mini-cubes should appear suspended with visible gaps between them for a clean, modern 3D look.
- Responsive design to ensure the interface works well on different screen sizes.

## Technical Architecture

### Game Engine:

- WebGL using Three.js for 3D rendering (ideal for a lightweight, interactive browser experience).
- Alternatively, Unity WebGL if you want to build using a more robust game engine that could later transition to mobile platforms (Android, iOS).

### Frontend:

- HTML5, CSS3, and JavaScript.
- Use a framework like React for better state management and modularity.
- Three.js or Unity integration for 3D rendering.
- WebSockets for real-time interaction between players in case multiplayer is desired later.

### Backend (optional):

- If multiplayer or move history needs to be persistent across sessions, a lightweight backend using Node.js with Express could be deployed.
- Use MongoDB or PostgreSQL for storing game state, player profiles, and move history if needed.
- Alternatively, you could use Firebase for real-time updates and synchronization between players.

### Mobile/WebApp Conversion:

- Build as a Progressive Web App (PWA) for easy deployment on mobile devices after the browser version is complete.
- Responsive design from the start to make the transition to mobile smoother.
- Consider frameworks like React Native or Flutter for creating a native mobile version if necessary.

## Development Process

### Phase 1: Prototype (Browser)

- Implement basic 3D rendering of the 4x4x4 cube using Three.js.
- Add interaction: Mouse click to place markers on the cube's external faces.
- Implement basic rotation using mouse dragging and keyboard controls.
- Display simple win conditions (4-in-a-row) and allow reset.

### Phase 2: Game Logic

- Implement logic for determining if a Gedanke has been achieved.
- Add move history tracking (chess notation style).
- Introduce simple UI elements (title, history toggle, reset button).

### Phase 3: UX Enhancements

- Improve 3D shading and visual feedback (hover effects, marker placement animation).
- Fine-tune the cube rotation mechanics for smoothness.
- Implement responsive design for mobile compatibility.

### Phase 4: WebApp/Optional Features

- Implement WebApp (PWA) features such as offline support, push notifications for move reminders (in multiplayer).
- Optionally, explore multiplayer capabilities using WebSockets or Firebase.

## Tools & Technologies

### Frontend:
- HTML5, CSS3, JavaScript, React (optional)
- Three.js or Unity WebGL for 3D rendering
- WebSockets or Firebase for multiplayer (if needed)

### Backend (optional):
- Node.js, Express, MongoDB or Firebase

### Mobile/WebApp:
- PWA or native mobile development using React Native or Flutter

## Deployment & Hosting

Vercel or Netlify for quick and easy deployment of the WebApp.
