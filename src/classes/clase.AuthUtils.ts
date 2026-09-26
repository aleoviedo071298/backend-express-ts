import * as bcrypt from "bcryptjs";
import crypto from "crypto";

export class AuthUtils {
    public static async createUUid(){
        return crypto.randomUUID()
    }
    public static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    public static async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}