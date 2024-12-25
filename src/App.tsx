import { useState } from "react";
import "./App.scss";
import DARK_PAWN from "./assets/pieces/bPawn.svg";
import DARK_BISHOP from "./assets/pieces/bBishop.svg";
import DARK_KNIGHT from "./assets/pieces/bKnight.svg";
import DARK_ROOK from "./assets/pieces/bRook.svg";
import DARK_QUEEN from "./assets/pieces/bQueen.svg";
import DARK_KING from "./assets/pieces/bKing.svg";
import LIGHT_PAWN from "./assets/pieces/wPawn.svg";
import LIGHT_BISHOP from "./assets/pieces/wBishop.svg";
import LIGHT_KNIGHT from "./assets/pieces/wKnight.svg";
import LIGHT_ROOK from "./assets/pieces/wRook.svg";
import LIGHT_QUEEN from "./assets/pieces/wQueen.svg";
import LIGHT_KING from "./assets/pieces/wKing.svg";

interface IGame {
    board: string[][];
    fen: string;
    toPlay: string;
    castle: string;
    enpassant: string;
    tedious: string;
    turns: string;
}
/**
 * Represents a position on the chessboard.
 */
interface IPosition {
    x: number;
    y: number;
}
interface IPiece {
    dark: string;
    light: string;
    value: number;
}
interface ISelectedPiece {
    piece: string;
    position: IPosition;
    possibleMoves: IPosition[];
}

const BOARD_SIZE = 8;

const PAWN: IPiece = { dark: "p", light: "P", value: 1 };
const BISHOP: IPiece = { dark: "b", light: "B", value: 3 };
const KNIGHT: IPiece = { dark: "n", light: "N", value: 3 };
const ROOK: IPiece = { dark: "r", light: "R", value: 5 };
const QUEEN: IPiece = { dark: "q", light: "Q", value: 9 };
const KING: IPiece = { dark: "k", light: "K", value: 0 };

const FEN_BOARD = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
// const FEN_BOARD = "8/2N4P/Kp6/2B2nbp/P7/8/q2Pr1bp/2k4n w - - 0 1";
// const FEN_BOARD = "r7/Nk1P1PR1/8/2QK1N1p/p4Bp1/1P4p1/4r2P/8 w - - 0 1";
// const FEN_BOARD = "1r6/K3P1k1/1P3R2/P2qp2p/1Np1P3/Q7/3Pp3/8 w - - 0 1";
// const FEN_BOARD = "rb2b3/3RP3/3p4/1Pp5/1P1n1p1P/3K4/3p3R/4k3 w - - 0 1";
// const FEN_BOARD = "8/q2k4/1b1N4/P2B4/3prP1R/3pp2P/4PpK1/8 w - - 0 1";
// const FEN_BOARD = "1R6/2P5/rQpP4/4pk2/nPK5/2p3P1/B5NP/8 w - - 0 1";
// const FEN_BOARD = "8/n1B2ppP/1p2r1P1/1p6/2Pp4/2k2pK1/p7/2r5 w - - 0 1";
// const FEN_BOARD = "8/2Pp4/1Q2P1b1/3B1N2/k2pK3/3p3P/pnn2b2/8 w - - 0 1";
// const FEN_BOARD = "1N3Kn1/1p3B2/1q3k2/P4p1n/pP6/p6p/6p1/R7 w - - 0 1";
// const FEN_BOARD = "2Q5/p2p1b1K/pB2P3/4r3/P2p1P2/6P1/7k/2Nn4 w - - 0 1";

// Possible relative straight movements for any piece
const DIRECTIONS: IPosition[] = [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
];
// Possible relative movements for a knight
const DIRECTIONS_KNIGHT: IPosition[] = [
    { x: 2, y: 1 },
    { x: 1, y: 2 },
    { x: -1, y: 2 },
    { x: -2, y: 1 },
    { x: -2, y: -1 },
    { x: -1, y: -2 },
    { x: 1, y: -2 },
    { x: 2, y: -1 },
];

