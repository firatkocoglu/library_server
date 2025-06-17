import {GenreService} from "../services/genreServices";
import {RequestHandler, Request, Response} from "express";
import {GenreBody} from "../types/genreTypes";

export class GenreController {
    constructor(private genreService: GenreService) {
    }

    public list: RequestHandler = async (req: Request, res: Response): Promise<void> => {
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

    public retrieve: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        const idNum = parseInt(id);
        if (isNaN(idNum)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }

        const fetchGenre = await this.genreService.getGenreById(idNum);

        const { error, status, genre } = fetchGenre;

        if (error) {
            res.status(status).json({ message: error });
            return;
        }

        res.status(status).json({ genre });
    }

    public create: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { genre } = req.body as GenreBody;

        if (!genre.trim()) {
            res.status(400).json({ message: 'Genre is required' });
            return;
        }

        // Create a new genre
        const newGenre = await this.genreService.createGenre(genre);

        const { error, status, genre: createdGenre } = newGenre

        if (error) {
            res.status(status).json({ message: error });
            return;
        }

        res.status(status).json({ genre: createdGenre });
        return;
    }

    public update: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { genre } = req.body as GenreBody;

        const idNum = parseInt(id);
        if (isNaN(idNum)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }

        if (!genre.trim()) {
            res.status(400).json({ message: 'Genre is required' });
            return;
        }

        const updateGenre = await this.genreService.updateGenre(idNum, genre);

        const { error, status, genre: updatedGenre } = updateGenre;

        if (error) {
            res.status(status).json({ message: error });
            return;
        }

        res.status(status).json({ genre: updatedGenre });
        return;
    }

    public delete: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        const idNum = parseInt(id);
        if (isNaN(idNum)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }

        const deleteGenre = await this.genreService.deleteGenre(idNum);

        const { error, message, status } = deleteGenre

        if (error) {
            res.status(status).json({ message: error });
            return;
        }

        res.status(status).json({ message });
        return
    };
}




