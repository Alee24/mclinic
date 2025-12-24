import { User } from '../../users/entities/user.entity';
export declare class Patient {
    id: number;
    user_id: number;
    user: User;
    fname: string;
    lname: string;
    mobile: string;
    dob: string;
    sex: string;
    address: string;
    latitude: number;
    longitude: number;
    createdAt: Date;
    updatedAt: Date;
}