function getPieceSVG(piece_code: string) {
    if (!piece_code) return undefined;

    let piece: string | undefined = undefined;

    switch (piece_code) {
        case PAWN.dark:
            piece = DARK_PAWN;
            break;
        case BISHOP.dark:
            piece = DARK_BISHOP;
            break;
        case KNIGHT.dark:
            piece = DARK_KNIGHT;
            break;
        case ROOK.dark:
            piece = DARK_ROOK;
            break;
        case QUEEN.dark:
            piece = DARK_QUEEN;
            break;
        case KING.dark:
            piece = DARK_KING;
            break;
        case PAWN.light:
            piece = LIGHT_PAWN;
            break;
        case BISHOP.light:
            piece = LIGHT_BISHOP;
            break;
        case KNIGHT.light:
            piece = LIGHT_KNIGHT;
            break;
        case ROOK.light:
            piece = LIGHT_ROOK;
            break;
        case QUEEN.light:
            piece = LIGHT_QUEEN;
            break;
        case KING.light:
            piece = LIGHT_KING;
            break;
    }

    return piece;
}

function prepareGame(fen: string): IGame {
    const [table, toPlay, castle, enpassant, tedious, turns] = fen.split(" ");

    const board = table.split("/").map((row) => {
        const rowCells = row.split("");

        for (let i = rowCells.length - 1; i >= 0; i--) {
            const cell = Number(rowCells[i]);

            if (isNaN(cell)) continue;

            rowCells.splice(i, 1, ...new Array(cell).fill(""));
        }

        return rowCells;
    });

    return {
        board: board,
        fen: fen,
        toPlay: toPlay,
        castle: castle,
        enpassant: enpassant,
        tedious: tedious,
        turns: turns,
    };
}

function pieceColor(piece: string) {
    return piece === piece.toUpperCase() ? "w" : "b";
}

/**
 * Checks if the given position is within the chessboard boundaries.
 * @param position - The position to check.
 * @returns True if the position is within the board, false otherwise.
 */
function isWithinBoard(position: IPosition): boolean {
    return position.x >= 0 && position.x < BOARD_SIZE && position.y >= 0 && position.y < BOARD_SIZE;
}

/**
 * Checks if a move is valid based on the origin, destination, and board state.
 * @param origin - The starting position of the piece.
 * @param destination - The intended destination of the piece.
 * @param board - The current state of the chessboard.
 * @param pieceCode - Optional piece code, if not provided, the piece at the origin is used.
 * @returns True if the move is valid, false otherwise.
 */
function isValidMove(
    origin: IPosition,
    destination: IPosition,
    board: string[][],
    pieceCode?: string
): boolean {
    const piece = pieceCode || board[origin.y][origin.x];

    if (!piece) throw new Error("No piece found to move");

    const color = pieceColor(piece);

    // Check if the destination is within the board boundaries
    if (!isWithinBoard(destination)) return false;

    const destinationPiece = board[destination.y][destination.x];

    // If moving to an empty square or capturing an enemy piece
    return (
        !destinationPiece ||
        pieceColor(destinationPiece) !== color ||
        destinationPiece === pieceCode
    );
}

function isTargettedByType(
    selfColor: string,
    targettingType: IPiece,
    targets: IPosition[],
    board: string[][]
) {
    return targets.some(({ x, y }) => {
        return isPieceOfType(board[y][x], targettingType) && pieceColor(board[y][x]) !== selfColor;
    });
}

function isValidKingMove(origin: IPosition, destine: IPosition, board: string[][]): boolean {
    const piece = board[origin.y][origin.x];
    const color = pieceColor(piece);

    // Define piece types and their corresponding movement functions
    const pieceTypesAndMoves = [
        { pieceType: QUEEN, moves: queenMoves },
        { pieceType: ROOK, moves: rookMoves },
        { pieceType: BISHOP, moves: bishopMoves },
        { pieceType: KNIGHT, moves: knightMoves },
        { pieceType: KING, moves: kingMoves },
        { pieceType: PAWN, moves: pawnMoves },
    ];

    // Check if the king's destination is targeted by any of the pieces
    for (const { pieceType, moves } of pieceTypesAndMoves) {
        if (isTargettedByType(color, pieceType, moves(destine, board, piece), board)) {
            return false;
        }
    }

    return true;
}

function isPieceOfType(piece: string, pieceType: IPiece): boolean {
    return pieceType.dark === piece || pieceType.light === piece;
}

/**
 * Returns the possible movements for a king on a chessboard.
 * @param origin - The current position of the king.
 * @param board - The chessboard represented as a 2D array.
 * @returns An array of possible movements.
 */
function kingMoves(
    origin: IPosition,
    board: string[][],
    pieceCode?: string,
    self: boolean = false
): IPosition[] {
    const possible: IPosition[] = [];

    for (const direction of DIRECTIONS) {
        const destine: IPosition = {
            y: origin.y + direction.y,
            x: origin.x + direction.x,
        };

        if (!isValidMove(origin, destine, board, pieceCode)) continue;

        if (self && !isValidKingMove(origin, destine, board)) continue;

        possible.push(destine);
    }

    return possible;
}

