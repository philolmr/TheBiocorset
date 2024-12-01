# 3D Website Project - BioCorset Showcase

## Overview

This project is a 3D interactive website created using Three.js to illustrate the process of manufacturing a **3D-printed corset** made from **algae-based bioplastic**. The goal is to visually and interactively present the innovation project "BioCorset."

The website can be launched by **right-clicking** on `index.html` and selecting **"Open with Live Server"**.

---

## Features

### 3D Environment

The site presents an immersive 3D environment with various objects that enhance the storytelling of the bioplastic corset creation process. The following elements are present in the 3D scene:

#### Imported GLB Objects
- Rocks
- Shells
- Starfish
- Palm trees
- Boats
- Book

#### Custom STL Objects (Created in Rhino3D)
- Algae
- Sandbank
- Algae powder + container
- Beads
- Acid with beaker and stopper
- Spool
- Corset

---

### Interactivity and Animations

1. **Central Object Interaction:**
   - Clicking on the central object speeds up its rotation.
   - The object transforms to the next stage in the corset manufacturing process:
     - **Algae → Powder → Acid → Beads → Spool → Corset.**

2. **Book Interaction:**
   - Clicking on the book brings it closer to the camera.
   - The book displays explanations about the currently visible object in the manufacturing process.

---

## Challenges Faced

### STL Loading
- Successfully loaded GLB objects, but faced difficulties creating a unified function to handle STL object loading, as objects loaded through a function appeared distorted, with a pixelated or degraded appearance.
  - As a result, STL objects are loaded individually, making the code lengthy.

### Code Organization
- Unable to split the code into multiple files, leading to less structured and harder-to-maintain code.

### Animations
- Faced challenges implementing:
  - The trajectory of the book when clicked.
  - The smooth display of text explanations.

### Water Effect
- Encountered difficulties integrating realistic water effects into the 3D environment.

---

## Technologies Used

- **3D Library:** [Three.js](https://threejs.org/)
- **Modeling Software:** Rhino3D
- **File Formats:** GLB, STL, jpg 
- **Hosting:** Live Server (via VS Code)

---

## How to Use

1. **Launch the Website:**  
   Open `index.html` with Live Server to start the experience.

2. **Explore the Environment:**  
   - Click on the **central object** to see its transformation through the manufacturing steps.  
   - Click on the **book** to learn more about each stage of the process.

3. **Understand the Project:**  
   View the detailed steps of how the BioCorset is created, from raw algae to the final 3D-printed corset.

---

## Future Improvements

- **Optimize STL Loading:** Implement a reusable function for cleaner and more efficient STL object imports.
- **Refactor Code:** Divide the codebase into separate files for better organization and readability.
- **Enhance Animations:** Improve the smoothness of object movements and text displays.
- **Realistic Water:** Integrate more advanced water shaders or effects to enhance the environment's realism.
