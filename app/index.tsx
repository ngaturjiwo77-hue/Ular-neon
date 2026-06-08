Action: {"type": "mcp_tool", "tool_name": "mcp_view_bulk", "tool_arguments": {"paths": ["/app/design_guidelines.json", "/app/frontend/app/_layout.tsx", "/app/frontend/app/index.tsx", "/app/frontend/package.json", "/app/frontend/app.json", "/app/frontend/.env", "/app/frontend/src/utils/storage/index.ts"]}}
Observation: ===FILE: /app/design_guidelines.json
/app/design_guidelines.json:
1|{
2|  "theme": "DARK",
3|  "archetype": "7 (Electric & Neon)",
4|  "design_context": "Mobile Game App (Expo React Native)",
5|  "colors": {
6|    "background": {
7|      "primary": "#0A0A0C",
8|      "surface": "#120E1F",
9|      "overlay": "rgba(10, 10, 12, 0.85)"
10|    },
11|    "neon_accents": {
12|      "snake_head": "#00FF66",
13|      "snake_body": "#00CC52",
14|      "food": "#FF007F",
15|      "dpad_idle": "rgba(0, 240, 255, 0.15)",
16|      "dpad_active": "#00F0FF",
17|      "danger": "#FF3333"
18|    },
19|    "text": {
20|      "primary": "#FFFFFF",
21|      "secondary": "#A1A1AA",
22|      "accent": "#00F0FF"
23|    },
24|    "board": {
25|      "grid_line": "rgba(255, 255, 255, 0.03)",
26|      "wall": "#1F1B2E"
27|    }
28|  },
29|  "typography": {
30|    "primary_font": "Outfit, sans-serif",
31|    "number_font": "Azeret Mono, monospace",
32|    "scales": {
33|      "h1": "text-4xl tracking-tighter font-black",
34|      "h2": "text-2xl tracking-tight font-bold",
35|      "body": "text-base font-medium",
36|      "labels": "text-xs tracking-[0.2em] uppercase font-bold"
37|    }
38|  },
39|  "spacing_and_layout": {
40|    "screen_padding": "p-4",
41|    "gap": "gap-4",
42|    "border_radius": {
43|      "sm": "rounded-sm",
44|      "md": "rounded-md",
45|      "full": "rounded-full"
46|    },
47|    "grid": "Aspect ratio 1:1, responsive to screen width minus padding."
48|  },
49|  "components": {
50|    "top_bar": {
51|      "description": "Sticky top bar showing Score (Skor) and High Score (Skor Tertinggi). Use Azeret Mono for numbers.",
52|      "layout": "flex row, justify-between, items-center"
53|    },
54|    "speed_selector": {
55|      "description": "Pill buttons for Lambat, Sedang, Cepat. Active state has neon glow.",
56|      "inactive_style": "border border-[#1F1B2E] text-[#A1A1AA] bg-transparent",
57|      "active_style": "border border-[#00F0FF] text-[#00F0FF] bg-[rgba(0,240,255,0.1)] shadow-[0_0_8px_rgba(0,240,255,0.4)]"
58|    },
59|    "game_board": {
60|      "description": "The main grid area. Dark matte background. Glowing snake body and food.",
61|      "style": "bg-[#120E1F] border border-[#1F1B2E] rounded-md overflow-hidden"
62|    },
63|    "d_pad": {
64|      "description": "On-screen directional pad placed at the bottom. Made of 4 buttons (Up, Down, Left, Right).",
65|      "layout": "Cross layout using flexbox",
66|      "button_style": "w-14 h-14 rounded-full bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] flex items-center justify-center",
67|      "active_button_style": "bg-[rgba(0,240,255,0.4)] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.6)]"
68|    },
69|    "overlays": {
70|      "description": "Pause (Jeda) and Game Over (Permainan Berakhir) screens.",
71|      "style": "Absolute fill, dark translucent background, centered modal box with neon borders."
72|    },
73|    "buttons": {
74|      "primary": "bg-[#00F0FF] text-[#0A0A0C] font-bold py-3 px-6 rounded-md shadow-[0_0_15px_rgba(0,240,255,0.5)]",
75|      "secondary": "border border-[#FF007F] text-[#FF007F] font-bold py-3 px-6 rounded-md shadow-[0_0_10px_rgba(255,0,127,0.3)] bg-[rgba(255,0,127,0.1)]"
76|    }
77|  },
78|  "motion_and_interactions": {
79|    "dpad_feedback": "Scale down slightly and increase opacity/glow on press.",
80|    "snake_movement": "Discrete block-by-block jumps.",
81|    "food_pulse": "Continuous gentle scale pulse to draw attention.",
82|    "game_over": "Red flash on collision, followed by the Game Over overlay fading in."
83|  },
84|  "localization": {
85|    "language": "Indonesian (Bahasa Indonesia)",
86|    "dictionary": {
87|      "score": "Skor",
88|      "high_score": "Skor Tertinggi",
89|      "speed": "Kecepatan",
90|      "slow": "Lambat",
91|      "medium": "Sedang",
92|      "fast": "Cepat",
93|      "pause": "Jeda",
94|      "resume": "Lanjutkan",
95|      "restart": "Ulangi",
96|      "game_over": "Permainan Berakhir",
97|      "play": "Main"
98|    }
99|  },
100|  "image_urls": [
101|    {
102|      "url": "https://images.unsplash.com/photo-1768527858342-037cff722276?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBncmlkJTIwdGV4dHVyZXxlbnwwfHx8fDE3ODA5NDQyMjB8MA&ixlib=rb-4.1.0&q=85",
103|      "category": "background",
104|      "description": "Abstract purple grid pattern with glowing lines. Optional to use as a very low-opacity background behind the main app."
105|    }
106|  ],
107|  "testing": {
108|    "data_testids": [
109|      "dpad-up",
110|      "dpad-down",
111|      "dpad-left",
112|      "dpad-right",
113|      "speed-slow",
114|      "speed-medium",
115|      "speed-fast",
116|      "btn-pause",
117|      "btn-resume",
118|      "btn-restart",
119|      "score-display",
120|      "highscore-display",
121|      "game-board"
122|    ]
123|  },
124|  "instructions_to_main_agent": [
125|    "Build a single-screen React Native application (Expo web/mobile compatible).",
126|    "Implement core game loop using React state or refs for performance.",
127|    "Support both Swipe gestures AND D-Pad on-screen buttons simultaneously.",
128|    "Standardize a logical grid (e.g., 20x20) mapped to the board size.",
129|    "Ensure the visual styling uses 'Electric & Neon' archetype: deep black/indigo backgrounds, bright cyan/green/pink neon accents.",
130|    "Apply data-testid attributes to all interactive elements as listed in the testing section.",
131|    "Ensure all text is translated to Bahasa Indonesia.",
132|    "For neon effects, use shadowColor, shadowOpacity, shadowRadius, and elevation."
133|  ]
134|}

