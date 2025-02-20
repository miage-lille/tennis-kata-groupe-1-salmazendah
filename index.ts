import { isSamePlayer, Player } from './types/player';
import { Point, PointsData, Score, FortyData, Forty, forty, fifteen, thirty, deuce, advantage, game, points, love } from './types/score';
import { none, Option, some, match as matchOpt } from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';

// -------- Tooling functions --------- //

export const playerToString = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'Player 1';
    case 'PLAYER_TWO':
      return 'Player 2';
  }
};
export const otherPlayer = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'PLAYER_TWO';
    case 'PLAYER_TWO':
      return 'PLAYER_ONE';
  }
};

export const incrementPoint = (point: Point): Option<Point> => {
  switch (point.kind) {
    case 'LOVE':
      return some(fifteen());
    case 'FIFTEEN':
      return some(thirty());
    case 'THIRTY':
      return none;
  }
};

// Exercice 1 :
export const pointToString = (point: Point): string =>{
  switch (point.kind) {
    case 'LOVE':
      return 'Love';
    case 'FIFTEEN':
      return '15';
    case 'THIRTY':
      return '30';
    default:
      throw new Error('Invalid point type');
  }
};


export const scoreToString = (score: Score): string => {
  switch (score.kind) {
    case 'POINTS':
      return `${pointToString(score.pointsData.PLAYER_ONE)} - ${pointToString(score.pointsData.PLAYER_TWO)}`;
    case 'FORTY':
      return `${playerToString(score.fortyData.player)} - ${pointToString(score.fortyData.otherPoint)}`;
    case 'DEUCE':
      return 'Deuce';
    case 'ADVANTAGE':
      return `Advantage ${playerToString(score.player)}`;
    case 'GAME':
      return `Game ${playerToString(score.player)}`;
    default:
      throw new Error('Invalid score type');
  }
};

export const scoreWhenDeuce = (winner: Player): Score => advantage(winner);

export const scoreWhenAdvantage = (
  advantagedPlayed: Player,
  winner: Player
): Score => {
  if (isSamePlayer(advantagedPlayed, winner)) return game(winner);
  return deuce();
};

export const scoreWhenForty = (
  currentForty: FortyData,
  winner: Player
): Score => {
  if (isSamePlayer(currentForty.player, winner)) return game(winner);
  return pipe(
    incrementPoint(currentForty.otherPoint),
    matchOpt(
      () => deuce(),
      p => forty(currentForty.player, p) as Score
    )
  );
};

export const scoreWhenGame = (winner: Player): Score => game(winner);

// Exercice 2
// Tip: You can use pipe function from fp-ts to improve readability.
// See scoreWhenForty function above.
export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  if (winner === 'PLAYER_ONE') {
    const newPoint = incrementPoint(current.PLAYER_ONE);
    return pipe(
      newPoint,
      matchOpt(
        () => forty('PLAYER_ONE', current.PLAYER_TWO) as Score,
        (p) => points(p, current.PLAYER_TWO) as Score 
      )
    );
  } else {
    const newPoint = incrementPoint(current.PLAYER_TWO);
    return pipe(
      newPoint,
      matchOpt(
        () => forty('PLAYER_TWO', current.PLAYER_ONE) as Score, 
        (p) => points(current.PLAYER_ONE, p) as Score
      )
    );
  }
};

export const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS':
      return scoreWhenPoint(currentScore.pointsData, winner);
    case 'FORTY':
      return scoreWhenForty(currentScore.fortyData, winner);
    case 'ADVANTAGE':
      return scoreWhenAdvantage(currentScore.player, winner);
    case 'DEUCE':
      return scoreWhenDeuce(winner);
    case 'GAME':
      return scoreWhenGame(winner);
  }
};

const newGame: Score = points(love(), love()); // pour initialiser un nouveau jeu