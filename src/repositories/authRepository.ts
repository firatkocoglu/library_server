import {Pool, PoolClient, QueryResult} from "pg";
import {UserRow} from "../types/dbTypes";


export class AuthRepository {
    constructor(private pool: Pool) {
    }

    public async doesUserExistByEmail(email: string, client?: PoolClient): Promise<boolean> {
        const connection: PoolClient = client ?? await this.pool.connect();
        try {
            const res: QueryResult<{ exists: boolean }> = await connection.query<{ exists: boolean }>(
                'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists',
                [email]
            )

            return res.rows[0].exists;
        } catch (error) {
            console.error(error)
            throw new Error('Unable to execute query')
        } finally {
            if (!client) connection.release();
        }
    }

    public async createUser(input: {
        email: string,
        password: string,
        name: string,
        surname: string
    }, client?: PoolClient): Promise<Omit<UserRow, 'password'>> {
        const connection: PoolClient = client ?? await this.pool.connect();
        try {
            const res: QueryResult<Omit<UserRow, 'password'>> = await connection.query<Omit<UserRow, "password">>(
                "INSERT INTO users (email, password, name, surname) VALUES ($1, $2, $3, $4) RETURNING id, email, name, surname, is_admin",
                [input.email, input.password, input.name, input.surname]
            )
            return res.rows[0];
        } finally {
            if (!client) connection.release();
        }
    }

    public async loginUser(input: {
        email: string,
        password: string
    }, client?: PoolClient): Promise<UserRow | null> {
        const connection: PoolClient = client ?? await this.pool.connect();
        try {
            const res: QueryResult<UserRow> = await connection.query<UserRow>("SELECT id, email, name, surname, is_admin, password FROM users WHERE email = $1", [
                input.email,
            ])

            if (res.rows.length === 0) return null;
            return res.rows[0];
        } finally {
            if (!client) connection.release();
        }
    }
}