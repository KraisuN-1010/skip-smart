import app from './src/app.js';

const server = app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
})