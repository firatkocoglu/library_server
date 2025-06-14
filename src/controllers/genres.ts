import pool from '../db';

const getGenres = async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM genres ORDER BY id ASC');
        client.release();
        const { rows } = result;
        if (rows.length > 0) {
            res.json({ genres: rows });
        } else {
            res.status(404).json({ message: 'No genres found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving genres' });
    }
};

const getGenreByID = async (req, res) => {
    const { id } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM genres WHERE id = $1', [
            id,
        ]);
        client.release();
        const { rows } = result;
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Genre not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving genre' });
    }
};

const createGenre = async (req, res) => {
    const { genre } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO genres (genre) VALUES ($1) RETURNING *',
            [genre]
        );
        client.release();
        if (result.rowCount > 0) {
            res.status(201).json(result.rows[0]);
        } else {
            res.status(400).json({ message: 'Error creating genre' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating genre' });
    }
};

const updateGenre = async (req, res) => {
    const { id } = req.params;
    const { genre } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query(
            'UPDATE genres SET genre = $1 WHERE id = $2 RETURNING *',
            [genre, id]
        );
        client.release();
        if (result.rowCount > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Genre not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating genre' });
    }
};

const deleteGenre = async (req, res) => {
    const { id } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM genres WHERE id = $1', [id]);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Genre deleted successfully' });
        } else {
            res.status(404).json({ message: 'Genre not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting genre' });
    }
};

module.exports = {
    getGenres,
    getGenreByID,
    createGenre,
    updateGenre,
    deleteGenre,
};
