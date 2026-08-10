require('dotenv').config({ path: '../server/.env' });
const app = require('./api/index.js');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Local backend server running at http://localhost:${PORT}`);
});
