// api/hello.js
module.exports = (req, res) => {
  return res.status(200).json({ ok: true, route: '/api/hello', method: req.method });
};
