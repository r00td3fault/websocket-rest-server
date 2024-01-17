

export interface Ticket {
    id: string;
    number: number;
    createdAt: Date;
    done: boolean;
    handleAtDesk?: string; // Escritorio 1
    handleAt?: Date;
}