/**
 * Returns the possible movements for a queen on a chessboard.
 * @param origin - The current position of the queen.
 * @param board - The chessboard represented as a 2D array.
 * @returns An array of possible movements.
 */
function queenMoves(origin: IPosition, board: string[][], pieceCode?: string): IPosition[] {
    const possible: IPosition[] = [];

    for (const direction of DIRECTIONS) {
        for (let i = 1; i < BOARD_SIZE; i++) {
            const destine: IPosition = {
                y: origin.y + direction.y * i,
                x: origin.x + direction.x * i,
            };

            if (!isValidMove(origin, destine, board, pieceCode)) break;

            possible.push(destine);

            const destineSquare = board[destine.y][destine.x];

            if (destineSquare && destineSquare !== pieceCode) break; // Stop if there's a piece in the path that is not the king in check
        }
    }

    return possible;
}

/**
 * Returns the possible movements for a bishop on a chessboard.
 * @param origin - The current position of the bishop.
 * @param board - The chessboard represented as a 2D array.
 * @returns An array of possible movements.
 */
function bishopMoves(origin: IPosition, board: string[][], pieceCode?: string): IPosition[] {
    const possible: IPosition[] = [];

    for (const direction of DIRECTIONS) {
        if (direction.x === 0 || direction.y === 0) continue;

        for (let i = 1; i < BOARD_SIZE; i++) {
            const destine: IPosition = {
                y: origin.y + direction.y * i,
                x: origin.x + direction.x * i,
            };

            if (!isValidMove(origin, destine, board, pieceCode)) break;

            possible.push(destine);

            const destineSquare = board[destine.y][destine.x];

            if (destineSquare && destineSquare !== pieceCode) break; // Stop if there's a piece in the path that is not the king in check
        }
    }

    return possible;
}

/**
 * Returns the possible movements for a knight on a chessboard.
 * @param origin - The current position of the knight.
 * @param board - The chessboard represented as a 2D array.
 * @returns An array of possible movements.
 */
function knightMoves(origin: IPosition, board: string[][], pieceCode?: string): IPosition[] {
    const possible: IPosition[] = [];

    for (const direction of DIRECTIONS_KNIGHT) {
        const destine: IPosition = { x: origin.x + direction.x, y: origin.y + direction.y };

        if (!isValidMove(origin, destine, board, pieceCode)) continue;

        possible.push({ x: destine.x, y: destine.y });
    }

    return possible;
}

/**
 * Returns the possible movements for a rook on a chessboard.
 * @param origin - The current position of the rook.
 * @param board - The chessboard represented as a 2D array.
 * @returns An array of possible movements.
 */
function rookMoves(origin: IPosition, board: string[][], pieceCode?: string): IPosition[] {
    const possible: IPosition[] = [];

    for (const direction of DIRECTIONS) {
        if (direction.x !== 0 && direction.y !== 0) continue;

        for (let i = 1; i < BOARD_SIZE; i++) {
            const destine: IPosition = {
                y: origin.y + direction.y * i,
                x: origin.x + direction.x * i,
            };

            if (!isValidMove(origin, destine, board, pieceCode)) break;

            possible.push(destine);

            const destineSquare = board[destine.y][destine.x];

            if (destineSquare && destineSquare !== pieceCode) break; // Stop if there's a piece in the path that is not the king in check
        }
    }

    return possible;
}

/**
 * Returns the possible movements for a pawn on a chessboard.
 * @param origin - The current position of the pawn.
 * @param board - The chessboard represented as a 2D array.
 * @param pieceCode - Optional piece code, if not provided, the piece at the origin is used.
 * @returns An array of possible movements.
 */
