import {Pool, PoolClient} from "pg";
import {UserRepository} from "../repositories/userRepository";
import {UserRow} from "../types/dbTypes";

export class UserService {
    private userRepo: UserRepository;

    constructor(private pool: Pool) {
        this.userRepo = new UserRepository(pool);
    }

    public async getUsers(): Promise<{ error?: string, status: number, users?: UserRow[] }> {
        const client: PoolClient = await this.pool.connect();


        try {
            // Fetch users
            const users: UserRow[] | null = await this.userRepo.fetchUsers(client);
            if (!users) {
                return { error: 'No users found', status: 404 }
            }

            return { users, status: 200 }
        } catch (error) {
            console.error(error);
            return { error: 'Internal server error', status: 500 }
        } finally {
            client.release()
        }
    }

    public async getUserById(id: number): Promise<{ error?: string, status: number, user?: UserRow | null }> {
        const client: PoolClient = await this.pool.connect();

        try {
            // Fetch user
            const user: UserRow | null = await this.userRepo.fetchUserById(id, client)

            if (!user) {
                return { error: 'User not found', status: 404 }
            }

            return { user, status: 200 }
        } catch (error) {
            console.error(error);
            return { error: 'Internal server error', status: 500 }
        } finally {
            client.release()
        }
    }

    public async deleteUser(id: number): Promise<{ error?: string, status: number, message?: string }> {
        const client: PoolClient = await this.pool.connect();

        try {
            // First check whether exists
            const doesUserExist: boolean = await this.userRepo.doesUserExistById(id, client)

            if (!doesUserExist) {
                return { error: 'User not found', status: 404 }
            }

            // Delete user
            const deleteUser = await this.userRepo.removeUser(id, client)

            if (!deleteUser) {
                return { error: 'User cannot be deleted.', status: 404 }
            }

            return { message: deleteUser.message, status: 200 }
        } catch (error) {
            console.error(error);
            return { error: 'Internal server error', status: 500 }
        } finally {
            client.release()
        }
    }

    public async updateUser(input: {
        id: number,
        updateFields: Array<string>,
        updateValues: Array<string | number>
    }): Promise<{
        error?: string,
        status: number,
        user?: UserRow | null
    }> {
        const client: PoolClient = await this.pool.connect();

        const { id, updateFields, updateValues } = input

        try {
            // Check if the user exists
            const userExists: boolean = await this.userRepo.doesUserExistById(id, client)
            if (!userExists) return { error: 'User not found', status: 404 }

            // Create dynamic update clause
            const updateClause = updateFields
                .map((field, index) => `${ field } = $${ index + 1 }`)
                .join(', ');

            // Push the id as the last element of array
            updateValues.push(id);

            // Update user
            const updateUser: UserRow | null = await this.userRepo.updateUser({
                id,
                updateClause,
                updateValues
            }, client)

            if (!updateUser) return { error: 'User cannot be updated', status: 400 }

            return { user: updateUser, status: 200 }
        } catch (error) {
            console.error(error)
            return { error: 'Internal server error', status: 500 }
        } finally {
            client.release()
        }

    }
}