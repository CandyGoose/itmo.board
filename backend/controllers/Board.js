const Board = require('../models/Board.model');

exports.getAll = async (req, res) => {
   try {
      const boards = await Board.find();
      return res.status(200).json(boards);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.createBoard = async (req, res) => {
   try {
      const board = await Board.create(req.body);
      return res.status(200).json(board);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.deleteBoard = async (req, res) => {
   try {
      const board = await Board.deleteOne({ _id: req.params.id });
      return res.status(200).json(board);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};
