const SIZE = 5;

// 8方向のベクトル (dx, dy)
const DIRECTIONS = [
  [-1, -1], [0, -1], [1, -1],
  [-1,  0],          [1,  0],
  [-1,  1], [0,  1], [1,  1]
];

/**
 * 指定したインデックスに色を置いた時、ひっくり返るマスのインデックス配列を返します。
 */
export function getFlippablePanels(board: number[], index: number, color: number): number[] {
  // 既に置かれている場合は通常は置けない
  if (board[index] !== 0) return [];
  // 色が0(空)の場合はひっくり返せない
  if (color === 0) return [];

  const x = index % SIZE;
  const y = Math.floor(index / SIZE);
  let flippable: number[] = [];

  for (const [dx, dy] of DIRECTIONS) {
    let nx = x + dx;
    let ny = y + dy;
    let temp: number[] = [];

    while (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
      const nIndex = ny * SIZE + nx;
      const nColor = board[nIndex];

      if (nColor === 0) {
        // 空きマスにぶつかったらこの方向は挟めない
        break;
      } else if (nColor === color) {
        // 自分の色にぶつかったら、それまでの相手のパネルをひっくり返す確定
        flippable = flippable.concat(temp);
        break;
      } else {
        // 違う色の場合は一時配列に追加して奥へ進む
        temp.push(nIndex);
      }

      nx += dx;
      ny += dy;
    }
  }

  return flippable;
}
