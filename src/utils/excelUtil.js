const DEFAULT_CELL_BORDER = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

const DEFAULT_CELL_COLOR = 'FFFFFFFF';

function setOuterBorder(sheet, top, left, bottom, right) {
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      const border = {};

      if (row === top) {
        border.top = { style: 'thin' };
      }
      if (row === bottom) {
        border.bottom = { style: 'thin' };
      }
      if (col === left) {
        border.left = { style: 'thin' };
      }
      if (col === right) {
        border.right = { style: 'thin' };
      }

      sheet.getCell(row, col).border = border;
    }
  }
}

function setBorder(sheet, top, left, bottom, right, border = DEFAULT_CELL_BORDER) {
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      sheet.getCell(row, col).border = border;
    }
  }
}

function setSolidFill(sheet, top, left, bottom, right, color = DEFAULT_CELL_COLOR) {
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      sheet.getCell(row, col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color },
      };
    }
  }
}

module.exports = {
  setOuterBorder,
  setBorder,
  setSolidFill,
};
