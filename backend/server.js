const express = require('express');
const { verifyIdToken } = require('./firebase');
const app = express();

const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization;

  if (!idToken) {
    return res.status(403).send('Unauthorized');
  }

  try {
    const decodedToken = await verifyIdToken(idToken);
    req.user = decodedToken; 
    next();
  } catch (err) {
    res.status(403).send('Unauthorized');
  }
};

app.get('/', (req, res) => {
  res.send('Welcome to the backend!');
});

app.get('/profile', authenticate, (req, res) => {
  res.json({ message: `Hello, ${req.user.name}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
