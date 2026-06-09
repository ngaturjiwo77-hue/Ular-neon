import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { storage } from "@/src/utils/storage";

// ---------- Theme ----------
const COLORS = {
  bg: "#0A0A0C",
  surface: "#120E1F",
  wall: "#1F1B2E",
  grid: "rgba(255,255,255,0.04)",
  snakeHead: "#00FF66",
  snakeBody: "#00CC52",
  food: "#FF007F",
  cyan: "#00F0FF",
  cyanSoft: "rgba(0,240,255,0.12)",
  cyanBorder: "rgba(0,240,255,0.35)",
  pink: "#FF007F",
  textPrimary: "#FFFFFF",
  textSecondary: "#A1A1AA",
  danger: "#FF3333",
};

// ---------- Game constants ----------
const GRID = 20;
const HIGH_SCORE_KEY = "snake_high_score_v1";

type Direction = "up" | "down" | "left" | "right";
type Status = "idle" | "playing" | "paused" | "over";
type SpeedKey = "lambat" | "sedang" | "cepat";

const SPEED_MS: Record<SpeedKey, number> = {
  lambat: 220,
  sedang: 130,
  cepat: 75,
};

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

type Cell = { x: number; y: number };

const eq = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

const randomFood = (snake: Cell[]): Cell => {
  while (true) {
    const c = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
    if (!snake.some((s) => eq(s, c))) return c;
  }
};

const INITIAL_SNAKE: Cell[] = [
  { x: 8, y: 10 },
  { x: 9, y: 10 },
  { x: 10, y: 10 },
];

