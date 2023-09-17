import { NextApiRequest, NextApiResponse } from "next";
import { redis } from "@/lib/redis";
export default async function resetCache(req: NextApiRequest, res: NextApiResponse) {
    if(req.method == 'POST'){
        const userID = req.body.userID;
        const key = `images:${userID}`;
        await redis.del(key);
        res.status(200).json({message: 'Cache cleared'});
    }else{
        res.status(405).json({error: 'Method not allowed'});
    }
}