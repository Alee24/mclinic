export declare enum TestCategory {
    HEMATOLOGY = "Hematology",
    BIOCHEMISTRY = "Biochemistry",
    MICROBIOLOGY = "Microbiology",
    IMMUNOLOGY = "Immunology",
    PATHOLOGY = "Pathology",
    RADIOLOGY = "Radiology",
    OTHER = "Other"
}
export declare class LabTest {
    id: number;
    name: string;
    description: string;
    price: number;
    category: TestCategory;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
