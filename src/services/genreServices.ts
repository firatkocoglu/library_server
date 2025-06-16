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

    public async getGenreByID(id: number): Promise<{ error?: string, status: number, genre?: GenreRow | null }> {
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
}