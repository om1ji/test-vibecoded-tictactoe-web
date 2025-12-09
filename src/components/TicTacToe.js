import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
export function TicTacToe({ copy, onWin, onLose, onDraw }) {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [status, setStatus] = useState("");
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [moves, setMoves] = useState([]);
    const winner = useMemo(() => calculateWinner(board), [board]);
    const isBoardFull = board.every(Boolean);
    useEffect(() => {
        if (isLocked || (!winner && !isBoardFull)) {
            return;
        }
        setIsLocked(true);
        if (winner === "X") {
            setStatus(copy.winPending);
            onWin({ board: [...board], moves: [...moves] });
        }
        else if (winner === "O") {
            onLose();
            setStatus(copy.loseText);
        }
        else if (!winner && isBoardFull) {
            onDraw?.();
            setStatus(copy.drawText);
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
    const handleCellClick = (index) => {
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
        setStatus("");
    };
    const handleRestart = () => {
        setBoard(Array(9).fill(null));
        setIsPlayerTurn(true);
        setIsLocked(false);
        setStatus("");
        setMoves([]);
    };
    return (_jsxs("div", { className: "game-card", children: [_jsx("div", { className: "board", "aria-label": "TicTacToe grid", children: board.map((cell, index) => (_jsx("button", { className: `cell ${cell ? "filled" : ""}`, onClick: () => handleCellClick(index), disabled: Boolean(cell) || isLocked || !isPlayerTurn, "aria-label": `cell ${index}`, children: cell }, index))) }), _jsx("p", { className: "status-text", children: status || (isPlayerTurn ? copy.playerTurn : copy.botTurn) }), (winner || isBoardFull) && (_jsx("button", { className: "outline-button", onClick: handleRestart, children: copy.actionPlayAgain }))] }));
}
const calculateWinner = (board) => {
    for (const [a, b, c] of winningPatterns) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};
const chooseBotMove = (board) => {
    const emptyCells = board
        .map((value, index) => (value === null ? index : null))
        .filter((index) => index !== null);
    if (emptyCells.length === 0) {
        return 0;
    }
    // Slight bias to center for a smarter feel
    if (board[4] === null && Math.random() > 0.3) {
        return 4;
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};
