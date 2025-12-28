import { LaboratoryService } from './laboratory.service';
export declare class LaboratoryController {
    private readonly labService;
    constructor(labService: LaboratoryService);
    getTests(): Promise<import("./entities/lab-test.entity").LabTest[]>;
    createTest(body: any): Promise<import("./entities/lab-test.entity").LabTest>;
    createOrder(req: any, body: {
        testId: number;
        patientId?: number;
    }): Promise<import("./entities/lab-order.entity").LabOrder>;
    getOrders(req: any): Promise<import("./entities/lab-order.entity").LabOrder[]>;
    getOrder(id: string): Promise<import("./entities/lab-order.entity").LabOrder | null>;
    updateStatus(id: string, body: {
        status: any;
    }): Promise<import("./entities/lab-order.entity").LabOrder | null>;
    addResults(id: string, body: {
        results: any[];
    }): Promise<import("./entities/lab-result.entity").LabResult[]>;
}
