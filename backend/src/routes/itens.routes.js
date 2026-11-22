const express = require('express');
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/itens.controller');

const router = express.Router();

// Configuração do upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, nomeUnico + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5 MB
  fileFilter: (req, file, cb) => {
    const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, permitidos.includes(file.mimetype));
  }
});

router.get('/', controller.listar);                       // RF02, RF03
router.get('/:id', controller.buscarPorId);               // RF04
router.post('/', upload.single('foto'), controller.criar);        // RF01
router.put('/:id', upload.single('foto'), controller.atualizar);  // RF05
router.patch('/:id/situacao', controller.atualizarSituacao);      // RF06
router.post('/:id/devolucao', controller.registrarDevolucao);     // RF07
router.delete('/:id', controller.excluir);                        // RF08

module.exports = router;