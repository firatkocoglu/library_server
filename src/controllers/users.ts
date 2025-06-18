import {UserService} from "../services/userServices";
import {RequestHandler, Request, Response} from "express";


export class UserController {
    constructor(private userService: UserService) {
    }

    public list: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        // Fetch all users
        const users = await this.userService.getUsers();
        const { error, status, users: fetchedUsers } = users;

        if (error) {
            res.status(status).json({ error });
            return;
        }

        res.status(status).json({ users: fetchedUsers });
        return;
    }

    public retrieve: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        const idNum: number = parseInt(id);
        if (isNaN(idNum)) {
            res.status(400).json({ error: 'Invalid user id' });
            return;
        }

        const user = await this.userService.getUserById(idNum)

        const { error, status, user: fetchedUser } = user;

        if (error) {
            res.status(status).json({ error });
            return;
        }

        res.status(status).json({ user: fetchedUser });
        return;
    }

    public delete: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        const idNum: number = parseInt(id);
        if (isNaN(idNum)) {
            res.status(400).json({ error: 'Invalid user id' });
            return;
        }

        // Delete user
        const deleteUser = await this.userService.deleteUser(idNum);

        const { error, status, message } = deleteUser

        if (error) {
            res.status(status).json({ error });
            return;
        }

        res.status(status).json({ message });
        return;
    }

    public update: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const fields = req.body;

        const idNum: number = parseInt(id);
        if (isNaN(idNum)) {
            res.status(400).json({ error: 'Invalid user id' });
            return;
        }

        const updateFields: Array<string> = Object.keys(fields);
        const updateValues: Array<string> = Object.values(fields);

        if (updateFields.length == 0 || updateValues.length == 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        const emptyFields = updateValues.find(value => value === '')

        if (emptyFields !== undefined) {
            res.status(400).json({ error: 'Empty fields are not allowed' });
            return;
        }

        const updatedUser = await this.userService.updateUser({ id: idNum, updateFields, updateValues });

        const { error, status, user } = updatedUser

        if (error) {
            res.status(status).json({ error });
            return;
        }

        res.status(status).json({ user });
        return;
    }
}



