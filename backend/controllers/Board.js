const Board = require('../models/Board.model');

exports.getAll = async (req, res) => {
    try {
        const boards = await Board.find();
        return res.status(200).json(boards);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const board = await Board.findOne({ _id: req.params.boardId });
        return res.status(200).json(board);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getByOrgId = async (req, res) => {
    try {
        // Сортируем по `createdAt` в порядке убывания (-1)
        const boards = await Board.find({ orgId: req.params.orgId }).sort({
            createdAt: -1,
        });
        return res.status(200).json(boards);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.createBoard = async (req, res) => {
    try {
        const { title, orgId, authorId, imageUrl } = req.body;

        const board = await Board.create({
            title,
            orgId,
            authorId,
            imageUrl,
            createdAt: new Date(), // Сохраняем в UTC
        });

        return res.status(200).json(board);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.updateBoard = async (req, res) => {
    try {
        const board = await Board.updateOne({ _id: req.params.id }, req.body);
        return res.status(200).json(board);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.renameBoard = async (req, res) => {
    try {
        const { title } = req.body;
        const board = await Board.updateOne({ _id: req.params.id }, { title });
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
