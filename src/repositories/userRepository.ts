import {Pool, PoolClient, QueryResult} from 'pg';
import {UserRow} from '../types/dbTypes';

export class UserRepository {
    constructor(private pool: Pool) {
    }

    public async doesUserExistById(id: number, client?: PoolClient): Promise<boolean> {
        const connection: PoolClient = client ?? await this.pool.connect();

        try {
            const res: QueryResult = await connection.query('SELECT EXISTS(SELECT 1 FROM users WHERE id = $1) AS exists', [id])

            return !!res.rows[0].exists;
        } finally {
            if (!client) connection.release();
        }
    }

    public async fetchUsers(client?: PoolClient): Promise<UserRow[] | null> {
        const connection: PoolClient = client ?? await this.pool.connect();

        try {
            const res: QueryResult = await connection.query(
                'SELECT id, email, name, surname, is_admin FROM users ORDER BY id'
            );

            if (res.rows.length === 0) return null;
            return res.rows
        } finally {
            if (!client) connection.release();
        }
    }

    public async fetchUserById(id: number, client?: PoolClient): Promise<UserRow | null> {
        const connection: PoolClient = client ?? await this.pool.connect();

        try {
            const res: QueryResult = await connection.query('SELECT id, email, name, surname, is_admin FROM users WHERE id = $1', [id]);

            if (res.rows.length === 0) return null;
            return res.rows[0];
        } finally {
            if (!client) connection.release();
        }
    }

    public async removeUser(id: number, client?: PoolClient): Promise<{ message: string } | null> {
        const connection: PoolClient = client ?? await this.pool.connect();

        try {
            const res: QueryResult = await connection.query('DELETE FROM users WHERE id = $1', [id]);
            if (res.rowCount === 0) return null;
            return { message: 'User successfully deleted' }
        } finally {
            if (!client) connection.release()
        }

    }

    public async updateUser(input: {
        id: number,
        updateClause: string,
        updateValues: Array<string | number>
    }, client?: PoolClient): Promise<UserRow | null> {
        const connection: PoolClient = client ?? await this.pool.connect();
        const { id, updateClause, updateValues } = input
        try {
            const query: string = `UPDATE users
                                   SET ${ updateClause }
                                   WHERE id = $${ updateValues.length } RETURNING email, name, surname`

            const res: QueryResult = await connection.query(query, updateValues)

            if (res.rowCount === 0) return null;
            return res.rows[0];
        } finally {
            if (!client) connection.release()
        }
    }
}
