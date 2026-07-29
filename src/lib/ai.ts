// Tic Tac Toe AI Engine

export type CellValue = "X" | "O" | null;
export type Board = CellValue[];

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

export function checkWinner(board: Board): { winner: CellValue; combo: number[] | null } {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  return { winner: null, combo: null };
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((moves, cell, idx) => {
    if (cell === null) moves.push(idx);
    return moves;
  }, []);
}

// Minimax with alpha-beta pruning
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: CellValue,
  humanPlayer: CellValue
): number {
  const { winner } = checkWinner(board);
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of getAvailableMoves(board)) {
      board[move] = aiPlayer;
      const evalScore = minimax(board, depth + 1, false, alpha, beta, aiPlayer, humanPlayer);
      board[move] = null;
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of getAvailableMoves(board)) {
      board[move] = humanPlayer;
      const evalScore = minimax(board, depth + 1, true, alpha, beta, aiPlayer, humanPlayer);
      board[move] = null;
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove(board: Board, aiPlayer: CellValue, humanPlayer: CellValue): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (const move of getAvailableMoves(board)) {
    board[move] = aiPlayer;
    const score = minimax(board, 0, false, -Infinity, Infinity, aiPlayer, humanPlayer);
    board[move] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function getRandomMove(board: Board): number {
  const available = getAvailableMoves(board);
  return available[Math.floor(Math.random() * available.length)];
}

// Get AI difficulty factor based on level (1-100)
export function getLevelDifficulty(level: number): string {
  if (level <= 20) return "easy";
  if (level <= 60) return "medium";
  return "hard";
}

// Mistake probability decreases as level increases
function getMistakeProbability(level: number): number {
  if (level <= 10) return 0.7;
  if (level <= 20) return 0.5;
  if (level <= 30) return 0.4;
  if (level <= 40) return 0.3;
  if (level <= 50) return 0.25;
  if (level <= 60) return 0.2;
  if (level <= 70) return 0.15;
  if (level <= 80) return 0.1;
  if (level <= 90) return 0.05;
  return 0.02; // level 91-100: near perfect
}

export function getAiMove(
  board: Board,
  difficulty: string,
  level?: number
): number {
  const aiPlayer: CellValue = "O";
  const humanPlayer: CellValue = "X";
  const boardCopy = [...board] as Board;

  let mistakeProb: number;

  if (level !== undefined && level !== null) {
    mistakeProb = getMistakeProbability(level);
  } else {
    switch (difficulty) {
      case "easy":
        mistakeProb = 0.6;
        break;
      case "medium":
        mistakeProb = 0.3;
        break;
      case "hard":
        mistakeProb = 0.05;
        break;
      default:
        mistakeProb = 0.3;
    }
  }

  // Decide whether to make a random move (mistake) or optimal move
  if (Math.random() < mistakeProb) {
    return getRandomMove(boardCopy);
  }

  return getBestMove(boardCopy, aiPlayer, humanPlayer);
}

export function getDailyChallengeBoard(): Board {
  // Daily challenge starts with a pre-set board state to make it interesting
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Use seed to generate a consistent starting position
  const board: Board = Array(9).fill(null);
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  // Place 1-2 O pieces to create a challenge
  const numPieces = seededRandom(seed) > 0.5 ? 1 : 2;
  const positions: number[] = [];
  
  for (let i = 0; i < numPieces; i++) {
    let pos: number;
    do {
      pos = Math.floor(seededRandom(seed + i + 1) * 9);
    } while (positions.includes(pos));
    positions.push(pos);
    board[pos] = "O";
  }

  return board;
}