function pawnMoves(origin: IPosition, board: string[][], pieceCode?: string): IPosition[] {
    const piece = pieceCode || board[origin.y][origin.x];
    const color = pieceColor(piece);
    const possibleMovements: IPosition[] = [];

    const direction = color === "w" ? -1 : 1; // Pawns move up for white and down for black

    // Standard forward move
    const forwardPosition: IPosition = { x: origin.x, y: origin.y + direction };
    if (isWithinBoard(forwardPosition) && !board[forwardPosition.y][forwardPosition.x]) {
        possibleMovements.push(forwardPosition);

        // Double forward move on pawn's first move
        if ((color === "w" && origin.y === 6) || (color === "b" && origin.y === 1)) {
            const doubleForwardPosition: IPosition = { x: origin.x, y: origin.y + 2 * direction };

            if (
                isWithinBoard(doubleForwardPosition) &&
                !board[doubleForwardPosition.y][doubleForwardPosition.x]
            ) {
                possibleMovements.push(doubleForwardPosition);
            }
        }
    }

    // Capture moves
    for (const dx of [-1, 1]) {
        const capturePosition: IPosition = { x: origin.x + dx, y: origin.y + direction };

        if (isWithinBoard(capturePosition)) {
            const destinationPiece = board[capturePosition.y][capturePosition.x];

            if (destinationPiece && pieceColor(destinationPiece) !== color) {
                possibleMovements.push(capturePosition);
            }
        }
    }

    return possibleMovements;
}

function possibleMoves(origin: IPosition, board: string[][]) {
    const piece = board[origin.y][origin.x];

    switch (true) {
        case isPieceOfType(piece, KING):
            return kingMoves(origin, board, undefined, true);

        case isPieceOfType(piece, QUEEN):
            return queenMoves(origin, board);

        case isPieceOfType(piece, PAWN):
            return pawnMoves(origin, board);

        case isPieceOfType(piece, KNIGHT):
            return knightMoves(origin, board);

        case isPieceOfType(piece, BISHOP):
            return bishopMoves(origin, board);

        case isPieceOfType(piece, ROOK):
            return rookMoves(origin, board);

        default:
            return [];
    }
}

function unmarkAll() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const squareID = `${j}/${i}`;

            const square = document.getElementById(squareID);
            if (!square) throw "square not found";

            square.className = square.className.replace(" mark", "");
            square.className = square.className.replace(" moving", "");
        }
    }
}

function markSelf(origin: IPosition) {
    const squareID = `${origin.y}/${origin.x}`;
    const square = document.getElementById(squareID);
    if (!square) throw "square not found";

    square.className += " moving";
}

function markPossible(possibles: IPosition[]) {
    possibles.forEach(({ x, y }) => {
        const squareID = `${y}/${x}`;
        const square = document.getElementById(squareID);
        if (!square) throw "square not found";

        square.className += " mark";
    });
}

function Game({ board, toPlay }: IGame) {
    const [turn, setTurn] = useState(toPlay);
    const [selectedPiece, setSelectedPiece] = useState<ISelectedPiece>();

    const movePiece = (y: number, x: number) => {
        if (!selectedPiece) return;

        board[selectedPiece.position.y][selectedPiece.position.x] = "";
        board[y][x] = selectedPiece.piece;

        setSelectedPiece(undefined);

        setTurn((turn) => (turn === "w" ? "b" : "w"));
    };

    const markPieces = (y: number, x: number) => {
        const isSelf = selectedPiece?.position.y === y && selectedPiece.position.x === x;

        const piece = board[y][x];
        if (!piece || pieceColor(piece) !== turn || isSelf) return setSelectedPiece(undefined);

        const origin: IPosition = { x, y };
        const possible = possibleMoves(origin, board);
        markPossible(possible);
        markSelf(origin);

        setSelectedPiece({ piece, position: origin, possibleMoves: possible });
    };

    const selectPiece = (y: number, x: number) => {
        unmarkAll();

        const isDestine = selectedPiece?.possibleMoves.some((pos) => pos.y === y && pos.x === x);

        if (isDestine) return movePiece(y, x);

        return markPieces(y, x);
    };

    return (
        <div className="board">
            {board.map((row, y) => {
                return row.map((piece, x) => {
                    const squareID = `${y}/${x}`;
                    const pieceID = `${squareID}img`;
                    const squareColor = y % 2 === x % 2 ? "light" : "dark";

                    return (
                        <button
                            key={squareID}
                            id={squareID}
                            className={`square ${squareColor}`}
                            onClick={() => selectPiece(y, x)}
                        >
                            {piece && (
                                <img id={pieceID} className="piece" src={getPieceSVG(piece)} />
                            )}
                        </button>
                    );
                });
            })}
        </div>
    );
}

function App() {
    const [game, setGame] = useState<IGame>(prepareGame(FEN_BOARD));

    const handleIniciar = () => {
        setGame(prepareGame(FEN_BOARD));
    };

    return (
        <div id="App">
            <button onClick={handleIniciar}>{game ? "Reiniciar" : "Iniciar"}</button>

            <Game {...game} />
        </div>
    );
}

export default App;
