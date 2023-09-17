import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";

//api route
export default async function fetchImages(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'POST') {

        const userID = req.body.userID;

        //create a key to store values in redis based on userID 
        const key = `images:${userID}`;

        //check if key exists in redis
        const cachedImages = await redis.get(key);

        //if key exists, return cached images
        if (cachedImages) {
            const images = JSON.parse(cachedImages);
            return res.status(200).json(images);
        }

        const { data, error } = await supabase
            .storage
            .from('images')
            .list(`${userID}`, {
                limit: 100,
                offset: 0
            });
        if (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        }
        else {
            //create signed url for each image
            const signedURLs = await Promise.all(data.map(async (image) => {
                const { data, error } = await supabase
                    .storage
                    .from('images')
                    .createSignedUrl(`${userID}/${image.name}`, 60);
                if (error) {
                    console.log(error);
                    res.status(500).json({ error: error.message });
                } else {
                    return data;
                }
            }))

            //store signed urls in redis
            await redis.set(key, JSON.stringify(signedURLs), 'EX', 59);
            res.status(200).json(signedURLs);

        }
    }
}