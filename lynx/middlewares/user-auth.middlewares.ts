import { BaseMiddleware } from "../base.middleware";
import * as express from "express";
import { Middleware } from "../decorators";
import { verifyJwtToken } from "../libs/jwt";
import User from "../entities/user.entity";
import * as userLib from "../libs/users";
import App from "../app";

@Middleware("/*")
export default class UserAuthMiddleware extends BaseMiddleware {
    constructor(app: App) {
        super(app);
    }

    async apply(req: express.Request, res: express.Response) {
        let user = await userLib.retrieveUserFromSession(req);
        if (user) {
            (<any>req).user = user;
            return;
        }
        let token = req.get("Authorization");
        if (!token) return;
        try {
            token = token.substring("Bearer".length).trim();
            let decoded: any = await verifyJwtToken(
                token,
                this.app.config.tokenSecret
            );
            let id = decoded.id;
            let user = await User.findOneById(id);
            if (user) {
                (<any>req).user = user;
            }
        } catch (err) {
            console.error(err);
        }
    }
}
