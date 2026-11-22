const pool = require('../config/db');

// RF02 + RF03: listar e buscar itens
// Exemplos: GET /api/itens  |  GET /api/itens?busca=garrafa&categoria=2&situacao=disponivel
async function listar(req, res) {
  try {
    const { busca, categoria, situacao } = req.query;

    let sql = `
      SELECT i.id, i.nome, i.descricao, i.local_encontrado, i.data_encontrado,
             i.foto, i.situacao, c.nome AS categoria
      FROM itens i
      JOIN categorias c ON c.id = i.categoria_id
      WHERE 1 = 1`;
    const params = [];

    if (busca) {
      sql += ' AND (i.nome LIKE ? OR i.descricao LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`);
    }
    if (categoria) {
      sql += ' AND i.categoria_id = ?';
      params.push(categoria);
    }
    if (situacao) {
      sql += ' AND i.situacao = ?';
      params.push(situacao);
    }

    sql += ' ORDER BY i.data_encontrado DESC';

    const [itens] = await pool.query(sql, params);
    res.json(itens);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar itens' });
  }
}

// RF04: detalhes de um item (inclui dados da devolução, se houver)
async function buscarPorId(req, res) {
  try {
    const [linhas] = await pool.query(
      `SELECT i.*, c.nome AS categoria,
              d.nome_retirante, d.data_devolucao
       FROM itens i
       JOIN categorias c ON c.id = i.categoria_id
       LEFT JOIN devolucoes d ON d.item_id = i.id
       WHERE i.id = ?`,
      [req.params.id]
    );

    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }
    res.json(linhas[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar item' });
  }
}

// RF01: cadastrar item
async function criar(req, res) {
  try {
    const { nome, descricao, categoria_id, local_encontrado, data_encontrado } = req.body;

    if (!nome || !descricao || !categoria_id || !local_encontrado || !data_encontrado) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
    }

    const foto = req.file ? req.file.filename : null;

    const [resultado] = await pool.query(
      `INSERT INTO itens (nome, descricao, categoria_id, local_encontrado, data_encontrado, foto)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, descricao, categoria_id, local_encontrado, data_encontrado, foto]
    );

    res.status(201).json({ id: resultado.insertId, mensagem: 'Item cadastrado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao cadastrar item' });
  }
}

// RF05: editar item
async function atualizar(req, res) {
  try {
    const { nome, descricao, categoria_id, local_encontrado, data_encontrado } = req.body;

    if (!nome || !descricao || !categoria_id || !local_encontrado || !data_encontrado) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
    }

    // Se veio foto nova, troca; se não, mantém a antiga (COALESCE)
    const foto = req.file ? req.file.filename : null;

    const [resultado] = await pool.query(
      `UPDATE itens
       SET nome = ?, descricao = ?, categoria_id = ?, local_encontrado = ?,
           data_encontrado = ?, foto = COALESCE(?, foto)
       WHERE id = ?`,
      [nome, descricao, categoria_id, local_encontrado, data_encontrado, foto, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }
    res.json({ mensagem: 'Item atualizado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar item' });
  }
}

// RF06: atualizar situação (disponivel / devolvido)
async function atualizarSituacao(req, res) {
  try {
    const { situacao } = req.body;

    if (!['disponivel', 'devolvido'].includes(situacao)) {
      return res.status(400).json({ erro: 'Situação inválida' });
    }

    const [resultado] = await pool.query(
      'UPDATE itens SET situacao = ? WHERE id = ?',
      [situacao, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }
    res.json({ mensagem: 'Situação atualizada' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar situação' });
  }
}

// RF07: registrar devolução
async function registrarDevolucao(req, res) {
  const conexao = await pool.getConnection();
  try {
    const { nome_retirante, data_devolucao } = req.body;

    if (!nome_retirante || !data_devolucao) {
      return res.status(400).json({ erro: 'Informe quem retirou e a data' });
    }

    await conexao.beginTransaction();

    const [item] = await conexao.query(
      'SELECT situacao FROM itens WHERE id = ?',
      [req.params.id]
    );
    if (item.length === 0) {
      await conexao.rollback();
      return res.status(404).json({ erro: 'Item não encontrado' });
    }
    if (item[0].situacao === 'devolvido') {
      await conexao.rollback();
      return res.status(409).json({ erro: 'Este item já foi devolvido' });
    }

    await conexao.query(
      'INSERT INTO devolucoes (item_id, nome_retirante, data_devolucao) VALUES (?, ?, ?)',
      [req.params.id, nome_retirante, data_devolucao]
    );
    await conexao.query(
      "UPDATE itens SET situacao = 'devolvido' WHERE id = ?",
      [req.params.id]
    );

    await conexao.commit();
    res.status(201).json({ mensagem: 'Devolução registrada com sucesso' });
  } catch (erro) {
    await conexao.rollback();
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao registrar devolução' });
  } finally {
    conexao.release();
  }
}

// RF08: excluir item
async function excluir(req, res) {
  try {
    const [resultado] = await pool.query('DELETE FROM itens WHERE id = ?', [req.params.id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }
    res.json({ mensagem: 'Item excluído com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao excluir item' });
  }
}

module.exports = {
  listar, buscarPorId, criar, atualizar,
  atualizarSituacao, registrarDevolucao, excluir
};