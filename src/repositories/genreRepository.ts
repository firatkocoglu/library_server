import {Pool, PoolClient, QueryResult} from 'pg';
import {GenreBody, GenreRow} from "../types/genreTypes";

export class GenreRepository {
    constructor(private pool: Pool) {
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
    
}
