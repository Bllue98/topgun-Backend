import { Request, Response } from 'express';
import { CostsService } from '../services/costs.service';

interface IdParam {
  id: string;
}
interface KindParam {
  kind: string;
}
interface ResourceParam {
  resource: string;
}

export class CostController {
  constructor(private service: CostsService) {}

  // GET /costs
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const costs = await this.service.getAll();
      res.json(costs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch costs' });
    }
  }

  // GET /costs/:id
  public async getById(req: Request<IdParam>, res: Response): Promise<void> {
    try {
      const cost = await this.service.getById(req.params.id);
      res.json(cost);
    } catch {
      res.status(404).json({ error: 'Cost not found' });
    }
  }

  // POST /costs
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const newCost = await this.service.create(req.body);
      res.status(201).json(newCost);
    } catch (err) {
      res.status(400).json({ error: 'Failed to create cost' });
    }
  }

  // PUT /costs/:id
  public async update(req: Request<IdParam>, res: Response): Promise<void> {
    try {
      const updated = await this.service.update(req.params.id, req.body);
      res.json(updated);
    } catch {
      res.status(400).json({ error: 'Failed to update cost' });
    }
  }

  // DELETE /costs/:id
  public async delete(req: Request<IdParam>, res: Response): Promise<void> {
    try {
      await this.service.delete(req.params.id);
      res.sendStatus(204);
    } catch {
      res.status(404).json({ error: 'Cost not found' });
    }
  }

  // GET /costs/kind/:kind
  public async getByKind(req: Request<KindParam>, res: Response): Promise<void> {
    try {
      const list = await this.service.getByKind(req.params.kind);
      res.json(list);
    } catch {
      res.status(500).json({ error: 'Failed to fetch costs by kind' });
    }
  }

  // GET /costs/resource/:resource
  public async getByResource(req: Request<ResourceParam>, res: Response): Promise<void> {
    try {
      const list = await this.service.getByResource(req.params.resource);
      res.json(list);
    } catch {
      res.status(500).json({ error: 'Failed to fetch costs by resource' });
    }
  }
}
