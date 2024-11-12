const { getAll, createBoard, deleteBoard} = require("../controllers/Board")

module.exports = function(app){
    //GET
    app.get('/boards', getAll);

    //POST
    app.post('/boards', createBoard);

    //DELETE
    app.delete('/boards/:id', deleteBoard);
}
