import {Pool, PoolClient} from 'pg';
import {GenreRepository} from "../repositories/genreRepository";
import {GenreRow} from "../types/genreTypes";

export class GenreService {
    private genreRepo: GenreRepository;

    constructor(private pool: Pool) {
        this.genreRepo = new GenreRepository(pool)
    }

    public async getGenres(): Promise<{ error?: string, status: number, genres?: GenreRow[] }> {
        const client: PoolClient = await this.pool.connect();

        try {
            const genres: GenreRow[] | null = await this.genreRepo.getGenres(client);

            if (!genres) {
                return { error: 'No genres found', status: 404 }
            }

            return { genres, status: 200 }
        } catch (error) {
            console.error(error);
            return { error: 'Internal server error', status: 500 }
        } finally {
            client.release();
        }
    }

    public async getGenreById(id: number): Promise<{ error?: string, status: number, genre?: GenreRow | null }> {
        const client: PoolClient = await this.pool.connect();

        try {
            const genre: GenreRow | null = await this.genreRepo.getGenreByID(id, client);

            if (!genre) {
                return { error: 'Genre not found', status: 404 }
            }
            return { status: 200, genre }
        } catch (error) {
            console.error(error);
            return { error: 'Internal server error', status: 500 }
        } finally {
            client.release();
        }
    }

    public async createGenre(genre: string): Promise<{ error?: string, status: number, genre?: GenreRow }> {
        const client: PoolClient = await this.pool.connect();

        try {
            // Check whether a given genre already exists
            const exists: boolean = await this.genreRepo.doesGenreExist(genre, client);

            // If exists return an error
            if (exists) {
                return { error: 'Genre already exists', status: 400 }
            }

            // Create new genre
            const newGenre: GenreRow | null = await this.genreRepo.createGenre(genre, client);

            if (!newGenre) {
                return { error: 'Genre cannot be created', status: 400 }
            }

            return { genre: newGenre, status: 201 }
        } catch (error) {
            console.error(error);
            return { status: 500, error: 'Internal server error' };
        } finally {
            client.release();
        }
    }

    public async updateGenre(id: number, genre: string): Promise<{
        error?: string,
        status: number,
        genre?: GenreRow | null
    }> {
        const client: PoolClient = await this.pool.connect();

        try {
            // Check the genre with given id exists
            const genreWithIdExists: GenreRow | null = await this.genreRepo.getGenreByID(id, client);
            if (!genreWithIdExists) {
                return { error: 'Genre with given ID not found', status: 400 }
            }

            // Capitalize genre
            const capitalizedGenre: string = await this.genreRepo.capitalizeGenre(genre);

            // Check whether the given genre name already exists
            const updateContentExists = await this.genreRepo.doesGenreExist(capitalizedGenre, client);
            if (updateContentExists) {
                return { error: "Genre already exists", status: 400 }
            }

            // Update genre
            const updatedGenre: GenreRow | null = await this.genreRepo.updateGenre({ id, genre }, client)
            if (!updatedGenre) return { error: "Genre cannot be updated", status: 400 }

            return { genre: updatedGenre, status: 200 }
        } catch (error) {
            console.error(error);
            return { error: 'Internal server error', status: 500 }
        } finally {
            client.release();
        }
    }

    public async deleteGenre(id: number): Promise<{ error?: string, status: number, message?: string }> {
        const client: PoolClient = await this.pool.connect();

        try {
            // Check whether genre exists
            const genre: GenreRow | null = await this.genreRepo.getGenreByID(id, client);
            if (!genre) return { error: 'Genre not found', status: 400 }

            // Delete genre
            const deletedGenre: { message: string } | null = await this.genreRepo.deleteGenre(id, client);

            if (!deletedGenre) return { error: "Genre cannot be deleted", status: 400 }

            return { message: deletedGenre.message, status: 200 }
        } catch (error) {
            console.error(error);
            return { error: 'Internal server error', status: 500 }
        }
    }
}