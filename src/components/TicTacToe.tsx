import { useEffect, useMemo, useState } from "react";

export type CellValue = "X" | "O" | null;

const winningPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
] as const;

export type GameCopy = {
  winPending: string;
  loseText: string;
  drawText: string;
  actionPlayAgain: string;
  playerTurn: string;
  botTurn: string;
};

export type WinSummary = {
  board: CellValue[];
  moves: number[];
};

type Props = {
  copy: GameCopy;
  onWin: (summary: WinSummary) => void;
  onLose: () => void;
  onDraw?: () => void;
};

export function TicTacToe({ copy, onWin, onLose, onDraw }: Props) {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState<number[]>([]);

  const winner = useMemo(() => calculateWinner(board), [board]);
  const isBoardFull = board.every(Boolean);

  useEffect(() => {
    if (isLocked || (!winner && !isBoardFull)) {
      return;
    }
    setIsLocked(true);
    if (winner === "X") {
      onWin({ board: [...board], moves: [...moves] });
    } else if (winner === "O") {
      onLose();
    } else if (!winner && isBoardFull) {
      onDraw?.();
    }
  }, [winner, isBoardFull, copy, onWin, onLose, onDraw, board, moves, isLocked]);

  useEffect(() => {
    if (!isPlayerTurn && !winner && !isBoardFull) {
      const timeoutId = window.setTimeout(() => {
        const nextBoard = [...board];
        const botMoveIndex = chooseBotMove(nextBoard);
        nextBoard[botMoveIndex] = "O";
        setBoard(nextBoard);
        setMoves((prev) => [...prev, botMoveIndex]);
        setIsPlayerTurn(true);
      }, 220);

      return () => window.clearTimeout(timeoutId);
    }
    return;
  }, [isPlayerTurn, winner, isBoardFull, board]);

  const handleCellClick = (index: number) => {
    if (isLocked || board[index] !== null || !isPlayerTurn) {
      return;
    }

    setBoard((current) => {
      const nextBoard = [...current];
      nextBoard[index] = "X";
      return nextBoard;
    });
    setMoves((prev) => [...prev, index]);
    setIsPlayerTurn(false);
  };

  return (
    <div className="game-card">
      <div className="board" aria-label="TicTacToe grid">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`cell ${cell ? "filled" : ""}`}
            onClick={() => handleCellClick(index)}
            disabled={Boolean(cell) || isLocked || !isPlayerTurn}
            aria-label={`cell ${index}`}
          >
            {cell}
          </button>
        ))}
      </div>

    </div>
  );
}

const calculateWinner = (board: CellValue[]) => {
  for (const [a, b, c] of winningPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const chooseBotMove = (board: CellValue[]) => {
  const emptyCells = board
    .map((value, index) => (value === null ? index : null))
    .filter((index): index is number => index !== null);
  if (emptyCells.length === 0) {
    return 0;
  }
  // Slight bias to center for a smarter feel
  if (board[4] === null && Math.random() > 0.3) {
    return 4;
  }
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};
