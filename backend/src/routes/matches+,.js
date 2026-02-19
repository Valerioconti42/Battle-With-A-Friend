const { getMatchHistory } = require('../models/match-model');
router.get(
  '/history',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      const history = await getMatchHistory(userId, 50);

      return res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }
);
