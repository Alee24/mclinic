import { AmbulanceService } from './ambulance.service';
export declare class AmbulanceController {
    private readonly service;
    constructor(service: AmbulanceService);
    getPackages(): Promise<import("./entities/ambulance-package.entity").AmbulancePackage[]>;
    createPackage(body: any): Promise<import("./entities/ambulance-package.entity").AmbulancePackage[]>;
    create(body: any, req: any): Promise<{
        subscription: any;
        invoice: import("../financial/entities/invoice.entity").Invoice | null;
    }>;
    getMySubscriptions(req: any): Promise<import("./entities/ambulance-subscription.entity").AmbulanceSubscription[]>;
    findOne(id: string): Promise<import("./entities/ambulance-subscription.entity").AmbulanceSubscription | null>;
}
