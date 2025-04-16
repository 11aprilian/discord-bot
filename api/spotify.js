const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../spotify.json');

export default function handler(req, res) {
  if (!fs.existsSync(filePath)) return res.status(204).json(null);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!data) return res.status(204).json(null);
  res.json(data);
}
