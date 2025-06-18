import {Pool, PoolClient, QueryResult} from 'pg';
import {GenreRow} from "../types/genreTypes";

export class GenreRepository {
    constructor(private pool: Pool) {
    }

    public async capitalizeGenre(genre: string): Promise<string> {
        return genre.charAt(0).toUpperCase().concat(genre.slice(1));
    }

    public async doesGenreExist(genre: string, client?: PoolClient): Promise<boolean> {
        const connection: PoolClient = client ?? await this.pool.connect()
        try {
            const capitalizedGenre: string = await this.capitalizeGenre(genre);
            const result: QueryResult<{
                exists: boolean
            }> = await connection.query<{
                exists: boolean
            }>('SELECT EXISTS(SELECT 1 FROM genres WHERE genre = $1)', [capitalizedGenre])

            return result.rows[0].exists;
        } finally {
            if (!client) connection.release();
        }
    }

    public async getGenres(client?: PoolClient): Promise<GenreRow[] | null> {
        const connection: PoolClient = client ?? await this.pool.connect()
        try {
            const res: QueryResult<GenreRow> = await connection.query<GenreRow>('SELECT id, genre FROM genres ORDER BY id');
            if (res.rows.length === 0) return null;
            return res.rows
        } finally {
            if (!client) connection.release();
        }
    }

    public async getGenreByID(id: number, client?: PoolClient): Promise<GenreRow | null> {
        const connection: PoolClient = client ?? await this.pool.connect()
        try {
            const res: QueryResult<GenreRow> = await connection.query<GenreRow>('SELECT id, genre FROM genres WHERE id = $1', [id]);

            if (res.rows.length === 0) return null;
            return res.rows[0]
        } finally {
            if (!client) connection.release()
        }
    }

    public async createGenre(genre: string, client?: PoolClient): Promise<GenreRow | null> {
        const connection: PoolClient = client ?? await this.pool.connect()
        try {
            const capitalizedGenre: string = await this.capitalizeGenre(genre)
            const res: QueryResult<GenreRow> = await connection.query<GenreRow>('INSERT INTO genres (genre) VALUES ($1) RETURNING id, genre', [capitalizedGenre]);
            return res.rows[0];
        } finally {
            if (!client) connection.release();
        }
    }

    public async updateGenre(input: { id: number, genre: string }, client?: PoolClient): Promise<GenreRow | null> {
        const connection: PoolClient = client ?? await this.pool.connect()

        try {
            const res: QueryResult = await connection.query('UPDATE genres SET genre = $1 WHERE id = $2 RETURNING id, genre',
                [input.genre, input.id])

            if (res.rowCount === 0) return null;
            return res.rows[0];
        } finally {
            if (!client) connection.release();
        }
    }

    public async deleteGenre(id: number, client?: PoolClient): Promise<{ message: string } | null> {
        const connection: PoolClient = client ?? await this.pool.connect()

        try {
            // Delete genre
            const res: QueryResult = await connection.query('DELETE FROM genres WHERE id = $1', [id]);
            if (res.rowCount === 0) return null;
            return { message: 'Genre successfully deleted' }
        } finally {
            if (!client) connection.release();
        }
    }

}
