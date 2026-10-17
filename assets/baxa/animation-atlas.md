# Baxa animation atlas

Asset: `assets/baxa/animation-atlas.png` (1536×1024, RGBA).

Created using the built-in image generation tool, with Bao's supplied Baxa pose sheet as the character reference. The original reference and graduation photo are not replaced. Source bounds, eye registration and ground alignment are recorded in `index.html` as `ATLAS`; the atlas is cropped at runtime with smoothing disabled. The fixed cardboard box remains canvas-native, separate from the cat.

## Original generation prompt

Use case: stylized-concept. Asset type: production sprite animation atlas for a small pixel-art cat in a website game. Use the attached image ONLY as character reference. Create a clean consistent transparent PNG sprite atlas, exactly 1536 wide by 1024 high, 6 columns and 4 rows, every cell exactly 256x256, no gaps. Draw a true low-resolution 32x32 logical pixel sprite in every cell, enlarged by exactly 8 using nearest neighbor, crisp square pixels, palette limited to charcoal black, dark violet grey highlights, warm cream white, coral pink ears and nose, lime yellow green eyes. Baxa is a fluffy black and white longhair tuxedo cat with large white chest bib, white muzzle, all four white mittens, black long fluffy tail. Keep character proportions and face identical to reference; cute but anatomically consistent, two eyes, four legs, one tail. Do NOT include source labels, logos, hearts, yarn, boxes, z marks, ground, platforms, shadows, glow, outlines around cells, decorations, or any text. Background must genuinely transparent. All paws touching ground must align on the SAME baseline y=224 inside each 256px cell. Keep each complete cat silhouette inside its cell with at least 16px empty padding. Stable body and head position within each animation group; animate only the limbs, ears, eyes, tail as appropriate; no unrelated poses between frames. Cats face RIGHT except the explicitly front-facing and back-facing poses.

ROW 1 six cells left to right: front-facing seated neutral eyes open; same seated pose blinking eyes closed; side-facing right standing neutral; EXACT same side-facing standing blinking; front-facing seated looking slightly upward with eyes open; same upward-looking pose blinking.

ROW 2: four consecutive natural side-view RIGHT-facing walk-cycle frames A B C D, same head position, body length, ground baseline, alternating diagonal legs, subtle tail sway, do not change cat size or head height between frames; transition crouching halfway down from standing into lying; relaxed right-facing lying with head up.

ROW 3: right-facing curled sleeping cat eyes closed; SAME curled sleeping pose with only 1 logical pixel subtle chest breathing; right-facing seated grooming raising right front paw to face; same grooming cat licking that raised paw; same grooming cat lowering front paw slightly, keep torso and head position stable across all three grooming frames; back-facing seated black cat showing small white rump patch.

ROW 4: right-facing playful low crouch with one front paw slightly raised; same playful low crouch reaching that paw forward; same playful low crouch retracting that paw, stable body and tail position; front-facing cat upper body ONLY peeking over an INVISIBLE box rim, show head ears white bib and two white front paws aligned near y=224, NO BOX; identical peeking head blinking; identical peeking head with subtle one-pixel ear movement.

IMPORTANT: clean game-ready atlas, each of the 24 frames occupies exactly its specified grid cell, no labels or checkerboard, alpha transparency. Match the provided cat's identity, white chest/muzzle/paws, green eyes and black fluffy tail.
