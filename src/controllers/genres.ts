import pool from '../db';
import {GenreService} from "../services/genreServices";
import {RequestHandler, Request, Response, NextFunction} from "express";

export class GenreController {
    constructor(private genreService: GenreService) {
    }

    public list: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Fetch all genres
        const fetchGenres = await this.genreService.getGenres();

        const { error, status, genres } = fetchGenres;
        // Check if there is an error
        if (error) {
            res.status(status).json({ message: error });
            return;
        }

        res.status(status).json({ genres });
    }

    public retrieve: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const fetchGenre = await this.genreService.getGenreByID(id);

        const { error, status, genre } = fetchGenre;

        if (error) {
            res.status(status).json({ message: error });
            return;
        }

        res.status(status).json({ genre });
    }
}

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

export {getGenres};