export default function Index() {
  const screenW = Dimensions.get("window").width;
  const boardSize = Math.floor(Math.min(screenW - 32, 380));
  const cell = Math.floor(boardSize / GRID);
  const boardPx = cell * GRID;

  const [snake, setSnake] = useState<Cell[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Cell>({ x: 14, y: 10 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [speed, setSpeed] = useState<SpeedKey>("sedang");
  const [activeDir, setActiveDir] = useState<Direction | null>(null);

  const dirRef = useRef<Direction>("right");
  const nextDirRef = useRef<Direction>("right");
  const snakeRef = useRef<Cell[]>(INITIAL_SNAKE);
  const foodRef = useRef<Cell>(food);
  const statusRef = useRef<Status>("idle");
  const scoreRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const v = await storage.getItem<number>(HIGH_SCORE_KEY, 0);
      if (typeof v === "number") setHighScore(v);
    })();
  }, []);

  const clearLoop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const persistHighScore = useCallback(
    async (s: number) => {
      if (s > highScore) {
        setHighScore(s);
        await storage.setItem<number>(HIGH_SCORE_KEY, s);
      }
    },
    [highScore],
  );

  const tick = useCallback(() => {
    if (statusRef.current !== "playing") return;
    const curDir = nextDirRef.current;
    dirRef.current = curDir;

    const head = snakeRef.current[snakeRef.current.length - 1];
    const next: Cell = { x: head.x, y: head.y };
    if (curDir === "up") next.y -= 1;
    else if (curDir === "down") next.y += 1;
    else if (curDir === "left") next.x -= 1;
    else next.x += 1;

    if (next.x < 0 || next.x >= GRID || next.y < 0 || next.y >= GRID) {
      gameOver();
      return;
    }

    const ateFood = eq(next, foodRef.current);
    const body = ateFood
      ? [...snakeRef.current, next]
      : [...snakeRef.current.slice(1), next];

    const bodyExHead = body.slice(0, -1);
    if (bodyExHead.some((c) => eq(c, next))) {
      gameOver();
      return;
    }

    snakeRef.current = body;
    setSnake(body);

    if (ateFood) {
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
      const nf = randomFood(body);
      foodRef.current = nf;
      setFood(nf);
    }
  }, []);

  const startLoop = useCallback(() => {
    clearLoop();
    timerRef.current = setInterval(tick, SPEED_MS[speed]);
  }, [speed, tick]);

  const gameOver = useCallback(() => {
    clearLoop();
    statusRef.current = "over";
    setStatus("over");
    persistHighScore(scoreRef.current);
  }, [persistHighScore]);

  useEffect(() => {
    if (status === "playing") startLoop();
    return () => clearLoop();
  }, [speed, status]);

  const resetGame = useCallback(() => {
    clearLoop();
    const fresh = INITIAL_SNAKE.map((c) => ({ ...c }));
    snakeRef.current = fresh;
    setSnake(fresh);
    dirRef.current = "right";
    nextDirRef.current = "right";
    scoreRef.current = 0;
    setScore(0);
    const nf = randomFood(fresh);
    foodRef.current = nf;
    setFood(nf);
    statusRef.current = "idle";
    setStatus("idle");
  }, []);

  const handleStart = () => {
    if (status === "over") resetGame();
    statusRef.current = "playing";
    setStatus("playing");
  };

  const handlePause = () => {
    if (statusRef.current !== "playing") return;
    statusRef.current = "paused";
    setStatus("paused");
    clearLoop();
  };

  const handleResume = () => {
    statusRef.current = "playing";
    setStatus("playing");
  };

  const handleRestart = () => {
    resetGame();
    statusRef.current = "playing";
    setStatus("playing");
  };

  const setDirection = useCallback((d: Direction) => {
    if (statusRef.current !== "playing") return;
    if (OPPOSITE[dirRef.current] === d || dirRef.current === d) return;
    nextDirRef.current = d;
    setActiveDir(d);
    setTimeout(() => setActiveDir((cur) => (cur === d ? null : cur)), 140);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8,
        onPanResponderRelease: (_, g) => {
          const { dx, dy } = g;
          if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
          if (Math.abs(dx) > Math.abs(dy)) {
            setDirection(dx > 0 ? "right" : "left");
          } else {
            setDirection(dy > 0 ? "down" : "up");
          }
        },
      }),
    [setDirection],
  );

  useEffect(() => () => clearLoop(), []);

  const renderCells = () => {
    const cells: React.ReactNode[] = [];
    snake.forEach((c, i) => {
      const isHead = i === snake.length - 1;
      cells.push(
        <View
          key={`s-${i}`}
          style={[
            styles.cellAbs,
            {
              width: cell - 2,
              height: cell - 2,
              left: c.x * cell + 1,
              top: c.y * cell + 1,
              backgroundColor: isHead ? COLORS.snakeHead : COLORS.snakeBody,
              shadowColor: COLORS.snakeHead,
              shadowOpacity: isHead ? 0.9 : 0.5,
              shadowRadius: isHead ? 8 : 4,
              shadowOffset: { width: 0, height: 0 },
              borderRadius: 3,
            },
          ]}
        />,
      );
    });
    cells.push(
      <View
        key="food"
        style={[
          styles.cellAbs,
          {
            width: cell - 4,
            height: cell - 4,
            left: food.x * cell + 2,
            top: food.y * cell + 2,
            backgroundColor: COLORS.food,
            shadowColor: COLORS.food,
            shadowOpacity: 0.95,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            borderRadius: (cell - 4) / 2,
          },
        ]}
      />,
    );
    return cells;
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.scoreBox} testID="score-display">
            <Text style={styles.scoreLabel}>SKOR</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.brandBox}>
            <Text style={styles.brandText}>ULAR</Text>
            <Text style={styles.brandAccent}>NEON</Text>
          </View>
          <View style={styles.scoreBox} testID="highscore-display">
            <Text style={styles.scoreLabel}>TERTINGGI</Text>
            <Text style={[styles.scoreValue, { color: COLORS.cyan }]}>
              {highScore}
            </Text>
          </View>
        </View>

        <View style={styles.speedRow}>
          <Text style={styles.speedLabel}>KECEPATAN</Text>
          <View style={styles.speedChips}>
            {(["lambat", "sedang", "cepat"] as SpeedKey[]).map((k) => {
              const active = speed === k;
              return (
                <TouchableOpacity
                  key={k}
                  testID={`speed-${k === "lambat" ? "slow" : k === "sedang" ? "medium" : "fast"}`}
                  onPress={() => setSpeed(k)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    active ? styles.chipActive : styles.chipIdle,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? COLORS.cyan : COLORS.textSecondary },
                    ]}
                  >
                    {k === "lambat"
                      ? "Lambat"
                      : k === "sedang"
                        ? "Sedang"
                        : "Cepat"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.boardWrap}>
          <View
            testID="game-board"
            {...panResponder.panHandlers}
            style={[
              styles.board,
              { width: boardPx, height: boardPx },
            ]}
          >
            <View style={StyleSheet.absoluteFill}>
              {Array.from({ length: GRID + 1 }).map((_, i) => (
                <View
                  key={`gh-${i}`}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: i * cell,
                    height: 1,
                    backgroundColor: COLORS.grid,
                  }}
                />
              ))}
              {Array.from({ length: GRID + 1 }).map((_, i) => (
                <View
                  key={`gv-${i}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: i * cell,
                    width: 1,
                    backgroundColor: COLORS.grid,
                  }}
                />
              ))}
            </View>
            {renderCells()}
            {status === "idle" && (
              <View style={styles.overlay} testID="overlay-idle">
                <Text style={styles.overlayTitle}>ULAR NEON</Text>
                <Text style={styles.overlaySub}>
                  Geser layar atau gunakan tombol untuk bermain
                </Text>
                <TouchableOpacity
                  testID="btn-start"
                  onPress={handleStart}
                  activeOpacity={0.85}
                  style={styles.primaryBtn}
                >
                  <Ionicons name="play" size={18} color={COLORS.bg} />
                  <Text style={styles.primaryBtnText}>Main</Text>
                </TouchableOpacity>
              </View>
            )}

            {status === "paused" && (
              <View style={styles.overlay} testID="overlay-paused">
                <Text style={styles.overlayTitle}>JEDA</Text>
                <Text style={styles.overlaySub}>Permainan dijeda</Text>
                <TouchableOpacity
                  testID="btn-resume"
                  onPress={handleResume}
                  activeOpacity={0.85}
                  style={styles.primaryBtn}
                >
                  <Ionicons name="play" size={18} color={COLORS.bg} />
                  <Text style={styles.primaryBtnText}>Lanjutkan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="btn-restart-paused"
                  onPress={handleRestart}
                  activeOpacity={0.85}
                  style={styles.secondaryBtn}
                >
                  <Ionicons name="refresh" size={16} color={COLORS.pink} />
                  <Text style={styles.secondaryBtnText}>Ulangi</Text>
                </TouchableOpacity>
              </View>
            )}

            {status === "over" && (
              <View style={styles.overlay} testID="overlay-over">
                <Text style={[styles.overlayTitle, { color: COLORS.pink }]}>
                  PERMAINAN BERAKHIR
                </Text>
                <Text style={styles.overlaySub}>Skor: {score}</Text>
                <Text style={styles.overlaySub}>
                  Skor Tertinggi: {highScore}
                </Text>
                <TouchableOpacity
                  testID="btn-restart"
                  onPress={handleRestart}
                  activeOpacity={0.85}
                  style={styles.primaryBtn}
                >
                  <Ionicons name="refresh" size={18} color={COLORS.bg} />
                  <Text style={styles.primaryBtnText}>Ulangi</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.actionsCol}>
            {status === "playing" ? (
              <TouchableOpacity
                testID="btn-pause"
                onPress={handlePause}
                activeOpacity={0.85}
                style={styles.iconBtn}
              >
                <Ionicons name="pause" size={22} color={COLORS.cyan} />
                <Text style={styles.iconBtnText}>Jeda</Text>
              </TouchableOpacity>
            ) : status === "paused" ? (
              <TouchableOpacity
                testID="btn-resume-side"
                onPress={handleResume}
                activeOpacity={0.85}
                style={styles.iconBtn}
              >
                <Ionicons name="play" size={22} color={COLORS.cyan} />
                <Text style={styles.iconBtnText}>Lanjut</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                testID="btn-start-side"
                onPress={handleStart}
                activeOpacity={0.85}
                style={styles.iconBtn}
              >
                <Ionicons name="play" size={22} color={COLORS.cyan} />
                <Text style={styles.iconBtnText}>Main</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              testID="btn-restart-side"
              onPress={handleRestart}
              activeOpacity={0.85}
              style={[styles.iconBtn, { marginTop: 12 }]}
            >
              <Ionicons name="refresh" size={20} color={COLORS.pink} />
              <Text style={[styles.iconBtnText, { color: COLORS.pink }]}>
                Ulangi
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dpad}>
            <View style={styles.dpadRow}>
              <DpadBtn
                dir="up"
                active={activeDir === "up"}
                onPress={() => setDirection("up")}
                testID="dpad-up"
                icon="chevron-up"
              />
            </View>
            <View style={styles.dpadRow}>
              <DpadBtn
                dir="left"
                active={activeDir === "left"}
                onPress={() => setDirection("left")}
                testID="dpad-left"
                icon="chevron-back"
              />
              <View style={styles.dpadSpacer} />
              <DpadBtn
                dir="right"
                active={activeDir === "right"}
                onPress={() => setDirection("right")}
                testID="dpad-right"
                icon="chevron-forward"
              />
            </View>
            <View style={styles.dpadRow}>
              <DpadBtn
                dir="down"
                active={activeDir === "down"}
                onPress={() => setDirection("down")}
                testID="dpad-down"
                icon="chevron-down"
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DpadBtn({
  active,
  onPress,
  testID,
  icon,
}: {
  dir: Direction;
  active: boolean;
  onPress: () => void;
  testID: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.dpadBtn, active && styles.dpadBtnActive]}
    >
      <Ionicons
        name={icon}
        size={26}
        color={active ? COLORS.bg : COLORS.cyan}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  scoreBox: { backgroundColor: COLORS.surface, borderColor: COLORS.wall, borderWidth: 1, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, minWidth: 92 },
  scoreLabel: { color: COLORS.textSecondary, fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  scoreValue: { color: COLORS.snakeHead, fontSize: 22, fontWeight: "900", fontVariant: ["tabular-nums"], marginTop: 2 },
  brandBox: { alignItems: "center" },
  brandText: { color: COLORS.textPrimary, fontSize: 14, letterSpacing: 4, fontWeight: "900" },
  brandAccent: { color: COLORS.cyan, fontSize: 14, letterSpacing: 4, fontWeight: "900", textShadowColor: COLORS.cyan, textShadowRadius: 8 },
  speedRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  speedLabel: { color: COLORS.textSecondary, fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  speedChips: { flexDirection: "row", gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  chipIdle: { borderColor: COLORS.wall, backgroundColor: "transparent" },
  chipActive: { borderColor: COLORS.cyan, backgroundColor: COLORS.cyanSoft, shadowColor: COLORS.cyan, shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  chipText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  boardWrap: { alignItems: "center", justifyContent: "center", marginBottom: 16 },
  board: { backgroundColor: COLORS.surface, borderColor: COLORS.wall, borderWidth: 1, borderRadius: 10, overflow: "hidden", position: "relative" },
  cellAbs: { position: "absolute" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,10,12,0.88)", alignItems: "center", justifyContent: "center", padding: 16 },
  overlayTitle: { color: COLORS.cyan, fontSize: 22, fontWeight: "900", letterSpacing: 3, marginBottom: 8, textShadowColor: COLORS.cyan, textShadowRadius: 10 },
  overlaySub: { color: COLORS.textSecondary, fontSize: 13, textAlign: "center", marginBottom: 6 },
  primaryBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, backgroundColor: COLORS.cyan, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, shadowColor: COLORS.cyan, shadowOpacity: 0.7, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  primaryBtnText: { color: COLORS.bg, fontWeight: "900", fontSize: 15 },
  secondaryBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 10, borderWidth: 1, borderColor: COLORS.pink, backgroundColor: "rgba(255,0,127,0.08)" },
  secondaryBtnText: { color: COLORS.pink, fontWeight: "800", fontSize: 13 },
  controlsRow: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  actionsCol: { alignItems: "center", justifyContent: "center" },
  iconBtn: { width: 70, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.wall, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", gap: 2 },
  iconBtnText: { color: COLORS.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  dpad: { alignItems: "center", justifyContent: "center" },
  dpadRow: { flexDirection: "row", alignItems: "center" },
  dpadSpacer: { width: 56, height: 56 },
  dpadBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.cyanSoft, borderWidth: 1, borderColor: COLORS.cyanBorder, alignItems: "center", justifyContent: "center", margin: 4 },
  dpadBtnActive: { backgroundColor: COLORS.cyan, borderColor: COLORS.cyan, shadowColor: COLORS.cyan, shadowOpacity: 0.8, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, transform: [{ scale: 0.95 }] },
});
