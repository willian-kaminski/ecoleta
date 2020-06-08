import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {

    async index(request: Request, response: Response) {

        // (Query params)
        const { city, uf, items } = request.query;

        const parsedItems = String(items).split(',').map(
            item => Number(item.trim()) > 0 ? Number(item.trim()) : 0);

        const deserializedPoints = await knex('points')
            .join('point_itens', 'points.id', '=', 'point_itens.point_id')
            .whereIn('point_itens.item_id', parsedItems)
            .where('points.city', String(city))
            .where('points.uf', String(uf))
            .select('points.*'); // image_url: `http://192.168.15.8:3333/uploads/${points.image}`,

        const serializedPoints = deserializedPoints.map(points => {

            return {
                ...deserializedPoints,
                
            };

        });

        const point = deserializedPoints.map(point => {
            return {
                "id": Number(point.id),
                "name": String(point.name),
                "email": String(point.email),
                "whatsapp": String(point.whatsapp),
                "latitude": Number(point.latitude),
                "longitude": Number(point.longitude),
                "city": String(point.city),
                "uf": String(point.uf),
                "image": String(point.image),
                "image_url": `http://192.168.15.8:3333/uploads/${point.image}`
            }
        })

        return response.json(point);

    }

    async show(request: Request, response: Response) {

        const { id } = request.params;
        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found.' })
        }

        const items = await knex('itens')
            .join('point_itens', 'itens.id', '=', 'point_itens.item_id')
            .where('point_itens.point_id', id);

        const serializedPoints = {
            ...point,
            image_url: `http://192.168.15.8:3333/uploads/${point.image}`,
        };

        return response.json({ point: serializedPoints, items });
    }

    async create(request: Request, response: Response) {

        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        const trx = await knex.transaction();

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }

        const pointInserted = await trx('points').insert(point).returning("id");

        const point_id = pointInserted[0];

        const point_items = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id: point_id
                };
            });

        await trx('point_itens').insert(point_items);

        await trx.commit();

        return response.json({
            id: point_id,
            ...point
        });

    }

}

export default PointsController;